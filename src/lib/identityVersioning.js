import { base44 } from "@/api/base44Client";
import { PARSER_VERSION, calculateCompleteness } from "@/lib/resumeSync";

// ============================================================
// EXECUTIVE IDENTITY — VERSIONING & DATA MANAGEMENT
// Snapshots, restore, and granular reset for AI-imported data.
// ============================================================

const IMPORTED_SCALAR_FIELDS = {
  executive: ["professional_headline", "bio", "industry", "years_experience", "current_company", "current_role"],
  social: ["linkedin_url", "github_url", "portfolio_url", "website_url"],
  target: ["target_company", "target_role", "target_country", "expected_salary", "preferred_industry", "work_preference"],
};

const IMPORTED_ARRAY_SECTIONS = ["experience", "education", "certifications", "skills", "languages", "projects", "awards"];

function emptyVal(val) {
  if (typeof val === "boolean") return false;
  if (typeof val === "number") return null;
  return "";
}

// ------------------------------------------------------------
// CLEAR / RESET FUNCTIONS
// ------------------------------------------------------------

export function clearImportedData(form) {
  const next = { ...form };
  for (const fields of Object.values(IMPORTED_SCALAR_FIELDS)) {
    for (const f of fields) next[f] = emptyVal(next[f]);
  }
  for (const s of IMPORTED_ARRAY_SECTIONS) next[s] = [];
  return next;
}

export function clearResumeData(form) {
  return { ...clearImportedData(form), resume_url: "" };
}

export function resetExecutiveIdentity(form) {
  const next = clearImportedData(form);
  next.first_name = "";
  next.last_name = "";
  next.full_name = "";
  next.display_name = "";
  next.preferred_name = "";
  next.mobile_number = "";
  next.city = "";
  next.country = "";
  next.professional_headline = "";
  next.bio = "";
  next.resume_url = "";
  return next;
}

export function clearSection(form, sectionId) {
  const next = { ...form };
  if (IMPORTED_SCALAR_FIELDS[sectionId]) {
    for (const f of IMPORTED_SCALAR_FIELDS[sectionId]) next[f] = emptyVal(next[f]);
  } else if (IMPORTED_ARRAY_SECTIONS.includes(sectionId)) {
    next[sectionId] = [];
  }
  return next;
}

export const CLEARABLE_SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "executive", label: "Executive Profile" },
  { id: "languages", label: "Languages" },
  { id: "projects", label: "Projects" },
  { id: "awards", label: "Awards" },
  { id: "social", label: "Social Links" },
  { id: "target", label: "Target Career" },
];

// ------------------------------------------------------------
// VERSION SNAPSHOTS
// ------------------------------------------------------------

function safeParse(json, fallback) {
  try { const v = JSON.parse(json); return v || fallback; } catch { return fallback; }
}

export function parseSnapshot(version) {
  return safeParse(version?.snapshot_json, {});
}

export function summarizeForm(form) {
  if (!form) return {};
  return {
    headline: form.professional_headline || "—",
    company: form.current_company || "—",
    experience: form.experience?.length || 0,
    education: form.education?.length || 0,
    certifications: form.certifications?.length || 0,
    skills: form.skills?.length || 0,
    languages: form.languages?.length || 0,
    projects: form.projects?.length || 0,
    awards: form.awards?.length || 0,
  };
}

export async function createSnapshot(form, metadata = {}) {
  try {
    const existing = await base44.entities.IdentityVersion.list("-version_number", 1);
    const nextVersion = (existing[0]?.version_number || 0) + 1;
    return await base44.entities.IdentityVersion.create({
      version_number: nextVersion,
      label: metadata.label || `Executive Identity V${nextVersion}`,
      snapshot_json: JSON.stringify(form),
      import_source: metadata.import_source || "manual",
      source_resume_url: metadata.source_resume_url || "",
      source_resume_name: metadata.source_resume_name || "",
      confidence_score: metadata.confidence_score ?? 0,
      parser_version: metadata.parser_version || PARSER_VERSION,
      imported_by: metadata.imported_by || "Resume Parser",
      completeness_score: metadata.completeness_score ?? calculateCompleteness(form).overall,
      change_summary: metadata.change_summary || "",
    });
  } catch (e) {
    return null;
  }
}

export function averageConfidence(confidenceMap) {
  if (!confidenceMap) return 0;
  const vals = Object.values(confidenceMap).filter((v) => typeof v === "number");
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export async function listVersions() {
  try {
    return await base44.entities.IdentityVersion.list("-version_number", 50);
  } catch (e) {
    return [];
  }
}

export async function deleteVersion(id) {
  try {
    await base44.entities.IdentityVersion.delete(id);
    return true;
  } catch (e) {
    return false;
  }
}

export async function duplicateVersion(version) {
  const snapshot = parseSnapshot(version);
  return await createSnapshot(snapshot, {
    label: `${version.label || "Executive Identity"} (Copy)`,
    import_source: "duplicate",
    source_resume_url: version.source_resume_url,
    source_resume_name: version.source_resume_name,
    confidence_score: version.confidence_score,
    parser_version: version.parser_version,
    imported_by: version.imported_by,
    completeness_score: version.completeness_score,
    change_summary: "Duplicated version",
  });
}