import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";

// ============================================================
// RESUME → EXECUTIVE IDENTITY — SMART MAPPING ENGINE 3.0
// Extracts, confidence-scores, and maps resume data into the
// Executive Identity Center with minimal manual review.
// ============================================================

// ------------------------------------------------------------
// SECTION REGISTRY (shared by engine + review UI)
// ------------------------------------------------------------

export const SYNC_SECTIONS = [
  {
    id: "personal", label: "Personal Info", type: "scalar", fields: [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "mobile_number", label: "Phone" },
      { key: "email", label: "Email", displayOnly: true },
      { key: "city", label: "City" },
      { key: "country", label: "Country" },
      { key: "linkedin_url", label: "LinkedIn" },
      { key: "github_url", label: "GitHub" },
      { key: "portfolio_url", label: "Portfolio" },
      { key: "website_url", label: "Website" },
    ],
  },
  {
    id: "executive", label: "Executive Profile", type: "scalar", fields: [
      { key: "professional_headline", label: "Headline" },
      { key: "bio", label: "Executive Summary" },
      { key: "industry", label: "Industry" },
      { key: "years_experience", label: "Years Experience" },
      { key: "current_company", label: "Current Employer" },
      { key: "current_role", label: "Current Role" },
    ],
  },
  { id: "experience", label: "Work Experience", type: "array", keyField: "company", itemLabel: (i) => `${i.role || "Role"} · ${i.company || "Company"}` },
  { id: "education", label: "Education", type: "array", keyField: "school", itemLabel: (i) => `${i.degree || "Degree"} · ${i.school || "School"}` },
  { id: "certifications", label: "Certifications", type: "array", keyField: "name", itemLabel: (i) => i.name || "Certification" },
  { id: "skills", label: "Skills", type: "array", itemLabel: (i) => i },
  { id: "languages", label: "Languages", type: "array", itemLabel: (i) => i },
  { id: "projects", label: "Projects", type: "array", keyField: "name", itemLabel: (i) => i.name || "Project" },
  { id: "awards", label: "Awards", type: "array", keyField: "title", itemLabel: (i) => i.title || "Award" },
];

// ------------------------------------------------------------
// CONFIDENCE ENGINE
// 95-100: auto-accept  |  80-94: accepted, reviewable  |  <80: review
// ------------------------------------------------------------

export function getConfidenceTier(score) {
  if (score == null) return { id: "low", label: "Needs Review" };
  if (score >= 95) return { id: "high", label: "Auto-Accepted" };
  if (score >= 80) return { id: "medium", label: "Accepted" };
  return { id: "low", label: "Needs Review" };
}

export function sectionHasData(form, section) {
  if (!form) return false;
  if (section.type === "scalar") {
    return section.fields.some((f) => {
      const v = form[f.key];
      if (v == null || v === "") return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    });
  }
  return (form[section.id]?.length || 0) > 0;
}

/**
 * Builds default per-section decisions based on confidence.
 * High/medium → auto-accept (merge for arrays with existing data).
 * Low → skip (requires explicit user review).
 */
export function buildAutoDecisions(extractedForm, currentForm) {
  const decisions = {};
  for (const section of SYNC_SECTIONS) {
    const score = extractedForm?._confidence?.[section.id] ?? 0;
    const hasNew = sectionHasData(extractedForm, section);
    const hasCurrent = sectionHasData(currentForm, section);
    if (!hasNew) {
      decisions[section.id] = "skip";
    } else if (score >= 80) {
      decisions[section.id] = section.type === "array" && hasCurrent ? "merge" : "accept";
    } else {
      decisions[section.id] = "skip";
    }
  }
  return decisions;
}

// ------------------------------------------------------------
// EXTRACTION SCHEMA
// ------------------------------------------------------------

export const IDENTITY_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    personal_info: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        city: { type: "string" },
        country: { type: "string" },
        linkedin_url: { type: "string" },
        github_url: { type: "string" },
        portfolio_url: { type: "string" },
        website_url: { type: "string" },
      },
    },
    executive_profile: {
      type: "object",
      properties: {
        professional_headline: { type: "string" },
        bio: { type: "string" },
        industry: { type: "string" },
        years_experience: { type: "number" },
        current_company: { type: "string" },
        current_role: { type: "string" },
      },
    },
    work_experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          employment_type: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          current: { type: "boolean" },
          responsibilities: { type: "array", items: { type: "string" } },
          achievements: { type: "array", items: { type: "string" } },
          technologies: { type: "array", items: { type: "string" } },
          leadership_scope: { type: "string" },
          team_size: { type: "number" },
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          major: { type: "string" },
          graduation_year: { type: "string" },
        },
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          type: { type: "string" },
        },
      },
    },
    skills: { type: "array", items: { type: "string" } },
    languages: { type: "array", items: { type: "string" } },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          technologies: { type: "array", items: { type: "string" } },
          url: { type: "string" },
        },
      },
    },
    awards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          issuer: { type: "string" },
          date: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    confidence: {
      type: "object",
      properties: {
        personal_info: { type: "number" },
        executive_profile: { type: "number" },
        work_experience: { type: "number" },
        education: { type: "number" },
        certifications: { type: "number" },
        skills: { type: "number" },
        languages: { type: "number" },
        projects: { type: "number" },
        awards: { type: "number" },
      },
    },
  },
};

export const buildIdentityExtractionPrompt = () =>
  `You are an expert resume parser powering an Executive Identity Smart Mapping Engine.

Analyze the attached resume and extract ALL of the following with maximum accuracy. Never invent information — only extract what is explicitly stated.

**Personal Information:** first_name, last_name (split the full name), email, phone, city, country (full country name), linkedin_url, github_url, portfolio_url, website_url (full URLs).

**Executive Profile:** professional_headline (e.g., "Senior Director, Cloud Infrastructure"), bio (2-3 sentence executive summary based on resume content), industry, years_experience (total years as a number), current_company (most recent employer), current_role (most recent job title).

**Work Experience:** One entry per position — company, role, employment_type (Full-time, Contract, Part-time, Internship), start_date (YYYY-MM), end_date, current (true if ongoing), responsibilities (array of bullet points), achievements (array of bullet points with metrics), technologies (array), leadership_scope (e.g., "Led team of 15 across 3 regions"), team_size (number of reports).

**Education:** One entry per degree — school, degree (e.g., "MBA", "B.S."), major, graduation_year.

**Certifications:** name, issuer, type (one of: Microsoft, AWS, Google, Cisco, ServiceNow, ITIL, CompTIA, PMI, Scrum, Other).

**Skills:** Flat array covering Leadership, Cloud, ITSM, Cybersecurity, AI, Automation, Governance, Project Management, Communication.

**Languages:** Array of spoken/written languages (e.g., "English", "Spanish").

**Projects:** name, description, technologies (array), url.

**Awards:** title, issuer, date, description.

**CONFIDENCE SCORING (critical):** For EACH section, provide a confidence score 0-100 in the "confidence" object reflecting how clearly and completely the data was extracted:
- 95-100: Data explicitly stated and unambiguous
- 80-94: Data present but partially inferred or reformatted
- Below 80: Data uncertain, ambiguous, or likely incomplete

Return as structured JSON.`;

// ------------------------------------------------------------
// MAPPING: Extracted data → Profile form fields
// ------------------------------------------------------------

const CERT_TYPE_PATTERNS = [
  { type: "Microsoft", test: /microsoft|azure|mcsa|mcse|mcp|az-/i },
  { type: "AWS", test: /aws|amazon web services|solution architect.*aws/i },
  { type: "Google", test: /google|gcp|google cloud/i },
  { type: "Cisco", test: /cisco|ccna|ccnp|ccie|ccda/i },
  { type: "ServiceNow", test: /servicenow|csa|cis/i },
  { type: "ITIL", test: /itil/i },
  { type: "CompTIA", test: /comptia|a\+|network\+|security\+/i },
  { type: "PMI", test: /pmp|pmi|capm|prince2/i },
  { type: "Scrum", test: /scrum|csm|psm/i },
];

function detectCertType(name, issuer) {
  const text = `${name || ""} ${issuer || ""}`;
  for (const { type, test } of CERT_TYPE_PATTERNS) {
    if (test.test(text)) return type;
  }
  return "Other";
}

function normalizeDate(dateStr) {
  if (!dateStr) return "";
  return dateStr;
}

const CONF_KEY_MAP = {
  personal: "personal_info",
  executive: "executive_profile",
  experience: "work_experience",
  education: "education",
  certifications: "certifications",
  skills: "skills",
  languages: "languages",
  projects: "projects",
  awards: "awards",
};

export function mapExtractedToForm(extracted) {
  if (!extracted) return null;
  const pi = extracted.personal_info || {};
  const ep = extracted.executive_profile || {};

  let firstName = pi.first_name || "";
  let lastName = pi.last_name || "";
  if (!firstName && !lastName && pi.full_name) {
    const parts = pi.full_name.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  const form = {
    first_name: firstName,
    last_name: lastName,
    email: pi.email || "",
    mobile_number: pi.phone || "",
    city: pi.city || "",
    country: pi.country || "",
    linkedin_url: pi.linkedin_url || "",
    github_url: pi.github_url || "",
    portfolio_url: pi.portfolio_url || "",
    website_url: pi.website_url || "",
    professional_headline: ep.professional_headline || "",
    bio: ep.bio || "",
    industry: ep.industry || "",
    years_experience: ep.years_experience || null,
    current_company: ep.current_company || "",
    current_role: ep.current_role || "",
    experience: (extracted.work_experience || []).map((exp) => ({
      company: exp.company || "",
      role: exp.role || "",
      employment_type: exp.employment_type || "",
      start_date: normalizeDate(exp.start_date),
      end_date: exp.current ? "Present" : normalizeDate(exp.end_date),
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities.join("\n") : exp.responsibilities || "",
      achievements: Array.isArray(exp.achievements) ? exp.achievements.join("\n") : exp.achievements || "",
      technologies: Array.isArray(exp.technologies) ? exp.technologies.join(", ") : exp.technologies || "",
      leadership_scope: exp.leadership_scope || "",
      team_size: exp.team_size || "",
    })),
    education: (extracted.education || []).map((edu) => ({
      school: edu.school || "",
      degree: edu.degree || "",
      major: edu.major || "",
      graduation_year: edu.graduation_year || "",
    })),
    certifications: (extracted.certifications || []).map((cert) => ({
      type: cert.type || detectCertType(cert.name, cert.issuer),
      name: cert.name || "",
    })),
    skills: extracted.skills || [],
    languages: extracted.languages || [],
    projects: (extracted.projects || []).map((p) => ({
      name: p.name || "",
      description: p.description || "",
      technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "",
      url: p.url || "",
    })),
    awards: (extracted.awards || []).map((a) => ({
      title: a.title || "",
      issuer: a.issuer || "",
      date: a.date || "",
      description: a.description || "",
    })),
  };

  // Build confidence map (fallback: infer medium when AI omits scores but data exists)
  const rawConf = extracted.confidence || {};
  const confidence = {};
  for (const section of SYNC_SECTIONS) {
    const rawKey = CONF_KEY_MAP[section.id];
    let score = rawConf[rawKey];
    if (score == null || score === 0) {
      score = sectionHasData(form, section) ? 88 : 0;
    }
    confidence[section.id] = score;
  }
  form._confidence = confidence;

  return form;
}

// ------------------------------------------------------------
// EXTRACTION ENTRY POINT
// ------------------------------------------------------------

export async function extractResumeIdentity(fileUrl) {
  const result = await callAI("resume", {
    prompt: buildIdentityExtractionPrompt(),
    file_urls: [fileUrl],
    response_json_schema: IDENTITY_EXTRACTION_SCHEMA,
  });
  return mapExtractedToForm(result);
}

// ------------------------------------------------------------
// PROFILE COMPLETENESS CALCULATOR
// ------------------------------------------------------------

export function calculateCompleteness(form) {
  if (!form) return { sections: {}, overall: 0 };
  const sections = {};

  const personalFields = ["first_name", "last_name", "mobile_number", "country", "city", "timezone"];
  const personalFilled = personalFields.filter((f) => form[f]?.toString().trim()).length;
  sections.personal = { label: "Personal Information", score: Math.round((personalFilled / personalFields.length) * 100), filled: personalFilled, total: personalFields.length };

  const execFields = ["professional_headline", "bio", "industry", "years_experience", "current_company", "current_role"];
  const execFilled = execFields.filter((f) => form[f]?.toString().trim()).length;
  sections.executive = { label: "Executive Profile", score: Math.round((execFilled / execFields.length) * 100), filled: execFilled, total: execFields.length };

  const expCount = form.experience?.length || 0;
  const expComplete = form.experience?.filter((e) => e.company && e.role).length || 0;
  sections.experience = { label: "Experience", score: expCount === 0 ? 0 : Math.round((expComplete / expCount) * 100), filled: expComplete, total: expCount };

  const eduCount = form.education?.length || 0;
  sections.education = { label: "Education", score: eduCount > 0 ? 100 : 0, filled: eduCount, total: eduCount };

  const certCount = form.certifications?.length || 0;
  const certComplete = form.certifications?.filter((c) => c.name).length || 0;
  sections.certifications = { label: "Certifications", score: certCount === 0 ? 0 : Math.round((certComplete / certCount) * 100), filled: certComplete, total: certCount };

  const skillCount = form.skills?.length || 0;
  sections.skills = { label: "Skills", score: Math.min(100, Math.round((skillCount / 10) * 100)), filled: skillCount, total: 10 };

  const socialFields = ["linkedin_url", "github_url", "portfolio_url", "website_url"];
  const socialFilled = socialFields.filter((f) => form[f]?.toString().trim()).length;
  sections.social = { label: "Social Links", score: Math.round((socialFilled / socialFields.length) * 100), filled: socialFilled, total: socialFields.length };

  const langCount = form.languages?.length || 0;
  sections.languages = { label: "Languages", score: langCount > 0 ? 100 : 0, filled: langCount, total: langCount || 1 };

  const projCount = form.projects?.length || 0;
  sections.projects = { label: "Projects", score: projCount > 0 ? 100 : 0, filled: projCount, total: projCount || 1 };

  const awardCount = form.awards?.length || 0;
  sections.awards = { label: "Awards", score: awardCount > 0 ? 100 : 0, filled: awardCount, total: awardCount || 1 };

  const overall = Math.round(Object.values(sections).reduce((a, s) => a + s.score, 0) / Object.keys(sections).length);
  return { sections, overall };
}

// ------------------------------------------------------------
// RESUME VERSION HISTORY
// ------------------------------------------------------------

export async function saveResumeVersion(fileUrl, fileName, extractedForm) {
  try {
    const existing = await base44.entities.ResumeVersion.list("-version_number", 1);
    const nextVersion = (existing[0]?.version_number || 0) + 1;
    await base44.entities.ResumeVersion.create({
      file_url: fileUrl,
      file_name: fileName,
      version_number: nextVersion,
      extracted_data: JSON.stringify(extractedForm),
    });
    return nextVersion;
  } catch (e) {
    return null;
  }
}

// ------------------------------------------------------------
// MERGE LOGIC — confidence-aware apply
// ------------------------------------------------------------

const SCALAR_SECTIONS = {
  personal: ["first_name", "last_name", "mobile_number", "city", "country", "linkedin_url", "github_url", "portfolio_url", "website_url"],
  executive: ["professional_headline", "bio", "industry", "years_experience", "current_company", "current_role"],
};

const ARRAY_SECTIONS = ["experience", "education", "certifications", "skills", "languages", "projects", "awards"];
const ARRAY_KEY_FIELDS = { experience: "company", education: "school", certifications: "name", projects: "name", awards: "title" };

export function applySync(currentForm, extractedForm, decisions) {
  const result = { ...currentForm };

  for (const section of Object.keys(SCALAR_SECTIONS)) {
    const mode = decisions[section] || "skip";
    if (mode === "skip") continue;
    for (const field of SCALAR_SECTIONS[section]) {
      const newVal = extractedForm[field];
      if (mode === "accept") {
        if (newVal !== undefined && newVal !== null && newVal !== "") result[field] = newVal;
      } else if (mode === "merge") {
        const isEmpty = result[field] == null || result[field] === "" || (Array.isArray(result[field]) && result[field].length === 0);
        if (isEmpty && newVal != null && newVal !== "") result[field] = newVal;
      }
    }
  }

  for (const section of ARRAY_SECTIONS) {
    const mode = decisions[section] || "skip";
    if (mode === "skip") continue;
    const current = result[section] || [];
    const incoming = extractedForm[section] || [];
    if (mode === "accept") {
      result[section] = incoming.length > 0 ? incoming : current;
    } else if (mode === "merge") {
      if (incoming.length > 0 && typeof incoming[0] === "string") {
        result[section] = Array.from(new Set([...current, ...incoming]));
      } else {
        const keyField = ARRAY_KEY_FIELDS[section];
        const seen = new Set(current.map((i) => (keyField ? (i[keyField] || "").toLowerCase() : JSON.stringify(i))));
        const merged = [...current];
        for (const item of incoming) {
          const key = keyField ? (item[keyField] || "").toLowerCase() : JSON.stringify(item);
          if (!seen.has(key)) { merged.push(item); seen.add(key); }
        }
        result[section] = merged;
      }
    }
  }

  return result;
}