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
    subtitle: "Executive Coach",
    description: "Constructive, structured, ITIL expert. Risk-focused, business-driven executive mentor.",
    traits: ["Constructive", "Structured", "ITIL Expert", "Risk Focused", "Business Driven"],
    icon: "🎯"
  },
  {
    id: "strict_cio",
    name: "Strict CIO",
    subtitle: "The Challenger",
    description: "Challenges everything. Demands evidence, metrics, and business impact for every statement.",
    traits: ["Evidence-Based", "Metrics-Driven", "Business Impact", "No Fluff"],
    icon: "⚡"
  },
  {
    id: "supportive_coach",
    name: "Supportive Coach",
    subtitle: "Growth Partner",
    description: "Provides guidance, improves confidence, and builds communication skills with patience.",
    traits: ["Encouraging", "Patient", "Confidence Building", "Communication Focus"],
    icon: "🌱"
  },
  {
    id: "difficult_customer",
    name: "Difficult Customer",
    subtitle: "Stress Test",
    description: "Pushes back, interrupts, complains. Tests emotional intelligence and composure under pressure.",
    traits: ["Confrontational", "Interrupting", "Demanding", "Emotional Pressure"],
    icon: "🔥"
  }
];

export const SESSION_TYPES = [
  { id: "45min_interview", label: "45-Minute Interview", duration: "45 min", icon: "Clock" },
  { id: "60min_interview", label: "60-Minute Interview", duration: "60 min", icon: "Clock" },
  { id: "panel_interview", label: "Panel Interview", duration: "60 min", icon: "Users" },
  { id: "board_interview", label: "Board Interview", duration: "60 min", icon: "Crown" },
  { id: "customer_escalation", label: "Customer Escalation", duration: "30 min", icon: "AlertTriangle" },
  { id: "executive_service_review", label: "Executive Service Review", duration: "45 min", icon: "BarChart3" },
  { id: "major_incident_bridge", label: "Major Incident Bridge", duration: "30 min", icon: "Siren" },
  { id: "business_review", label: "Business Review", duration: "45 min", icon: "TrendingUp" },
  { id: "qbr_simulation", label: "QBR Simulation", duration: "60 min", icon: "PieChart" },
  { id: "negotiation_meeting", label: "Negotiation Meeting", duration: "45 min", icon: "Handshake" },
  { id: "vendor_dispute", label: "Vendor Dispute", duration: "30 min", icon: "Scale" },
  { id: "crisis_management", label: "Crisis Management", duration: "30 min", icon: "ShieldAlert" }
];

export const INTERVIEWER_PROFILES = [
  "Country Manager", "Regional Director", "Delivery Director", "Client Partner",
  "VP Operations", "CIO", "HR Director", "Technical Director", "Practice Head"
];

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

export const LESSON_CATEGORIES = [
  "Leadership Habits", "Executive Communication", "Business Writing",
  "Presentation Skills", "Negotiation", "Storytelling", "Finance",
  "Commercial Thinking", "AI & Emerging Tech", "Digital Transformation",
  "Coaching", "Executive Mindset"
];

export const SCORE_DIMENSIONS = [
  { key: "executive_score", label: "Executive", color: "#6366f1" },
  { key: "leadership_score", label: "Leadership", color: "#8b5cf6" },
  { key: "commercial_score", label: "Commercial", color: "#06b6d4" },
  { key: "confidence_score", label: "Confidence", color: "#f59e0b" },
  { key: "strategic_score", label: "Strategic", color: "#10b981" },
  { key: "executive_presence_score", label: "Presence", color: "#ec4899" },
  { key: "communication_score", label: "Communication", color: "#3b82f6" },
  { key: "truthfulness_score", label: "Truthfulness", color: "#ef4444" }
];