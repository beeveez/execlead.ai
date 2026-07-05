const L = (id, title, duration, quizType) => ({ id, title, duration, quizType });
const M = (id, title, challenge, lessons) => ({ id, title, challenge, lessons });

export const COURSES = [
  {
    slug: "leadership", title: "Leadership", icon: "👑", color: "#6366f1", difficulty: "Advanced", duration: "6 hours", instructor: "Executive Mentor", instructorIcon: "🎯",
    description: "Master the foundations of executive leadership and learn to lead high-performing teams through change and transformation.",
    modules: [
      M("m1", "Foundations of Leadership", { title: "Present to the CIO", description: "Present your team's quarterly achievements and a strategic initiative to the CIO in a 10-minute executive briefing. Anticipate tough questions on ROI and resource allocation." }, [
        L("l1", "What Makes a Great Leader", 15, "mcq"), L("l2", "Leadership Styles", 18, "mcq"), L("l3", "Situational Leadership", 20, "scenario")
      ]),
      M("m2", "Building High Performing Teams", { title: "Handle a Difficult Employee", description: "A senior team member is underperforming and creating friction. Conduct a performance conversation that addresses behavior while maintaining motivation." }, [
        L("l1", "Team Dynamics", 15, "mcq"), L("l2", "Delegation & Trust", 18, "scenario"), L("l3", "Managing Performance", 20, "case_study")
      ]),
      M("m3", "Executive Leadership", { title: "Lead a QBR", description: "Lead a quarterly business review with an executive client. Present results, address service concerns, and propose a roadmap for the next quarter." }, [
        L("l1", "Vision & Strategy", 20, "scenario"), L("l2", "Leading Through Change", 18, "case_study"), L("l3", "Executive Presence", 15, "essay")
      ])
    ]
  },
  {
    slug: "executive-communication", title: "Executive Communication", icon: "🗣️", color: "#3b82f6", difficulty: "Intermediate", duration: "5 hours", instructor: "Supportive Coach", instructorIcon: "🌱",
    description: "Develop powerful executive communication skills for boardrooms, crises, and high-stakes conversations.",
    modules: [
      M("m1", "Communication Fundamentals", { title: "Deliver Bad News to the Board", description: "Communicate a missed SLA and its financial impact to the board. Be transparent, accountable, and present a recovery plan." }, [
        L("l1", "The Executive Message", 15, "mcq"), L("l2", "Active Listening", 12, "mcq"), L("l3", "Written Communication", 18, "scenario")
      ]),
      M("m2", "Executive Presentations", { title: "Present to 50 Executives", description: "Deliver a 15-minute presentation on your digital transformation strategy to 50 senior executives. Handle a hostile Q&A." }, [
        L("l1", "Structure & Story", 20, "scenario"), L("l2", "Data Storytelling", 18, "case_study"), L("l3", "Handling Q&A", 15, "scenario")
      ]),
      M("m3", "High-Stakes Communication", { title: "Crisis Communication", description: "A major incident is affecting a key customer. Communicate the situation to the customer's CIO and your CEO simultaneously." }, [
        L("l1", "Crisis Communication", 20, "case_study"), L("l2", "Difficult Conversations", 18, "scenario"), L("l3", "Board-Level Reporting", 20, "essay")
      ])
    ]
  },
  {
    slug: "business-strategy", title: "Business Strategy", icon: "♟️", color: "#8b5cf6", difficulty: "Advanced", duration: "7 hours", instructor: "Country Manager", instructorIcon: "🌍",
    description: "Think and act strategically. Master frameworks, competitive analysis, and strategy execution at the executive level.",
    modules: [
      M("m1", "Strategic Thinking", { title: "Build a 3-Year Strategy", description: "Develop a 3-year strategy for your service line. Consider market trends, competitive positioning, and capability gaps." }, [
        L("l1", "Competitive Analysis", 20, "mcq"), L("l2", "Market Positioning", 18, "scenario"), L("l3", "Strategic Frameworks", 20, "case_study")
      ]),
      M("m2", "Strategy Execution", { title: "Align a Divided Team", description: "Your leadership team is divided on strategic priorities. Facilitate alignment and create an executable roadmap." }, [
        L("l1", "OKRs & KPIs", 15, "mcq"), L("l2", "Execution Discipline", 18, "scenario"), L("l3", "Strategic Alignment", 20, "case_study")
      ]),
      M("m3", "Business Model Innovation", { title: "Pivot the Business Model", description: "Your current service model is being disrupted. Propose a business model innovation to the executive team." }, [
        L("l1", "Business Model Canvas", 18, "scenario"), L("l2", "Disruption & Innovation", 20, "essay"), L("l3", "Strategic Pivots", 18, "case_study")
      ])
    ]
  },
  {
    slug: "finance", title: "Finance", icon: "💰", color: "#eab308", difficulty: "Advanced", duration: "6 hours", instructor: "CFO", instructorIcon: "💰",
    description: "Master executive finance — from reading financial statements to P&L management, budgeting, and board reporting.",
    modules: [
      M("m1", "Financial Fundamentals", { title: "Defend Your Budget", description: "The CFO wants to cut your budget by 15%. Defend your budget with a clear financial case linking spend to business outcomes." }, [
        L("l1", "Reading Financial Statements", 20, "mcq"), L("l2", "P&L Management", 18, "case_study"), L("l3", "Cash Flow", 15, "mcq")
      ]),
      M("m2", "Financial Decision Making", { title: "Justify a Major Investment", description: "Present a $2M technology investment to the investment committee. Show ROI, payback period, and strategic value." }, [
        L("l1", "ROI & Investment", 18, "scenario"), L("l2", "Budgeting", 20, "case_study"), L("l3", "Cost Optimization", 18, "scenario")
      ]),
      M("m3", "Executive Finance", { title: "Board Financial Review", description: "Present your division's financial performance to the board. Explain variances, margin trends, and forward outlook." }, [
        L("l1", "Unit Economics", 20, "case_study"), L("l2", "Financial Forecasting", 18, "essay"), L("l3", "Board Financial Reporting", 20, "essay")
      ])
    ]
  },
  {
    slug: "commercial-thinking", title: "Commercial Thinking", icon: "📊", color: "#06b6d4", difficulty: "Intermediate", duration: "5 hours", instructor: "Country Manager", instructorIcon: "🌍",
    description: "Develop commercial acumen — understand revenue, margin, pricing, and value creation at an executive level.",
    modules: [
      M("m1", "Commercial Acumen", { title: "Price a New Service", description: "You're launching a new managed service. Develop a pricing strategy that maximizes margin while remaining competitive." }, [
        L("l1", "Revenue & Margin", 15, "mcq"), L("l2", "Pricing Strategies", 18, "scenario"), L("l3", "Commercial Models", 20, "case_study")
      ]),
      M("m2", "Value Creation", { title: "Negotiate a Renewal", description: "A key contract is up for renewal. The customer wants a 20% discount. Negotiate a outcome that preserves margin and relationship." }, [
        L("l1", "Value Propositions", 18, "scenario"), L("l2", "Customer Economics", 20, "case_study"), L("l3", "Commercial Negotiation", 18, "scenario")
      ]),
      M("m3", "Business Development", { title: "Build a Growth Plan", description: "Identify a new market opportunity and build a commercial plan to capture it. Present to the leadership team." }, [
        L("l1", "Growth Strategies", 20, "essay"), L("l2", "Market Expansion", 18, "case_study"), L("l3", "Partnerships & Alliances", 20, "scenario")
      ])
    ]
  },
  {
    slug: "it-service-management", title: "IT Service Management", icon: "🛠️", color: "#14b8a6", difficulty: "Intermediate", duration: "6 hours", instructor: "Executive Mentor", instructorIcon: "🎯",
    description: "Master ITIL, service operations, SLA management, and service excellence for IT service leaders.",
    modules: [
      M("m1", "ITIL Foundations", { title: "Redesign a Service Desk", description: "Your service desk is failing SLAs. Redesign the operating model, processes, and metrics to restore service quality." }, [
        L("l1", "Service Value System", 18, "mcq"), L("l2", "Service Lifecycle", 20, "mcq"), L("l3", "Key Processes", 18, "scenario")
      ]),
      M("m2", "Service Operations", { title: "Handle a P1 Incident", description: "A P1 incident is affecting a major customer. Manage the incident bridge, communication, and resolution." }, [
        L("l1", "Incident Management", 15, "scenario"), L("l2", "Problem Management", 18, "case_study"), L("l3", "Service Desk Excellence", 20, "scenario")
      ]),
      M("m3", "Service Excellence", { title: "Improve a Failing Service", description: "A critical service has declining CSAT and rising costs. Build a continuous improvement plan to transform it." }, [
        L("l1", "SLA Management", 18, "case_study"), L("l2", "Continuous Improvement", 20, "scenario"), L("l3", "Service Reporting", 18, "essay")
      ])
    ]
  },
  {
    slug: "ai-leadership", title: "AI Leadership", icon: "🤖", color: "#a855f7", difficulty: "Advanced", duration: "5 hours", instructor: "Transformation Director", instructorIcon: "🚀",
    description: "Lead AI initiatives with confidence — from strategy and use cases to ethics, governance, and the future of work.",
    modules: [
      M("m1", "AI Fundamentals for Leaders", { title: "Build an AI Strategy", description: "Develop an AI strategy for your organization. Identify high-impact use cases and build a roadmap." }, [
        L("l1", "Understanding AI", 15, "mcq"), L("l2", "AI in Enterprise", 18, "scenario"), L("l3", "AI Strategy", 20, "essay")
      ]),
      M("m2", "Leading AI Initiatives", { title: "Evaluate AI Investment", description: "Evaluate whether to build or buy an AI platform. Present your recommendation with a business case." }, [
        L("l1", "AI Use Cases", 18, "case_study"), L("l2", "Build vs Buy", 20, "scenario"), L("l3", "AI Project Management", 18, "case_study")
      ]),
      M("m3", "AI Ethics & Governance", { title: "Address AI Ethics", description: "Your AI system has a bias issue. Address the ethical implications and build a governance framework." }, [
        L("l1", "Responsible AI", 20, "scenario"), L("l2", "AI Governance", 18, "essay"), L("l3", "Future of Work", 20, "essay")
      ])
    ]
  },
  {
    slug: "cloud", title: "Cloud", icon: "☁️", color: "#0ea5e9", difficulty: "Intermediate", duration: "5 hours", instructor: "CTO", instructorIcon: "⚙️",
    description: "Master cloud strategy, economics, migration, and operations for executive technology leaders.",
    modules: [
      M("m1", "Cloud Foundations", { title: "Build a Cloud Strategy", description: "Develop a cloud strategy for your organization. Address migration, cost, security, and vendor selection." }, [
        L("l1", "Cloud Models", 15, "mcq"), L("l2", "Cloud Economics", 18, "case_study"), L("l3", "Migration Strategies", 20, "scenario")
      ]),
      M("m2", "Cloud Operations", { title: "Optimize Cloud Costs", description: "Your cloud costs have increased 40%. Build an optimization plan that reduces spend without impacting performance." }, [
        L("l1", "Multi-Cloud Management", 18, "scenario"), L("l2", "Cloud Security", 20, "case_study"), L("l3", "Cloud Optimization", 18, "scenario")
      ]),
      M("m3", "Cloud Leadership", { title: "Lead Cloud Transformation", description: "Lead your organization's cloud transformation. Address resistance, build capability, and deliver business value." }, [
        L("l1", "Cloud Strategy", 20, "essay"), L("l2", "Vendor Selection", 18, "case_study"), L("l3", "Cloud Transformation", 20, "essay")
      ])
    ]
  },
  {
    slug: "cybersecurity", title: "Cybersecurity", icon: "🔒", color: "#ef4444", difficulty: "Advanced", duration: "5 hours", instructor: "Auditor", instructorIcon: "🔍",
    description: "Master cybersecurity leadership — threat management, risk, incident response, and board-level security reporting.",
    modules: [
      M("m1", "Security Fundamentals", { title: "Build a Security Strategy", description: "Develop a cybersecurity strategy for your organization. Address threats, compliance, and board reporting." }, [
        L("l1", "Threat Landscape", 15, "mcq"), L("l2", "Security Frameworks", 18, "mcq"), L("l3", "Risk Management", 20, "scenario")
      ]),
      M("m2", "Security Operations", { title: "Respond to a Breach", description: "A security breach has been detected. Lead the incident response, communication, and remediation." }, [
        L("l1", "Incident Response", 18, "case_study"), L("l2", "Security Monitoring", 20, "scenario"), L("l3", "Vulnerability Management", 18, "case_study")
      ]),
      M("m3", "Security Leadership", { title: "Report to the Board", description: "Present your security posture and investment needs to the board. Translate technical risk into business language." }, [
        L("l1", "Security Strategy", 20, "essay"), L("l2", "Compliance & Audit", 18, "case_study"), L("l3", "Board Security Reporting", 20, "essay")
      ])
    ]
  },
  {
    slug: "digital-transformation", title: "Digital Transformation", icon: "🔄", color: "#ec4899", difficulty: "Advanced", duration: "6 hours", instructor: "Transformation Director", instructorIcon: "🚀",
    description: "Lead digital transformation end-to-end — from strategy and change management to execution and sustained impact.",
    modules: [
      M("m1", "Transformation Fundamentals", { title: "Assess Digital Maturity", description: "Assess your organization's digital maturity and build a transformation roadmap." }, [
        L("l1", "Digital Strategy", 18, "mcq"), L("l2", "Transformation Models", 20, "scenario"), L("l3", "Maturity Assessment", 18, "case_study")
      ]),
      M("m2", "Leading Transformation", { title: "Lead a Transformation", description: "Lead a digital transformation that faces organizational resistance. Build buy-in and drive change." }, [
        L("l1", "Change Management", 20, "scenario"), L("l2", "Digital Culture", 18, "case_study"), L("l3", "Innovation at Scale", 20, "essay")
      ]),
      M("m3", "Transformation Execution", { title: "Sustain the Change", description: "Your transformation is stalling. Re-energize the initiative and build a plan to sustain momentum." }, [
        L("l1", "Roadmapping", 18, "case_study"), L("l2", "Measuring Impact", 20, "scenario"), L("l3", "Sustaining Change", 18, "essay")
      ])
    ]
  },
  {
    slug: "governance", title: "Governance", icon: "⚖️", color: "#f59e0b", difficulty: "Advanced", duration: "5 hours", instructor: "Board Member", instructorIcon: "👑",
    description: "Master corporate and IT governance — frameworks, risk, compliance, audit, and board-level governance.",
    modules: [
      M("m1", "Governance Fundamentals", { title: "Build a Governance Framework", description: "Design a governance framework for your IT organization that balances control with agility." }, [
        L("l1", "Corporate Governance", 18, "mcq"), L("l2", "IT Governance", 20, "scenario"), L("l3", "Risk & Compliance", 18, "case_study")
      ]),
      M("m2", "Governance Frameworks", { title: "Pass an Audit", description: "Your organization is facing a major audit. Prepare the evidence, address gaps, and present to auditors." }, [
        L("l1", "COBIT & ITIL", 20, "mcq"), L("l2", "Policy Development", 18, "scenario"), L("l3", "Audit & Assurance", 20, "case_study")
      ]),
      M("m3", "Board-Level Governance", { title: "Report to the Board", description: "Present your governance posture and risk profile to the board. Address concerns and recommend improvements." }, [
        L("l1", "Board Reporting", 18, "essay"), L("l2", "Stakeholder Management", 20, "scenario"), L("l3", "Governance Maturity", 18, "essay")
      ])
    ]
  },
  {
    slug: "vendor-management", title: "Vendor Management", icon: "📦", color: "#8b5cf6", difficulty: "Intermediate", duration: "5 hours", instructor: "Executive Mentor", instructorIcon: "🎯",
    description: "Master vendor strategy, sourcing, SLA management, performance, and strategic partnerships.",
    modules: [
      M("m1", "Vendor Strategy", { title: "Select a Strategic Vendor", description: "Select a strategic vendor for a major service. Define requirements, evaluate options, and make a recommendation." }, [
        L("l1", "Vendor Selection", 18, "mcq"), L("l2", "Sourcing Models", 20, "scenario"), L("l3", "Contract Fundamentals", 18, "case_study")
      ]),
      M("m2", "Vendor Operations", { title: "Manage Vendor Performance", description: "A strategic vendor is underperforming. Address the issues, manage the relationship, and improve performance." }, [
        L("l1", "SLA Management", 18, "case_study"), L("l2", "Performance Management", 20, "scenario"), L("l3", "Vendor Risk", 18, "case_study")
      ]),
      M("m3", "Strategic Vendor Management", { title: "Consolidate Vendors", description: "You have too many vendors. Build a consolidation strategy that reduces cost and risk while maintaining service." }, [
        L("l1", "Partnership Models", 20, "essay"), L("l2", "Vendor Consolidation", 18, "scenario"), L("l3", "Strategic Sourcing", 20, "essay")
      ])
    ]
  },
  {
    slug: "negotiation", title: "Negotiation", icon: "🤝", color: "#f97316", difficulty: "Advanced", duration: "5 hours", instructor: "Country Manager", instructorIcon: "🌍",
    description: "Master executive negotiation — preparation, tactics, value creation, and high-stakes deal-making.",
    modules: [
      M("m1", "Negotiation Fundamentals", { title: "Prepare for a Big Negotiation", description: "Prepare for a critical contract negotiation. Define your BATNA, identify trade-offs, and build your strategy." }, [
        L("l1", "Negotiation Styles", 15, "mcq"), L("l2", "Preparation", 18, "scenario"), L("l3", "BATNA", 20, "case_study")
      ]),
      M("m2", "Negotiation Tactics", { title: "Handle a Deadlock", description: "A negotiation has reached a deadlock. Use tactics to break the impasse and create value for both sides." }, [
        L("l1", "Value Creation", 18, "scenario"), L("l2", "Handling Objections", 20, "case_study"), L("l3", "Closing Techniques", 18, "scenario")
      ]),
      M("m3", "Executive Negotiation", { title: "Negotiate a Mega Deal", description: "Negotiate a multi-million dollar deal with multiple stakeholders and competing interests." }, [
        L("l1", "Multi-Party Negotiation", 20, "essay"), L("l2", "Cross-Cultural", 18, "scenario"), L("l3", "High-Stakes Deals", 20, "essay")
      ])
    ]
  },
  {
    slug: "storytelling", title: "Storytelling", icon: "📖", color: "#d946ef", difficulty: "Intermediate", duration: "4 hours", instructor: "Supportive Coach", instructorIcon: "🌱",
    description: "Master the art of executive storytelling — structure, emotion, data stories, and vision-casting.",
    modules: [
      M("m1", "Storytelling Fundamentals", { title: "Craft Your Leadership Story", description: "Craft a compelling personal leadership story that communicates your values and vision." }, [
        L("l1", "Story Structure", 15, "mcq"), L("l2", "The Hero's Journey", 18, "scenario"), L("l3", "Emotional Connection", 20, "case_study")
      ]),
      M("m2", "Business Storytelling", { title: "Tell a Data Story", description: "Transform a dry quarterly report into a compelling data story that drives action." }, [
        L("l1", "Data Stories", 18, "scenario"), L("l2", "Brand Stories", 20, "case_study"), L("l3", "Vision Stories", 18, "essay")
      ]),
      M("m3", "Executive Storytelling", { title: "Inspire the Organization", description: "Deliver a keynote that inspires your organization through a period of significant change." }, [
        L("l1", "Boardroom Stories", 20, "essay"), L("l2", "Change Stories", 18, "scenario"), L("l3", "Legacy Stories", 20, "essay")
      ])
    ]
  },
  {
    slug: "presentation-skills", title: "Presentation Skills", icon: "🎤", color: "#f43f5e", difficulty: "Intermediate", duration: "4 hours", instructor: "Supportive Coach", instructorIcon: "🌱",
    description: "Master executive presentations — structure, visual design, delivery, and persuasive speaking.",
    modules: [
      M("m1", "Presentation Fundamentals", { title: "Design a Killer Deck", description: "Design a presentation deck for a critical executive presentation. Focus on structure, visuals, and message." }, [
        L("l1", "Structure & Flow", 15, "mcq"), L("l2", "Visual Design", 18, "scenario"), L("l3", "Delivery Techniques", 20, "case_study")
      ]),
      M("m2", "Executive Presentations", { title: "Present to the Board", description: "Deliver a high-stakes board presentation. Handle tough questions and drive a decision." }, [
        L("l1", "Board Presentations", 20, "scenario"), L("l2", "Pitch Presentations", 18, "case_study"), L("l3", "Keynote Speaking", 20, "essay")
      ]),
      M("m3", "Presentation Mastery", { title: "Handle a Hostile Audience", description: "Present to a hostile audience and win them over. Master Q&A, virtual presentations, and persuasion." }, [
        L("l1", "Handling Q&A", 18, "scenario"), L("l2", "Virtual Presentations", 20, "case_study"), L("l3", "Persuasive Speaking", 18, "essay")
      ])
    ]
  },
  {
    slug: "people-leadership", title: "People Leadership", icon: "👥", color: "#10b981", difficulty: "Intermediate", duration: "5 hours", instructor: "HR Director", instructorIcon: "👥",
    description: "Master people leadership — motivation, emotional intelligence, coaching, conflict, and talent development.",
    modules: [
      M("m1", "People Fundamentals", { title: "Coach a Struggling Leader", description: "Coach a struggling mid-level leader to improve their performance and confidence." }, [
        L("l1", "Motivation", 15, "mcq"), L("l2", "Emotional Intelligence", 18, "scenario"), L("l3", "Coaching", 20, "case_study")
      ]),
      M("m2", "Team Leadership", { title: "Resolve a Team Conflict", description: "Two senior team members are in conflict affecting the whole team. Mediate and resolve the situation." }, [
        L("l1", "Team Building", 18, "scenario"), L("l2", "Conflict Resolution", 20, "case_study"), L("l3", "Performance Management", 18, "scenario")
      ]),
      M("m3", "People Strategy", { title: "Build a Talent Strategy", description: "Build a talent development strategy for your organization. Address gaps, build pipelines, and develop future leaders." }, [
        L("l1", "Talent Development", 20, "essay"), L("l2", "Organizational Design", 18, "case_study"), L("l3", "Culture Building", 20, "essay")
      ])
    ]
  },
  {
    slug: "culture", title: "Culture", icon: "🌱", color: "#84cc16", difficulty: "Intermediate", duration: "4 hours", instructor: "HR Director", instructorIcon: "👥",
    description: "Master culture leadership — assessment, change, inclusivity, and building high-performance cultures at scale.",
    modules: [
      M("m1", "Culture Fundamentals", { title: "Assess Your Culture", description: "Assess your organization's culture. Identify strengths, gaps, and areas for intentional change." }, [
        L("l1", "What Is Culture", 15, "mcq"), L("l2", "Culture Assessment", 18, "scenario"), L("l3", "Cultural Values", 20, "case_study")
      ]),
      M("m2", "Shaping Culture", { title: "Lead a Culture Change", description: "Lead a culture transformation in a resistant organization. Build buy-in and sustain change." }, [
        L("l1", "Culture Change", 20, "scenario"), L("l2", "Inclusive Culture", 18, "case_study"), L("l3", "High-Performance Culture", 20, "essay")
      ]),
      M("m3", "Culture Leadership", { title: "Sustain Culture at Scale", description: "Your organization is growing rapidly. Build a plan to sustain your culture through growth." }, [
        L("l1", "Leading by Example", 18, "scenario"), L("l2", "Culture at Scale", 20, "case_study"), L("l3", "Sustaining Culture", 18, "essay")
      ])
    ]
  },
  {
    slug: "innovation", title: "Innovation", icon: "💡", color: "#eab308", difficulty: "Advanced", duration: "5 hours", instructor: "Transformation Director", instructorIcon: "🚀",
    description: "Master innovation leadership — design thinking, process, teams, and sustaining disruptive innovation.",
    modules: [
      M("m1", "Innovation Fundamentals", { title: "Run a Design Sprint", description: "Facilitate a design sprint to solve a critical customer problem. Guide the team through the process." }, [
        L("l1", "Types of Innovation", 15, "mcq"), L("l2", "Innovation Mindset", 18, "scenario"), L("l3", "Design Thinking", 20, "case_study")
      ]),
      M("m2", "Driving Innovation", { title: "Build an Innovation Team", description: "Build and lead a team tasked with driving innovation. Balance creativity with execution." }, [
        L("l1", "Innovation Process", 18, "scenario"), L("l2", "Building Innovation Teams", 20, "case_study"), L("l3", "Managing Failure", 18, "essay")
      ]),
      M("m3", "Innovation Leadership", { title: "Lead Disruptive Innovation", description: "Lead a disruptive innovation initiative that threatens your existing business model." }, [
        L("l1", "Innovation Strategy", 20, "essay"), L("l2", "Disruptive Innovation", 18, "case_study"), L("l3", "Sustaining Innovation", 20, "essay")
      ])
    ]
  }
];

export const getCourse = (slug) => COURSES.find(c => c.slug === slug);

export function flattenLessons(course) {
  if (!course) return [];
  const flat = [];
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      flat.push({ module, lesson, param: `${module.id}_${lesson.id}` });
    }
  }
  return flat;
}

export function findLesson(courseSlug, lessonParam) {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const [moduleId, lessonId] = lessonParam.split("_");
  for (const module of course.modules) {
    if (module.id === moduleId) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) return { course, module, lesson };
    }
  }
  return null;
}

export function getAdjacentLessons(course, lessonParam) {
  const flat = flattenLessons(course);
  const idx = flat.findIndex(f => f.param === lessonParam);
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
    index: idx,
    total: flat.length
  };
}

export function searchAcademy(query) {
  const q = query.toLowerCase().trim();
  if (!q) return COURSES;
  return COURSES.filter(course => {
    if (course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)) return true;
    return course.modules.some(m =>
      m.title.toLowerCase().includes(q) ||
      m.lessons.some(l => l.title.toLowerCase().includes(q))
    );
  });
}

const ROLE_PREFERENCES = {
  "service delivery": ["leadership", "it-service-management", "commercial-thinking", "executive-communication"],
  "country manager": ["finance", "business-strategy", "negotiation", "executive-communication", "governance"],
  "coo": ["leadership", "digital-transformation", "governance", "people-leadership"],
  "cio": ["ai-leadership", "cloud", "cybersecurity", "digital-transformation", "governance"],
  "cto": ["ai-leadership", "cloud", "cybersecurity", "innovation"],
  "operations": ["leadership", "it-service-management", "commercial-thinking"],
  "director": ["leadership", "business-strategy", "governance"],
  "vp": ["leadership", "business-strategy", "finance"],
  "ceo": ["business-strategy", "finance", "governance", "innovation"]
};

export function getRecommendedCourses(targetRole) {
  if (!targetRole) return [];
  const role = targetRole.toLowerCase();
  for (const [key, slugs] of Object.entries(ROLE_PREFERENCES)) {
    if (role.includes(key)) {
      return slugs.map(slug => COURSES.find(c => c.slug === slug)).filter(Boolean);
    }
  }
  return [];
}