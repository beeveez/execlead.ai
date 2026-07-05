export const COMPANIES = [
  "Fujitsu", "Hemmersbach", "IBM", "DXC", "Kyndryl", "Accenture", "Cognizant",
  "NTT DATA", "Capgemini", "HCL", "Infosys", "TCS", "Atos", "CGI",
  "Dell Technologies", "Microsoft", "AWS", "Google Cloud", "ServiceNow", "Cisco"
];

export const CAREER_PATHS = [
  "Service Desk Lead", "Operations Manager", "Service Delivery Manager",
  "Senior SDM", "Regional SDM", "Regional Director", "Operations Director",
  "Program Director", "Account Director", "Country Manager",
  "VP Operations", "COO", "CIO", "CTO", "CEO"
];

export const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "India", "Philippines", "Poland",
  "Spain", "Portugal", "Romania", "Mexico", "Brazil", "South Africa",
  "Australia", "Singapore", "Japan", "UAE", "Saudi Arabia", "Netherlands",
  "France", "Italy", "Canada", "Ireland", "Sweden", "Other"
];

export const INDUSTRIES = [
  "IT Services & Consulting", "Technology", "Financial Services", "Healthcare",
  "Telecommunications", "Manufacturing", "Retail & E-Commerce", "Government",
  "Education", "Energy & Utilities", "Media & Entertainment", "Transportation & Logistics"
];

export const LEARNING_STYLES = [
  "Visual & Interactive", "Reading & Reflection", "Practice & Simulation", "Discussion & Debate"
];

export const QUESTION_CATEGORIES = [
  "Leadership", "Customer Success", "Service Delivery", "ITIL", "Commercial",
  "Finance", "Executive Presence", "People Management", "Transformation",
  "Digital Workplace", "Cloud", "Cybersecurity", "AI", "Automation",
  "Project Management", "Portfolio Management", "Governance", "Audit",
  "Vendor Management", "Negotiation", "Conflict", "Communication",
  "Board Reporting", "Business Strategy", "Change Management", "Culture", "Innovation"
];

export const AI_PERSONALITIES = [
  {
    id: "executive_mentor",
    name: "Executive Mentor",
    subtitle: "Constructive Coach",
    description: "Constructive, structured, ITIL expert. Risk-focused, business-driven executive mentor.",
    traits: ["Constructive", "Structured", "ITIL Expert", "Risk Focused", "Business Driven"],
    communication_style: "Structured and methodical, uses frameworks and evidence-based reasoning.",
    leadership_style: "Servant leadership with strong governance and risk awareness.",
    question_style: "Probing but supportive — asks for context before challenging.",
    difficulty: "Medium",
    icon: "🎯"
  },
  {
    id: "strict_cio",
    name: "Strict CIO",
    subtitle: "The Challenger",
    description: "Challenges everything. Demands evidence, metrics, and business impact for every statement.",
    traits: ["Evidence-Based", "Metrics-Driven", "Business Impact", "No Fluff"],
    communication_style: "Direct, precise, and demanding. Cuts through vagueness immediately.",
    leadership_style: "Data-driven, outcome-focused, zero tolerance for unpreparedness.",
    question_style: "Rapid-fire, evidence-seeking. 'Show me the numbers.'",
    difficulty: "Hard",
    icon: "⚡"
  },
  {
    id: "supportive_coach",
    name: "Supportive Coach",
    subtitle: "Growth Partner",
    description: "Provides guidance, improves confidence, and builds communication skills with patience.",
    traits: ["Encouraging", "Patient", "Confidence Building", "Communication Focus"],
    communication_style: "Warm, patient, and encouraging. Uses positive reinforcement.",
    leadership_style: "Coaching-oriented, develops people through guided discovery.",
    question_style: "Open-ended, reflective. 'Tell me more about that.'",
    difficulty: "Easy",
    icon: "🌱"
  },
  {
    id: "country_manager",
    name: "Country Manager",
    subtitle: "Business Leader",
    description: "Tests commercial acumen, P&L thinking, and market strategy at a country level.",
    traits: ["Commercial", "Strategic", "P&L Focused", "Market Driven"],
    communication_style: "Business-focused, speaks in revenue, margin, and market share.",
    leadership_style: "Entrepreneurial, growth-oriented, accountable for full P&L.",
    question_style: "Commercial and strategic. 'What's the business case?'",
    difficulty: "Hard",
    icon: "🌍"
  },
  {
    id: "difficult_customer",
    name: "Difficult Customer",
    subtitle: "Stress Test",
    description: "Pushes back, interrupts, complains. Tests emotional intelligence and composure under pressure.",
    traits: ["Confrontational", "Interrupting", "Demanding", "Emotional Pressure"],
    communication_style: "Aggressive, interrupting, emotionally charged.",
    leadership_style: "Tests your ability to de-escalate and maintain composure.",
    question_style: "Leading, accusatory. 'Why should I trust you?'",
    difficulty: "Hard",
    icon: "🔥"
  },
  {
    id: "board_member",
    name: "Board Member",
    subtitle: "Governance",
    description: "Focuses on governance, risk, compliance, and shareholder value at the highest level.",
    traits: ["Governance", "Risk-Aware", "Shareholder Value", "Long-Term"],
    communication_style: "Formal, measured, asks about risk and long-term sustainability.",
    leadership_style: "Oversight and governance, holds executives accountable to stakeholders.",
    question_style: "Risk and strategy focused. 'What's the downside?'",
    difficulty: "Expert",
    icon: "👑"
  },
  {
    id: "cfo",
    name: "CFO",
    subtitle: "Financial",
    description: "Scrutinizes financial discipline, cost management, ROI, and budget ownership.",
    traits: ["Financial Rigor", "Cost-Conscious", "ROI-Driven", "Detail-Oriented"],
    communication_style: "Numbers-first, precise, challenges assumptions about cost and value.",
    leadership_style: "Financial discipline, cost optimization, value creation.",
    question_style: "Financial. 'What's the ROI? Show me the unit economics.'",
    difficulty: "Hard",
    icon: "💰"
  },
  {
    id: "coo",
    name: "COO",
    subtitle: "Operations",
    description: "Tests operational excellence, delivery capability, scaling, and execution discipline.",
    traits: ["Operational Excellence", "Execution", "Scaling", "Efficiency"],
    communication_style: "Execution-focused, speaks in SLAs, capacity, and throughput.",
    leadership_style: "Operational rigor, continuous improvement, delivery excellence.",
    question_style: "Operational. 'How do you scale this? What's your delivery model?'",
    difficulty: "Hard",
    icon: "⚙️"
  },
  {
    id: "hr_director",
    name: "HR Director",
    subtitle: "People",
    description: "Evaluates people leadership, culture building, talent development, and organizational design.",
    traits: ["People-First", "Cultural", "Talent Development", "Organizational Design"],
    communication_style: "Empathetic but probing on people decisions and cultural impact.",
    leadership_style: "Inclusive, talent-focused, builds cultures of high performance.",
    question_style: "People-focused. 'How did your team experience this?'",
    difficulty: "Medium",
    icon: "👥"
  },
  {
    id: "auditor",
    name: "Auditor",
    subtitle: "Compliance",
    description: "Demands process adherence, documentation, evidence trails, and governance compliance.",
    traits: ["Process-Rigid", "Evidence-Based", "Compliance", "Documentation"],
    communication_style: "Precise, skeptical, demands documentation and evidence.",
    leadership_style: "Process-driven, compliance-first, zero tolerance for gaps.",
    question_style: "Evidence-seeking. 'Show me the process. Where's the documentation?'",
    difficulty: "Expert",
    icon: "🔍"
  },
  {
    id: "transformation_director",
    name: "Transformation Director",
    subtitle: "Change",
    description: "Tests change management, transformation strategy, and ability to lead through disruption.",
    traits: ["Visionary", "Change Management", "Innovation", "Disruption"],
    communication_style: "Forward-looking, challenges status quo, pushes for transformation.",
    leadership_style: "Transformational, challenges the status quo, drives innovation.",
    question_style: "Strategic and visionary. 'How will you transform this?'",
    difficulty: "Hard",
    icon: "🚀"
  }
];

export const SESSION_TYPES = [
  { id: "45min_interview", label: "45-Minute Interview", duration: 45, icon: "Clock" },
  { id: "60min_interview", label: "60-Minute Interview", duration: 60, icon: "Clock" },
  { id: "panel_interview", label: "Panel Interview", duration: 60, icon: "Users" },
  { id: "board_interview", label: "Board Interview", duration: 60, icon: "Crown" },
  { id: "customer_escalation", label: "Customer Escalation", duration: 30, icon: "AlertTriangle" },
  { id: "executive_service_review", label: "Executive Service Review", duration: 45, icon: "BarChart3" },
  { id: "major_incident_bridge", label: "Major Incident Bridge", duration: 30, icon: "Siren" },
  { id: "business_review", label: "Business Review", duration: 45, icon: "TrendingUp" },
  { id: "qbr_simulation", label: "QBR Simulation", duration: 60, icon: "PieChart" },
  { id: "negotiation_meeting", label: "Negotiation Meeting", duration: 45, icon: "Handshake" },
  { id: "vendor_dispute", label: "Vendor Dispute", duration: 30, icon: "Scale" },
  { id: "crisis_management", label: "Crisis Management", duration: 30, icon: "ShieldAlert" },
  { id: "transformation_meeting", label: "Transformation Meeting", duration: 60, icon: "RefreshCw" },
  { id: "performance_review", label: "Performance Review", duration: 45, icon: "ClipboardCheck" },
  { id: "leadership_coaching", label: "Leadership Coaching Session", duration: 30, icon: "Heart" }
];

export const SESSION_DURATIONS = [15, 30, 45, 60, 90];

export const INTERVIEWER_PROFILES = [
  "Country Manager", "Regional Director", "Delivery Director", "Client Partner",
  "VP Operations", "CIO", "HR Director", "Technical Director", "Practice Head",
  "CFO", "COO", "Board Member"
];

export const DIFFICULTY_LEVELS = ["Entry", "Intermediate", "Advanced", "Expert"];

export const METRICS_LIBRARY = [
  { id: "sla", name: "SLA", fullName: "Service Level Agreement", category: "Service Delivery" },
  { id: "mttr", name: "MTTR", fullName: "Mean Time To Resolve", category: "Service Delivery" },
  { id: "mtta", name: "MTTA", fullName: "Mean Time To Acknowledge", category: "Service Delivery" },
  { id: "csat", name: "CSAT", fullName: "Customer Satisfaction Score", category: "Customer" },
  { id: "nps", name: "NPS", fullName: "Net Promoter Score", category: "Customer" },
  { id: "ces", name: "CES", fullName: "Customer Effort Score", category: "Customer" },
  { id: "fcr", name: "FCR", fullName: "First Contact Resolution", category: "Service Delivery" },
  { id: "utilization", name: "Utilization", fullName: "Resource Utilization Rate", category: "Operations" },
  { id: "backlog", name: "Backlog", fullName: "Ticket Backlog", category: "Operations" },
  { id: "availability", name: "Availability", fullName: "Service Availability", category: "Service Delivery" },
  { id: "capacity", name: "Capacity", fullName: "Capacity Planning", category: "Operations" },
  { id: "forecast_accuracy", name: "Forecast Accuracy", fullName: "Demand Forecast Accuracy", category: "Finance" },
  { id: "engagement", name: "Employee Engagement", fullName: "Employee Engagement Score", category: "People" },
  { id: "attrition", name: "Attrition", fullName: "Employee Attrition Rate", category: "People" },
  { id: "margin", name: "Financial Margin", fullName: "Gross/Net Margin", category: "Finance" },
  { id: "cost_per_ticket", name: "Cost Per Ticket", fullName: "Average Cost Per Ticket", category: "Finance" },
  { id: "automation_rate", name: "Automation Rate", fullName: "Process Automation Rate", category: "Technology" },
  { id: "knowledge_reuse", name: "Knowledge Reuse", fullName: "Knowledge Article Reuse Rate", category: "Operations" }
];

export const LEARNING_PATHS = [
  "Leadership", "Executive Communication", "Business Strategy", "Finance",
  "Commercial Thinking", "IT Service Management", "AI Leadership", "Cloud",
  "Cybersecurity", "Digital Transformation", "Governance", "Vendor Management",
  "Negotiation", "Storytelling", "Presentation Skills", "People Leadership",
  "Culture", "Innovation"
];

export const SCORE_DIMENSIONS = [
  { key: "executive_score", label: "Executive", color: "#6366f1", short: "Exec" },
  { key: "leadership_score", label: "Leadership", color: "#8b5cf6", short: "Lead" },
  { key: "commercial_score", label: "Commercial", color: "#06b6d4", short: "Comm" },
  { key: "communication_score", label: "Communication", color: "#3b82f6", short: "Comm" },
  { key: "executive_presence_score", label: "Presence", color: "#ec4899", short: "Pres" },
  { key: "business_acumen_score", label: "Business Acumen", color: "#f59e0b", short: "Bus" },
  { key: "strategic_thinking_score", label: "Strategic", color: "#10b981", short: "Strat" },
  { key: "customer_focus_score", label: "Customer", color: "#14b8a6", short: "Cust" },
  { key: "financial_thinking_score", label: "Financial", color: "#eab308", short: "Fin" },
  { key: "decision_quality_score", label: "Decision", color: "#a855f7", short: "Dec" },
  { key: "confidence_score", label: "Confidence", color: "#f97316", short: "Conf" },
  { key: "truthfulness_score", label: "Truthfulness", color: "#ef4444", short: "Truth" }
];

export const DAILY_CHALLENGES = [
  "Present a cost reduction plan to the CIO.",
  "Handle a P1 incident escalation with an angry customer.",
  "Lead a digital transformation kickoff meeting.",
  "Negotiate a contract renewal with a key vendor.",
  "Explain a security breach to the board.",
  "Respond to an unhappy customer threatening to leave.",
  "Present your QBR results to executive leadership.",
  "Lead a restructuring of your service desk team.",
  "Defend your budget cuts to the CFO.",
  "Present an AI automation strategy to reduce operational cost.",
  "Handle a team conflict between two senior managers.",
  "Pitch a new service offering to a prospective client."
];