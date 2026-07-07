// ============================================================
// EXECUTIVE COUNCIL 3.0 — AI BOARD OF DIRECTORS
// 21 executive personas for realistic board deliberation
// ============================================================

export const COUNCIL_PERSONAS = [
  { id: "ceo", name: "CEO", title: "Chief Executive Officer", icon: "👑", perspective: "Vision & Strategy", focus: "Corporate vision, shareholder value, board relations, overall strategic direction, enterprise risk", color: "indigo", defaultSelected: true },
  { id: "coo", name: "COO", title: "Chief Operating Officer", icon: "⚙️", perspective: "Operations", focus: "Operational excellence, supply chain, process optimization, organizational efficiency, delivery", color: "blue", defaultSelected: true },
  { id: "cfo", name: "CFO", title: "Chief Financial Officer", icon: "💰", perspective: "Finance", focus: "P&L management, capital allocation, financial strategy, cost optimization, ROI, investor relations", color: "emerald", defaultSelected: true },
  { id: "cio", name: "CIO", title: "Chief Information Officer", icon: "💻", perspective: "Technology & Digital", focus: "IT strategy, digital transformation, technology investments, enterprise architecture, data", color: "cyan", defaultSelected: true },
  { id: "cto", name: "CTO", title: "Chief Technology Officer", icon: "🔧", perspective: "Engineering & Innovation", focus: "Technology strategy, engineering organization, R&D, innovation, technical architecture, platforms", color: "sky", defaultSelected: false },
  { id: "ciso", name: "CISO", title: "Chief Information Security Officer", icon: "🛡️", perspective: "Cybersecurity & Risk", focus: "Information security, risk governance, compliance, zero-trust, security operations, incident response", color: "red", defaultSelected: false },
  { id: "chro", name: "CHRO", title: "Chief HR Officer", icon: "👥", perspective: "People & Culture", focus: "Talent strategy, organizational design, leadership development, culture transformation, DEI", color: "pink", defaultSelected: true },
  { id: "cso", name: "CSO", title: "Chief Strategy Officer", icon: "♟️", perspective: "Strategy & M&A", focus: "Corporate strategy, M&A, competitive positioning, market analysis, growth strategy, partnerships", color: "violet", defaultSelected: true },
  { id: "cmo", name: "CMO", title: "Chief Marketing Officer", icon: "📣", perspective: "Marketing & Brand", focus: "Brand strategy, market positioning, demand generation, customer acquisition, communications", color: "orange", defaultSelected: false },
  { id: "cro", name: "CRO", title: "Chief Revenue Officer", icon: "📈", perspective: "Revenue & Sales", focus: "Revenue strategy, sales operations, go-to-market, pricing, channel partnerships, revenue forecasting", color: "green", defaultSelected: false },
  { id: "cco", name: "CCO", title: "Chief Customer Officer", icon: "🤝", perspective: "Customer & Experience", focus: "Customer experience, retention, customer success, NPS, customer-centric transformation", color: "teal", defaultSelected: false },
  { id: "clo", name: "GC", title: "Chief Legal Officer / General Counsel", icon: "⚖️", perspective: "Legal & Compliance", focus: "Legal strategy, regulatory compliance, contracts, IP, litigation, corporate governance, risk", color: "slate", defaultSelected: false },
  { id: "board_member", name: "Director", title: "Board Member", icon: "🏛️", perspective: "Governance & Oversight", focus: "Board governance, fiduciary duty, strategic oversight, executive accountability, stakeholder interests", color: "amber", defaultSelected: true },
  { id: "independent_director", name: "Ind. Director", title: "Independent Director", icon: "🎯", perspective: "Independent Oversight", focus: "Independent judgment, conflict resolution, objective scrutiny, minority shareholder protection", color: "yellow", defaultSelected: false },
  { id: "country_manager", name: "Country Mgr", title: "Country Manager", icon: "🌍", perspective: "Regional & Market", focus: "Market entry, regional strategy, local partnerships, cultural adaptation, regulatory navigation", color: "lime", defaultSelected: false },
  { id: "regional_vp", name: "Regional VP", title: "Regional Vice President", icon: "🗺️", perspective: "Regional Operations", focus: "Regional P&L, market expansion, cross-border operations, regional team leadership, localization", color: "green", defaultSelected: false },
  { id: "vp_ops", name: "VP Operations", title: "VP Operations", icon: "📋", perspective: "Operations Execution", focus: "Day-to-day operations, process improvement, operational metrics, capacity planning, quality", color: "blue", defaultSelected: false },
  { id: "vp_sales", name: "VP Sales", title: "VP Sales", icon: "💼", perspective: "Sales Execution", focus: "Sales strategy execution, quota attainment, sales team management, pipeline, deal acceleration", color: "emerald", defaultSelected: false },
  { id: "vp_engineering", name: "VP Engineering", title: "VP Engineering", icon: "🔨", perspective: "Engineering Execution", focus: "Engineering delivery, technical debt, team scaling, development practices, technical operations", color: "cyan", defaultSelected: false },
  { id: "risk_officer", name: "Risk Officer", title: "Chief Risk Officer", icon: "⚠️", perspective: "Enterprise Risk", focus: "Enterprise risk management, operational risk, financial risk, strategic risk, risk framework", color: "red", defaultSelected: false },
  { id: "investor_rep", name: "Investor", title: "Investor Representative", icon: "📊", perspective: "Investor & Capital", focus: "Capital allocation, return on investment, growth expectations, exit strategy, valuation, market position", color: "purple", defaultSelected: false },
];

export const DEFAULT_BOARD = COUNCIL_PERSONAS.filter((p) => p.defaultSelected).map((p) => p.id);

export const EXAMPLE_QUESTIONS = [
  "Should we migrate our on-premise infrastructure to the cloud?",
  "Should we acquire our largest competitor or build competing capabilities organically?",
  "How should we restructure our technology organization for scale?",
  "Should we expand into the APAC market next year?",
  "How do we reduce our operating costs by 15% without impacting growth?",
  "Should we pursue a Series C funding round or pursue profitability?",
];

export const SENTIMENT_STYLES = {
  support: { label: "Support", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", cell: "bg-emerald-500/15 border-emerald-500/20", text: "text-emerald-400" },
  caution: { label: "Caution", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", dot: "bg-amber-400", cell: "bg-amber-500/15 border-amber-500/20", text: "text-amber-400" },
  oppose: { label: "Oppose", badge: "bg-red-500/15 text-red-400 border-red-500/20", dot: "bg-red-400", cell: "bg-red-500/15 border-red-500/20", text: "text-red-400" },
};

export const CONSENSUS_STYLES = {
  unanimous: { label: "Unanimous", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  strong: { label: "Strong Consensus", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  moderate: { label: "Moderate Consensus", color: "text-amber-400", bg: "bg-amber-500/10" },
  divided: { label: "Board Divided", color: "text-red-400", bg: "bg-red-500/10" },
};

export const DEBATE_TYPE_STYLES = {
  agree: { label: "Agrees", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "👍" },
  disagree: { label: "Disagrees", color: "text-red-400", bg: "bg-red-500/10", icon: "⚡" },
  concern: { label: "Raises Concern", color: "text-amber-400", bg: "bg-amber-500/10", icon: "⚠️" },
  question: { label: "Questions", color: "text-blue-400", bg: "bg-blue-500/10", icon: "❓" },
};