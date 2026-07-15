export const RESUME_TEMPLATES = [
  { id: "executive_modern", name: "Executive Modern", desc: "Clean & modern", accent: "#6366f1", layout: "modern" },
  { id: "mckinsey_style", name: "McKinsey Style", desc: "Consulting elite", accent: "#1e40af", layout: "classic" },
  { id: "microsoft_style", name: "Microsoft Style", desc: "Corporate blue", accent: "#0078d4", layout: "modern" },
  { id: "google_style", name: "Google Style", desc: "Clean & bold", accent: "#ea4335", layout: "modern" },
  { id: "aws_style", name: "AWS Style", desc: "Cloud-native", accent: "#ff9900", layout: "classic" },
  { id: "consulting", name: "Consulting", desc: "Structured", accent: "#0f766e", layout: "classic" },
  { id: "minimal", name: "Minimal", desc: "Distraction-free", accent: "#334155", layout: "minimal" },
  { id: "corporate", name: "Corporate", desc: "Traditional", accent: "#1e3a5f", layout: "classic" },
  { id: "ats_optimized", name: "ATS Optimized", desc: "Parser-friendly", accent: "#000000", layout: "ats" },
  { id: "executive_one_page", name: "Executive One Page", desc: "Concise", accent: "#7c3aed", layout: "modern" },
  { id: "executive_two_page", name: "Executive Two Page", desc: "Comprehensive", accent: "#0ea5e9", layout: "classic" },
  { id: "dark_theme", name: "Dark Theme", desc: "Bold & modern", accent: "#a855f7", layout: "dark" },
];

export const RESUME_SECTIONS = [
  { id: "personal", label: "Personal Info", type: "personal" },
  { id: "summary", label: "Professional Summary", type: "text" },
  { id: "experience", label: "Experience", type: "list" },
  { id: "achievements", label: "Achievements", type: "list" },
  { id: "projects", label: "Projects", type: "list" },
  { id: "skills", label: "Skills", type: "list" },
  { id: "leadership", label: "Leadership", type: "list" },
  { id: "education", label: "Education", type: "list" },
  { id: "certifications", label: "Certifications", type: "list" },
  { id: "awards", label: "Awards", type: "list" },
  { id: "volunteer", label: "Volunteer Work", type: "list" },
  { id: "languages", label: "Languages", type: "list" },
  { id: "public_speaking", label: "Public Speaking", type: "list" },
  { id: "publications", label: "Publications", type: "list" },
];

export const SECTION_FIELDS = {
  experience: [
    { name: "job_title", label: "Job Title", type: "text" },
    { name: "employer", label: "Employer", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "start_date", label: "Start Date", type: "monthyear" },
    { name: "end_date", label: "End Date", type: "monthyear", allowPresent: true },
    { name: "current", label: "Current Role", type: "checkbox" },
    { name: "bullets", label: "Responsibilities & Achievements", type: "bullets" },
  ],
  achievements: [
    { name: "title", label: "Achievement Title", type: "text" },
    { name: "bullet", label: "Bullet Point", type: "textarea" },
  ],
  projects: [
    { name: "name", label: "Project Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "role", label: "Your Role", type: "text" },
    { name: "bullets", label: "Key Points", type: "bullets" },
  ],
  skills: [
    { name: "category", label: "Category", type: "text" },
    { name: "items", label: "Skills", type: "tags" },
  ],
  leadership: [
    { name: "role", label: "Role", type: "text" },
    { name: "organization", label: "Organization", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
  ],
  education: [
    { name: "degree", label: "Degree", type: "text" },
    { name: "institution", label: "Institution", type: "text" },
    { name: "year", label: "Year", type: "year" },
    { name: "honors", label: "Honors", type: "text" },
  ],
  certifications: [
    { name: "name", label: "Certification", type: "text" },
    { name: "issuer", label: "Issuer", type: "text" },
    { name: "year", label: "Issue Date", type: "monthyear" },
    { name: "expiration", label: "Expiration", type: "monthyear", allowPresent: true },
  ],
  awards: [
    { name: "title", label: "Award", type: "text" },
    { name: "issuer", label: "Issuer", type: "text" },
    { name: "year", label: "Year", type: "year" },
  ],
  volunteer: [
    { name: "role", label: "Role", type: "text" },
    { name: "organization", label: "Organization", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
  ],
  languages: [
    { name: "language", label: "Language", type: "text" },
    { name: "proficiency", label: "Proficiency", type: "text" },
  ],
  public_speaking: [
    { name: "event", label: "Event", type: "text" },
    { name: "topic", label: "Topic", type: "text" },
    { name: "date", label: "Date", type: "monthyear" },
  ],
  publications: [
    { name: "title", label: "Title", type: "text" },
    { name: "publisher", label: "Publisher", type: "text" },
    { name: "date", label: "Date", type: "monthyear" },
  ],
};

export const defaultResumeContent = () => ({
  personal: { full_name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "",
  experience: [],
  achievements: [],
  projects: [],
  skills: [],
  leadership: [],
  education: [],
  certifications: [],
  awards: [],
  volunteer: [],
  languages: [],
  public_speaking: [],
  publications: [],
});

export const COVER_LETTER_TYPES = [
  "Executive Roles", "Leadership Roles", "Management Roles", "Technical Roles", "Enterprise Sales", "Consulting"
];

export const BIO_LENGTHS = [
  { id: "50", label: "50-word bio", words: 50 },
  { id: "100", label: "100-word bio", words: 100 },
  { id: "250", label: "250-word bio", words: 250 },
];

export const BIO_TYPES = [
  "Conference speaker bio", "Board profile", "Company website profile", "General executive bio"
];

export const ATS_SCHEMA = {
  type: "object",
  properties: {
    ats_score: { type: "number" },
    keyword_match: { type: "number" },
    formatting_score: { type: "number" },
    readability: { type: "number" },
    executive_impact: { type: "number" },
    missing_skills: { type: "array", items: { type: "string" } },
    keyword_recommendations: { type: "array", items: { type: "string" } },
    summary: { type: "string" }
  }
};

export const JOB_MATCH_SCHEMA = {
  type: "object",
  properties: {
    overall_match: { type: "number" },
    missing_skills: { type: "array", items: { type: "string" } },
    missing_keywords: { type: "array", items: { type: "string" } },
    recommended_improvements: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    summary: { type: "string" }
  }
};

export const LINKEDIN_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    about: { type: "string" },
    experience: { type: "string" },
    featured_content: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    recommendations: { type: "string" },
    banner_suggestion: { type: "string" },
    seo_score: { type: "number" }
  }
};

export const buildExecutiveRewritePrompt = (text, sectionLabel) =>
`You are an executive language expert. Rewrite the following ${sectionLabel} content in powerful, executive-level language.

Rules:
- Never invent accomplishments or metrics
- Preserve factual accuracy
- Use strong, active verbs
- Quantify impact where data exists
- Make it confident and senior-level

Original:
${text}

Return ONLY the rewritten text. No explanations.`;

export const buildAchievementPrompt = (star) =>
`You are an executive achievement writer. Convert the following STAR inputs into 1-2 powerful, executive-quality resume bullet points.

Situation: ${star.situation}
Action: ${star.action}
Result: ${star.result}
Business Impact: ${star.impact}
Metrics: ${star.metrics}

Rules:
- Never invent metrics or accomplishments
- Use strong action verbs (Led, Architected, Transformed, Delivered)
- Quantify wherever possible
- Show business impact clearly
- Keep each bullet to 1-2 lines

Return ONLY the bullet points. No explanations.`;

export const buildATSPrompt = (content) =>
`You are an ATS (Applicant Tracking System) analyzer. Analyze this resume content for ATS compatibility and executive impact.

Resume Content:
${JSON.stringify(content, null, 2)}

Score each metric 0-100. Identify missing skills and recommend keywords. Return as JSON.`;

export const buildJobMatchPrompt = (content, jobDescription) =>
`You are an executive career analyst. Compare this resume against the job description.

RESUME CONTENT:
${JSON.stringify(content, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide:
- overall_match: 0-100
- missing_skills: array of skills in the JD not in the resume
- missing_keywords: array of important keywords not present
- recommended_improvements: array of actionable suggestions
- strengths: array of what matches well
- weaknesses: array of gaps
- summary: brief assessment

Return as JSON.`;

export const buildCoverLetterPrompt = (type, role, company, content) =>
`You are an expert executive cover letter writer. Write a compelling cover letter for:

Role Type: ${type}
Target Role: ${role || "Executive"}
Target Company: ${company || "the organization"}

CANDIDATE BACKGROUND:
Name: ${content.personal?.full_name || "The candidate"}
Current/Most Recent Role: ${content.experience?.[0]?.job_title || "N/A"} at ${content.experience?.[0]?.employer || "N/A"}
Key Skills: ${(content.skills || []).flatMap(s => s.items || []).slice(0, 10).join(", ")}
Key Achievements: ${(content.achievements || []).map(a => a.bullet).slice(0, 3).join(" ")}

Rules:
- Never invent accomplishments or metrics
- Use the candidate's actual experience
- Make it compelling and executive-level
- Keep it to one page
- Address it to the hiring manager

Return ONLY the cover letter text. No explanations.`;

export const buildLinkedInPrompt = (role, content) =>
`You are a LinkedIn optimization expert. Generate optimized LinkedIn profile content for someone targeting "${role || "Executive"}" roles.

CANDIDATE BACKGROUND:
Name: ${content.personal?.full_name || "N/A"}
Current Role: ${content.experience?.[0]?.job_title || "N/A"} at ${content.experience?.[0]?.employer || "N/A"}
Summary: ${content.summary || "N/A"}
Key Skills: ${(content.skills || []).flatMap(s => s.items || []).slice(0, 15).join(", ")}
Experience: ${(content.experience || []).slice(0, 3).map(e => `${e.job_title} at ${e.employer}`).join(", ")}

Generate:
- headline: A compelling LinkedIn headline (under 220 chars)
- about: A powerful about section (first person, 3-4 paragraphs)
- experience: Suggestions for enhancing experience descriptions
- featured_content: What to feature
- skills: Top 10 skills to list
- recommendations: Who to ask for recommendations and what to highlight
- banner_suggestion: Banner image concept
- seo_score: Estimated SEO score 0-100

Return as JSON.`;

export const buildBioPrompt = (words, type, content) =>
`You are an executive bio writer. Write a ${words}-word ${type} for:

Name: ${content.personal?.full_name || "The executive"}
Current Role: ${content.experience?.[0]?.job_title || "N/A"} at ${content.experience?.[0]?.employer || "N/A"}
Experience: ${(content.experience || []).slice(0, 3).map(e => `${e.job_title} at ${e.employer}`).join(", ")}
Key Achievements: ${(content.achievements || []).map(a => a.bullet).slice(0, 3).join(" ")}
Skills: ${(content.skills || []).flatMap(s => s.items || []).slice(0, 10).join(", ")}
Certifications: ${(content.certifications || []).map(c => c.name).join(", ")}

Rules:
- Never invent accomplishments
- Write in third person
- Keep it close to ${words} words
- Make it compelling and professional
- Tailor it for ${type}

Return ONLY the bio text. No explanations.`;

export const buildRecommendationsPrompt = (content) =>
`You are an executive career advisor. Based on this resume, recommend specific growth actions.

RESUME CONTENT:
${JSON.stringify(content, null, 2)}

Provide recommendations as markdown for:
## Skills to Learn
## Certifications to Pursue
## Leadership Competencies to Develop
## Stretch Projects
## Courses & Books
## Interview Preparation Tips
## Promotion Readiness Assessment

Be specific and tied to their actual experience. Return as markdown.`;

export const buildTruthEnginePrompt = (content) =>
`You are an executive resume Truth Engine. Analyze this resume for credibility issues.

Resume Content:
${JSON.stringify(content, null, 2)}

Identify:
1. Unsupported claims — statements without metrics
2. Inflated ownership — taking credit without evidence
3. Missing metrics — achievements without quantification
4. Weak wording — passive or junior-level language

For each issue, provide the original statement and a truthful executive rewrite. Never invent achievements.

Return as JSON with: issues (array of {original, problem_type, rewrite}), health_score (0-100), priority_improvements (array), summary (string).`;