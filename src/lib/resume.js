export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    personal_info: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        country: { type: "string" },
        linkedin: { type: "string" },
        portfolio: { type: "string" }
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
          duration_years: { type: "number" },
          industry: { type: "string" },
          promotions: { type: "array", items: { type: "string" } },
          description: { type: "string" },
          key_achievements: { type: "array", items: { type: "string" } }
        }
      }
    },
    employment_gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          period: { type: "string" },
          duration: { type: "string" }
        }
      }
    },
    technical_skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          category: { type: "string" },
          proficiency: { type: "number" }
        }
      }
    },
    leadership_experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          evidence: { type: "string" },
          proficiency: { type: "number" }
        }
      }
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          expiration_date: { type: "string" }
        }
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          year: { type: "string" },
          honors: { type: "string" }
        }
      }
    },
    achievements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          description: { type: "string" },
          metric: { type: "string" }
        }
      }
    },
    executive_readiness_score: { type: "number" },
    promotion_readiness: { type: "number" },
    leadership_maturity: { type: "number" },
    commercial_maturity: { type: "number" },
    executive_presence: { type: "number" },
    communication_assessment: { type: "number" },
    technical_leadership: { type: "number" },
    strategic_thinking: { type: "number" },
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
    skill_gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          gap: { type: "string" },
          action: { type: "string" }
        }
      }
    },
    resume_health_score: { type: "number" }
  }
};

export const TRUTH_ENGINE_SCHEMA = {
  type: "object",
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original_statement: { type: "string" },
          problem_type: { type: "string" },
          problem: { type: "string" },
          executive_rewrite: { type: "string" },
          explanation: { type: "string" },
          interview_narrative: { type: "string" }
        }
      }
    },
    resume_health_score: { type: "number" },
    priority_improvements: { type: "array", items: { type: "string" } },
    missing_elements: { type: "array", items: { type: "string" } },
    overall_assessment: { type: "string" }
  }
};

export const buildExtractionPrompt = (targetRole, targetCompany) =>
`You are an expert executive resume analyst. Analyze this resume thoroughly.

Extract ALL of the following:

**Personal Information:** Full name, email, phone, country, LinkedIn URL, portfolio URL

**Career Timeline:** Every role with job title, employer, start/end dates, duration in years, industry, promotions within the role, description, and key measurable achievements. Also identify any employment gaps.

**Technical Skills:** Categorize each skill and rate proficiency (0-100). Categories include: IT Service Management, ServiceNow, Microsoft, Azure, AWS, Google Cloud, Cisco, VMware, Linux, Windows, Networking, Security, Automation, AI, ITIL, Agile, DevOps, Project Management

**Leadership Experience:** Detect evidence of: Team Leadership, Coaching, Mentoring, Performance Reviews, Escalation Management, Stakeholder Management, Customer Success, Executive Reporting, Budget Exposure, Vendor Management, Transformation, Program Management, Service Delivery, Operational Excellence. Include evidence and rate proficiency (0-100).

**Certifications:** Name, issuer, and expiration date when available. Look for: ITIL, Microsoft, AWS, Google Cloud, Cisco, ServiceNow, PMP, PRINCE2, Lean Six Sigma, ISO, Scrum

**Education:** Degree, institution, graduation year, honors

**Achievements:** Identify measurable accomplishments with categories (SLA improvements, cost reductions, automation, customer satisfaction, team growth, major projects, awards, recognition) and specific metrics

Then assess the candidate for an executive role targeting "${targetRole}" at "${targetCompany}":
- Executive Readiness Score (0-100)
- Promotion Readiness (0-100)
- Leadership Maturity (0-100)
- Commercial Maturity (0-100)
- Executive Presence (0-100)
- Communication Assessment (0-100)
- Technical Leadership (0-100)
- Strategic Thinking (0-100)

Create competency maps (each skill rated 0-100):
- Technical Competency Map
- Leadership Competency Map

Identify skill gaps relative to ${targetRole}, categorized by: Leadership, Commercial, Technical, Communication, Executive Presence. For each gap provide an action plan.

Calculate a Resume Health Score (0-100) based on completeness, quantification, executive language quality, and impact demonstration.

Return everything as structured JSON.`;

export const buildTruthEnginePrompt = (targetRole) =>
`You are an executive resume consultant with a Truth Engine. Never invent achievements. Always preserve factual accuracy.

Analyze this resume for:
1. **Unsupported claims** — statements without metrics or evidence
2. **Inflated ownership** — taking credit without evidence of personal contribution
3. **Fake metrics** — suspicious or unverifiable numbers
4. **Weak language** — passive, tentative, or junior-level wording
5. **Missing business impact** — achievements without quantified outcomes

For each issue found, provide:
- **original_statement**: Quote the exact text from the resume
- **problem_type**: Categorize as one of: unsupported_claim, inflated_ownership, fake_metric, weak_language, missing_impact
- **problem**: Explain why it's weak
- **executive_rewrite**: Truthful, specific, metric-driven, confident rewrite
- **explanation**: Why the rewrite is stronger
- **interview_narrative**: How to present this in an interview setting

Then provide:
- **resume_health_score**: Overall resume quality (0-100) for a ${targetRole} position
- **priority_improvements**: Top 5 most impactful changes to make (array of strings)
- **missing_elements**: What's missing that an executive resume should have (array of strings)
- **overall_assessment**: Brief summary of resume quality and key recommendation

Return as structured JSON.`;

export const buildRoadmapPrompt = (data, profile) =>
`Create a personalized 12-week learning roadmap based on this resume analysis.

TARGET ROLE: ${profile?.target_role || "Senior Manager"} at ${profile?.target_company || "IT Company"}
CURRENT ROLE: ${data?.career_history?.[0]?.job_title || "Unknown"}

IDENTIFIED SKILL GAPS:
${data?.skill_gaps?.map(g => `- ${typeof g === "string" ? g : `${g.category}: ${g.gap} → ${g.action}`}`).join("\n") || "No specific gaps identified"}

CURRENT SKILLS:
${getFlatSkills(data).slice(0, 15).join(", ") || "None identified"}

EXECUTIVE READINESS: ${data?.executive_readiness_score || 0}/100
LEADERSHIP MATURITY: ${data?.leadership_maturity || 0}/100
COMMERCIAL MATURITY: ${data?.commercial_maturity || 0}/100

Provide a detailed roadmap in markdown:

## 📅 12-Week Executive Development Plan

### Week 1-2: [Topic]
Specific lessons, simulations, and challenges for this period.

### Week 3-4: [Topic]
(Continue through Week 12)

## 🎓 Recommended Lessons (Executive Academy)
List 5 specific lesson topics from: Leadership, Executive Communication, Business Strategy, Finance, Commercial Thinking, IT Service Management, AI Leadership, Cloud, Cybersecurity, Digital Transformation, Governance, Vendor Management, Negotiation, Storytelling, Presentation Skills, People Leadership, Culture, Innovation

## 🧠 Recommended Simulations
List 3 specific simulation scenarios based on their experience.

## ⚖️ Recommended Debates
List 2-3 debate topics tailored to their level.

## ⚔️ Executive Challenges
List 3 challenge categories to practice.

Be specific and tied to their actual experience gaps. This should feel personalized, not generic.`;

export const buildSimulatorPrompt = (resumeData, targetRole, targetCompany) => {
  if (!resumeData) return "";
  const currentRole = resumeData.career_history?.[0]?.job_title || "N/A";
  const currentEmployer = resumeData.career_history?.[0]?.employer || "N/A";
  const skills = getFlatSkills(resumeData).slice(0, 10);
  const gaps = (resumeData.skill_gaps || []).map(g => typeof g === "string" ? g : g.gap).slice(0, 5);
  return `CANDIDATE BACKGROUND: Currently ${currentRole} at ${currentEmployer}.
KEY SKILLS: ${skills.join(", ")}
EXPERIENCE GAPS: ${gaps.join(", ") || "None identified"}
Targeting: ${targetRole} at ${targetCompany}

Generate scenarios, questions, and challenges that are SPECIFIC to their actual experience. Never ask generic questions when resume data is available. Tailor every question to their real career context.`;
};

export const getFlatSkills = (data) => {
  if (!data) return [];
  const tech = (data.technical_skills || []).map(s => typeof s === "string" ? s : s.skill).filter(Boolean);
  const lead = (data.leadership_experience || data.leadership_skills || []).map(s => typeof s === "string" ? s : s.skill).filter(Boolean);
  return [...tech, ...lead];
};

export const getResumeHealthScore = (data) => {
  if (!data) return null;
  return data.resume_health_score || Math.round(
    ((data.executive_readiness_score || 0) +
    (data.leadership_maturity || 0) +
    (data.commercial_maturity || 0) +
    (data.executive_presence || 0) +
    (data.communication_assessment || 0)) / 5
  );
};