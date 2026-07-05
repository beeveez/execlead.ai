export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    personal_info: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedin: { type: "string" }
      }
    },
    career_history: {
      type: "array",
      items: {
        type: "object",
        properties: {
          job_title: { type: "string" },
          employer: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          current: { type: "boolean" },
          description: { type: "string" },
          key_achievements: { type: "array", items: { type: "string" } }
        }
      }
    },
    technical_skills: { type: "array", items: { type: "string" } },
    leadership_skills: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          year: { type: "string" }
        }
      }
    },
    awards: { type: "array", items: { type: "string" } },
    major_projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    executive_readiness_score: { type: "number" },
    promotion_readiness: { type: "number" },
    leadership_maturity: { type: "number" },
    commercial_maturity: { type: "number" },
    executive_presence: { type: "number" },
    communication_assessment: { type: "number" },
    technical_competency_map: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          level: { type: "number" }
        }
      }
    },
    leadership_competency_map: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          level: { type: "number" }
        }
      }
    },
    skill_gaps: { type: "array", items: { type: "string" } }
  }
};

export const buildExtractionPrompt = (targetRole, targetCompany) =>
`You are an expert executive resume analyst. Analyze this resume thoroughly.

Extract ALL of the following:
- Personal information (name, email, phone, location, LinkedIn)
- Complete career history (every role: job title, employer, start/end dates, description, key achievements)
- Technical skills
- Leadership skills
- Certifications
- Education (degree, institution, year)
- Awards
- Major projects (name, description)

Then assess the candidate for an executive role targeting "${targetRole}" at "${targetCompany}":
- Executive Readiness Score (0-100)
- Promotion Readiness (0-100)
- Leadership Maturity (0-100)
- Commercial Maturity (0-100)
- Executive Presence (0-100)
- Communication Assessment (0-100)

Create competency maps (each skill rated 0-100):
- Technical Competency Map
- Leadership Competency Map

Identify skill gaps relative to the target role of ${targetRole}.

Return everything as structured JSON.`;

export const buildRoadmapPrompt = (data, profile) =>
`Create a personalized learning roadmap based on this resume analysis.

TARGET ROLE: ${profile?.target_role || "Senior Manager"} at ${profile?.target_company || "IT Company"}
CURRENT ROLE: ${data?.career_history?.[0]?.job_title || "Unknown"}

IDENTIFIED SKILL GAPS:
${data?.skill_gaps?.map(g => `- ${g}`).join("\n") || "No specific gaps identified"}

CURRENT TECHNICAL SKILLS:
${data?.technical_skills?.join(", ") || "None"}

CURRENT LEADERSHIP SKILLS:
${data?.leadership_skills?.join(", ") || "None"}

EXECUTIVE READINESS: ${data?.executive_readiness_score || 0}/100

Provide a detailed roadmap in markdown:

## 🎓 Recommended Lessons (Executive Academy)
List 4-5 specific lesson topics from these paths: Leadership, Executive Communication, Business Strategy, Finance, Commercial Thinking, IT Service Management, AI Leadership, Cloud, Cybersecurity, Digital Transformation, Governance, Vendor Management, Negotiation, Storytelling, Presentation Skills, People Leadership, Culture, Innovation

## 🧠 Recommended Simulations
List 3 specific simulation scenarios that would help close their gaps.

## ⚖️ Recommended Debates
List 2-3 debate topics tailored to their experience level.

## ⚔️ Executive Challenges
List 3 specific challenge categories to practice.

## 📅 90-Day Action Plan
Create a week-by-week plan (Weeks 1-12) with specific actions.

Be specific and tied to their actual experience gaps. This should feel personalized, not generic.`;

export const buildEnhancementPrompt = (targetRole) =>
`You are an executive resume consultant with a Truth Engine.

Analyze this resume for:

1. **Vague claims** — statements without metrics or specifics (e.g., "improved efficiency")
2. **Unsupported statements** — achievements with no evidence
3. **Exaggerated achievements** — inflated metrics, false ownership, exaggerated scope
4. **Weak executive language** — passive, tentative, or junior-level wording

For each issue found, provide:
- **Original text** (quote it)
- **Problem** (why it's weak)
- **Executive rewrite** (truthful, specific, metric-driven, confident)

Then provide:

## Resume Strength Score (0-100)
Rate the overall resume quality for a ${targetRole} position.

## Top 5 Priority Improvements
The most impactful changes to make.

## Executive Language Transformation
5 examples of replacing weak language with executive-level wording.

## Missing Elements
What's missing that an executive resume should have?

Be honest, specific, and constructive. Focus on truthfulness and executive impact.`;