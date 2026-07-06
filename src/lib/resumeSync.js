import { callAI } from "@/lib/ai";

// ============================================================
// RESUME → EXECUTIVE IDENTITY EXTRACTION
// Schema and prompt designed to populate the Executive Identity
// Center fields directly from a parsed resume.
// ============================================================

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
        portfolio_url: { type: "string" },
        website_url: { type: "string" },
        github_url: { type: "string" },
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
        leadership_summary: { type: "string" },
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
          leadership_experience: { type: "string" },
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
    skills: {
      type: "array",
      items: { type: "string" },
    },
  },
};

export const buildIdentityExtractionPrompt = () =>
  `You are an expert resume parser specialized in extracting structured data for an Executive Identity profile.

Analyze the attached resume and extract ALL of the following with maximum accuracy. Never invent information — only extract what is explicitly stated.

**Personal Information:**
- full_name, first_name, last_name (split the full name)
- email, phone
- city, country (full country name)
- linkedin_url, portfolio_url, website_url, github_url (full URLs)

**Executive Profile:**
- professional_headline (e.g., "Senior Director, Cloud Infrastructure")
- bio (2-3 sentence professional summary based on resume content)
- industry (e.g., "Information Technology", "Financial Services")
- years_experience (calculate total years of professional experience as a number)
- current_company (most recent employer)
- current_role (most recent job title)
- leadership_summary (brief summary of leadership experience)

**Work Experience:** One entry per position:
- company, role, employment_type (Full-time, Contract, etc.)
- start_date (YYYY-MM or "Jan 2020" format), end_date, current (true if ongoing)
- responsibilities (array of bullet points)
- achievements (array of bullet points with metrics if available)
- technologies (array of tools/platforms mentioned)
- leadership_experience (summary of leadership scope at this role)

**Education:** One entry per degree:
- school, degree (e.g., "MBA", "B.S."), major, graduation_year

**Certifications:** Detect and categorize each:
- name (full certification name)
- issuer (e.g., "Microsoft", "AWS", "Google", "Cisco", "ServiceNow", "ITIL", "CompTIA", "PMI", "Scrum Alliance")
- type (one of: "Microsoft", "AWS", "Google", "Cisco", "ServiceNow", "ITIL", "CompTIA", "PMI", "Scrum", "Other")

**Skills:** Extract ALL skills mentioned, especially:
Leadership, Cloud, ITSM, AI, Automation, ServiceNow, Governance, Cybersecurity, Negotiation, Communication, Digital Transformation, Strategy, P&L, Change Management, Stakeholder Management, and any technical/functional skills.

Return as structured JSON.`;

// ============================================================
// MAPPING: Extracted data → Profile form fields
// ============================================================

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

export function mapExtractedToForm(extracted) {
  if (!extracted) return null;
  const pi = extracted.personal_info || {};
  const ep = extracted.executive_profile || {};

  // Split full name if first/last not provided
  let firstName = pi.first_name || "";
  let lastName = pi.last_name || "";
  if (!firstName && !lastName && pi.full_name) {
    const parts = pi.full_name.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  return {
    first_name: firstName,
    last_name: lastName,
    mobile_number: pi.phone || "",
    city: pi.city || "",
    country: pi.country || "",
    linkedin_url: pi.linkedin_url || "",
    portfolio_url: pi.portfolio_url || "",
    website_url: pi.website_url || "",
    github_url: pi.github_url || "",
    professional_headline: ep.professional_headline || "",
    bio: ep.bio || "",
    industry: ep.industry || "",
    years_experience: ep.years_experience || null,
    current_company: ep.current_company || "",
    current_role: ep.current_role || "",
    experience: (extracted.work_experience || []).map((exp) => ({
      company: exp.company || "",
      role: exp.role || "",
      start_date: normalizeDate(exp.start_date),
      end_date: exp.current ? "Present" : normalizeDate(exp.end_date),
      responsibilities: Array.isArray(exp.responsibilities)
        ? exp.responsibilities.join("\n")
        : exp.responsibilities || "",
      achievements: Array.isArray(exp.achievements)
        ? exp.achievements.join("\n")
        : exp.achievements || "",
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
  };
}

// ============================================================
// EXTRACTION ENTRY POINT
// ============================================================

export async function extractResumeIdentity(fileUrl) {
  const result = await callAI("resume", {
    prompt: buildIdentityExtractionPrompt(),
    file_urls: [fileUrl],
    response_json_schema: IDENTITY_EXTRACTION_SCHEMA,
  });
  return mapExtractedToForm(result);
}

// ============================================================
// PROFILE COMPLETENESS CALCULATOR
// ============================================================

export function calculateCompleteness(form) {
  if (!form) return { sections: {}, overall: 0 };

  const sections = {};

  // Personal Information
  const personalFields = ["first_name", "last_name", "mobile_number", "country", "city", "timezone"];
  const personalFilled = personalFields.filter((f) => form[f]?.toString().trim()).length;
  sections.personal = {
    label: "Personal Information",
    score: Math.round((personalFilled / personalFields.length) * 100),
    filled: personalFilled,
    total: personalFields.length,
  };

  // Executive Profile
  const execFields = ["professional_headline", "bio", "industry", "years_experience", "current_company", "current_role"];
  const execFilled = execFields.filter((f) => form[f]?.toString().trim()).length;
  sections.executive = {
    label: "Executive Profile",
    score: Math.round((execFilled / execFields.length) * 100),
    filled: execFilled,
    total: execFields.length,
  };

  // Work Experience
  const expCount = form.experience?.length || 0;
  const expComplete = form.experience?.filter((e) => e.company && e.role).length || 0;
  sections.experience = {
    label: "Experience",
    score: expCount === 0 ? 0 : Math.round((expComplete / expCount) * 100),
    filled: expComplete,
    total: expCount,
  };

  // Education
  const eduCount = form.education?.length || 0;
  sections.education = {
    label: "Education",
    score: eduCount > 0 ? 100 : 0,
    filled: eduCount,
    total: eduCount,
  };

  // Certifications
  const certCount = form.certifications?.length || 0;
  const certComplete = form.certifications?.filter((c) => c.name).length || 0;
  sections.certifications = {
    label: "Certifications",
    score: certCount === 0 ? 0 : Math.round((certComplete / certCount) * 100),
    filled: certComplete,
    total: certCount,
  };

  // Skills
  const skillCount = form.skills?.length || 0;
  sections.skills = {
    label: "Skills",
    score: Math.min(100, Math.round((skillCount / 10) * 100)),
    filled: skillCount,
    total: 10,
  };

  // Social Links
  const socialFields = ["linkedin_url", "github_url", "portfolio_url", "website_url"];
  const socialFilled = socialFields.filter((f) => form[f]?.toString().trim()).length;
  sections.social = {
    label: "Social Links",
    score: Math.round((socialFilled / socialFields.length) * 100),
    filled: socialFilled,
    total: socialFields.length,
  };

  const overall = Math.round(
    Object.values(sections).reduce((a, s) => a + s.score, 0) / Object.keys(sections).length
  );

  return { sections, overall };
}

// ============================================================
// MERGE LOGIC
// ============================================================

const SCALAR_SECTIONS = {
  personal: ["first_name", "last_name", "mobile_number", "city", "country", "linkedin_url", "portfolio_url", "website_url", "github_url"],
  executive: ["professional_headline", "bio", "industry", "years_experience", "current_company", "current_role"],
};

const ARRAY_SECTIONS = ["experience", "education", "certifications", "skills"];

export function applySync(currentForm, extractedForm, decisions) {
  const result = { ...currentForm };

  // Scalar sections
  for (const section of Object.keys(SCALAR_SECTIONS)) {
    const mode = decisions[section] || "keep";
    if (mode === "keep") continue;
    for (const field of SCALAR_SECTIONS[section]) {
      const newVal = extractedForm[field];
      if (mode === "replace") {
        if (newVal !== undefined && newVal !== null && newVal !== "") result[field] = newVal;
      } else if (mode === "merge") {
        if (!result[field] && newVal) result[field] = newVal;
      }
    }
  }

  // Array sections
  for (const section of ARRAY_SECTIONS) {
    const mode = decisions[section] || "keep";
    if (mode === "keep") continue;
    const current = result[section] || [];
    const incoming = extractedForm[section] || [];

    if (mode === "replace") {
      result[section] = incoming.length > 0 ? incoming : current;
    } else if (mode === "merge") {
      if (section === "skills") {
        const set = new Set([...current, ...incoming]);
        result[section] = Array.from(set);
      } else {
        // Dedup by a key field
        const keyField = section === "experience" ? "company" : section === "education" ? "school" : "name";
        const seen = new Set(current.map((i) => (i[keyField] || "").toLowerCase()));
        const merged = [...current];
        for (const item of incoming) {
          const key = (item[keyField] || "").toLowerCase();
          if (key && !seen.has(key)) {
            merged.push(item);
            seen.add(key);
          }
        }
        result[section] = merged;
      }
    }
  }

  return result;
}