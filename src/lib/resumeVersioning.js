import { base44 } from "@/api/base44Client";

/**
 * Resume Version Intelligence™
 * ============================================================
 * Content-based version detection for Resume Version History™.
 *
 * Versions are ONLY created when the resume content actually changes.
 * Analysis results (Truth Engine, Skill Gap, Learning Roadmap, etc.)
 * update the EXISTING version in place — they never spawn new versions.
 */

// ------------------------------------------------------------
// CONTENT NORMALIZATION & HASHING
// ------------------------------------------------------------

/**
 * Normalizes extracted resume data into a deterministic canonical string.
 * Strips metadata (_confidence, analysis-only fields) and sorts arrays
 * so identical content always produces the same hash regardless of
 * field ordering or analysis re-runs.
 */
function normalizeResumeContent(data) {
  if (!data || typeof data !== "object") return "";
  const STRIP_KEYS = new Set([
    "_confidence", "executive_readiness_score", "promotion_readiness",
    "leadership_maturity", "commercial_maturity", "executive_presence",
    "communication_assessment", "learning_roadmap", "enhancement_report",
    "truth_engine_report", "skill_gap_analysis", "ai_analysis",
  ]);

  const normalize = (val) => {
    if (val == null) return null;
    if (typeof val === "string") return val.trim().toLowerCase();
    if (typeof val === "number" || typeof val === "boolean") return val;
    if (Array.isArray(val)) {
      const items = val.map(normalize).filter((v) => v !== null && v !== "" && v !== undefined);
      // Sort string items for deterministic ordering; objects sorted by JSON
      return items.sort((a, b) => {
        const sa = typeof a === "object" ? JSON.stringify(a) : String(a);
        const sb = typeof b === "object" ? JSON.stringify(b) : String(b);
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      });
    }
    if (typeof val === "object") {
      const result = {};
      for (const key of Object.keys(val).sort()) {
        if (STRIP_KEYS.has(key)) continue;
        const nv = normalize(val[key]);
        if (nv !== null && nv !== "" && nv !== undefined) result[key] = nv;
      }
      return result;
    }
    return val;
  };

  return JSON.stringify(normalize(data));
}

/**
 * Produces a compact hash (djb2 algorithm) from the normalized content.
 * Synchronous — no crypto.subtle needed.
 */
function contentHash(data) {
  const str = normalizeResumeContent(data);
  if (!str) return "empty";
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  // Base36 for compact representation
  return (hash >>> 0).toString(36);
}

export { contentHash, normalizeResumeContent };

// ------------------------------------------------------------
// SMART VERSION SAVE — content-based deduplication
// ------------------------------------------------------------

/**
 * Saves a resume version with content-based deduplication.
 *
 * Rules:
 *   • If the latest version has the SAME content hash → update analysis
 *     results on that existing version (no new version created).
 *   • If the content is different (or no prior version exists) → create
 *     a new version, mark it as current, and unmark the previous current.
 *
 * @param {object} params
 * @param {string} params.fileUrl - Resume file URL
 * @param {string} params.fileName - Resume file name
 * @param {object} params.extractedData - Parsed resume content
 * @param {string} params.createdBy - "user" | "ai" | "system"
 * @param {string} params.creationReason - "upload" | "manual_edit" | "ai_rewrite" | "save_as_new" | "onboarding" | "import"
 * @param {string} [params.learningRoadmap] - Analysis: learning roadmap
 * @param {string} [params.enhancementReport] - Analysis: truth engine report
 * @param {boolean} [params.forceNew] - Bypass dedup (for explicit "Save as New Version")
 * @returns {object} { version, isNew, action }
 */
export async function saveResumeVersionSmart({
  fileUrl,
  fileName,
  extractedData,
  createdBy = "user",
  creationReason = "upload",
  learningRoadmap,
  enhancementReport,
  forceNew = false,
}) {
  try {
    const hash = contentHash(extractedData);
    const latest = await base44.entities.ResumeVersion.list("-version_number", 1);

    // Content deduplication — unless forced
    if (!forceNew && latest.length > 0 && latest[0].content_hash === hash) {
      // Same content → update analysis results on the existing version
      const updateFields = {};
      if (learningRoadmap !== undefined) updateFields.learning_roadmap = learningRoadmap;
      if (enhancementReport !== undefined) updateFields.enhancement_report = enhancementReport;

      if (Object.keys(updateFields).length > 0) {
        await base44.entities.ResumeVersion.update(latest[0].id, updateFields);
      }

      return {
        version: { ...latest[0], ...updateFields },
        isNew: false,
        action: "updated_existing",
      };
    }

    // Content changed (or first version) → create new
    const nextVersion = (latest[0]?.version_number || 0) + 1;

    // Unmark previous current version
    if (latest[0]?.is_current) {
      await base44.entities.ResumeVersion.update(latest[0].id, { is_current: false });
    }

    const version = await base44.entities.ResumeVersion.create({
      file_url: fileUrl,
      file_name: fileName,
      version_number: nextVersion,
      extracted_data: JSON.stringify(extractedData),
      content_hash: hash,
      created_by: createdBy,
      creation_reason: creationReason,
      is_current: true,
      learning_roadmap: learningRoadmap || "",
      enhancement_report: enhancementReport || "",
    });

    return { version, isNew: true, action: "created_new" };
  } catch (e) {
    return { version: null, isNew: false, action: "error", error: e.message };
  }
}

/**
 * Updates analysis results on an existing version WITHOUT creating a new one.
 * Used by: Truth Engine, Skill Gap, Learning Roadmap, Executive Profile
 * recalculations — these are analysis executions, not content changes.
 */
export async function updateVersionAnalysis(versionId, { learningRoadmap, enhancementReport }) {
  try {
    const updateFields = {};
    if (learningRoadmap !== undefined) updateFields.learning_roadmap = learningRoadmap;
    if (enhancementReport !== undefined) updateFields.enhancement_report = enhancementReport;
    if (Object.keys(updateFields).length === 0) return null;
    return await base44.entities.ResumeVersion.update(versionId, updateFields);
  } catch (e) {
    return null;
  }
}

/**
 * Marks a specific version as the current one, unmarking all others.
 */
export async function setCurrentVersion(versionId) {
  try {
    const all = await base44.entities.ResumeVersion.list("-version_number", 50);
    const updates = all
      .filter((v) => v.id !== versionId && v.is_current)
      .map((v) => base44.entities.ResumeVersion.update(v.id, { is_current: false }));
    await Promise.all(updates);
    return await base44.entities.ResumeVersion.update(versionId, { is_current: true });
  } catch (e) {
    return null;
  }
}

/**
 * Returns deduplicated versions for the timeline — collapses consecutive
 * versions with identical content_hash, keeping only the first occurrence
 * of each unique content fingerprint.
 */
export function deduplicateVersions(versions) {
  if (!versions || versions.length === 0) return [];
  const seen = new Set();
  const result = [];
  // versions are sorted newest-first; keep the newest of each hash
  for (const v of versions) {
    const hash = v.content_hash || contentHash(safeParse(v.extracted_data));
    if (!seen.has(hash)) {
      seen.add(hash);
      result.push(v);
    }
  }
  return result;
}

function safeParse(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
}