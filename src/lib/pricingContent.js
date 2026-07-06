export const PLAN_CONTENT = {
  free: {
    headline: "Start Your Executive Leadership Journey",
    audience: ["Students", "Graduates", "Early Career Professionals"],
    benefits: ["Learn the fundamentals", "Explore the platform", "Experience AI coaching"],
    roi: "Experience EXECLEAD.AI before upgrading.",
    cta: "Start Free",
    accent: "text-slate-400",
    ring: "border-white/10",
    glow: "from-slate-500/5",
  },
  professional: {
    headline: "Accelerate Your Leadership Career",
    audience: ["Team Leads", "Supervisors", "Engineers", "Operations Managers", "Service Desk Leads"],
    benefits: ["Career Growth", "Resume Intelligence", "Interview Success", "Daily AI Coaching", "Executive Academy"],
    roi: "Land your next promotion faster.",
    cta: "Start Professional",
    accent: "text-indigo-400",
    ring: "border-indigo-500/30",
    glow: "from-indigo-500/10",
  },
  executive: {
    headline: "Your Personal Executive Leadership Coach",
    audience: ["Senior Managers", "Regional Managers", "Service Delivery Managers", "Directors", "Country Managers", "Future CIOs"],
    benefits: ["Leadership DNA™", "Executive Council™", "Board Meeting Simulator", "Negotiation Coach", "Strategic Leadership"],
    roi: "Develop the capabilities expected from senior executive leaders.",
    cta: "Become an Executive Leader",
    accent: "text-purple-400",
    ring: "border-purple-500/40",
    glow: "from-purple-500/10",
    highlight: true,
  },
  enterprise: {
    headline: "Build Executive Leadership Across Your Organization",
    audience: ["Organizations", "Government", "Consulting", "Technology", "Banking", "Healthcare", "Global Enterprises"],
    benefits: ["Develop Future Leaders", "Succession Planning", "Leadership Analytics", "SSO & SCIM", "Dedicated Support"],
    roi: "Transform your organization's leadership capability.",
    cta: "Configure Proposal",
    startingUsers: 100,
    accent: "text-emerald-400",
    ring: "border-emerald-500/30",
    glow: "from-emerald-500/10",
  },
};

export const ENTERPRISE_OUTCOMES = [
  { icon: "GraduationCap", title: "Develop Future Leaders", desc: "Structured development programs that build leadership capability at every level of your organization." },
  { icon: "Rocket", title: "Accelerate Leadership Readiness", desc: "Shorten the path from manager to executive with AI-powered coaching and realistic simulation." },
  { icon: "Users", title: "Improve Succession Planning", desc: "Identify and develop your next generation of leaders before you need them." },
  { icon: "TrendingDown", title: "Reduce External Coaching Costs", desc: "AI-powered executive coaching at a fraction of traditional executive coaching fees." },
  { icon: "Gauge", title: "Measure Leadership Growth", desc: "Quantify capability with data-driven competency scoring and industry benchmarks." },
  { icon: "BookOpen", title: "Preserve Executive Knowledge", desc: "Capture and transfer institutional wisdom from retiring leaders to emerging talent." },
  { icon: "Layers", title: "Standardize Leadership Development", desc: "One consistent framework for excellence across every department and region." },
  { icon: "TrendingUp", title: "Increase Internal Promotions", desc: "Build ready-now talent pipelines and reduce external executive hiring costs." },
  { icon: "Shield", title: "Strengthen Organizational Capability", desc: "Build a resilient, adaptable leadership bench across your entire organization." },
];

export const FEATURE_GROUPS = {
  professional: [
    { category: "Leadership Development", items: ["Executive Academy", "AI Executive Coach", "Executive Simulator", "Executive Debate", "Career Studio", "Resume Intelligence"] },
  ],
  executive: [
    { category: "Executive Leadership", items: ["Leadership DNA™", "Executive Council™", "Board Review Simulator", "Executive Negotiation", "Executive Storytelling", "Commercial Leadership", "Strategic Thinking"] },
  ],
  enterprise: [
    { category: "Enterprise Leadership", items: ["Organization Dashboard", "HR Dashboard", "Leadership Analytics", "Promotion Readiness", "Succession Planning", "Learning Assignments", "Department Analytics", "Seat Management", "SSO", "SCIM", "API Access", "Audit Logs", "Dedicated Success Manager"] },
  ],
};

export const COMPARISON_ROWS = [
  { feature: "Executive Coach", free: "limited", pro: true, exec: true, ent: true, note: "5/day" },
  { feature: "Career Studio", free: false, pro: true, exec: true, ent: true },
  { feature: "Resume Builder", free: true, pro: true, exec: true, ent: true },
  { feature: "Resume Intelligence", free: false, pro: true, exec: true, ent: true },
  { feature: "ATS Analyzer", free: false, pro: true, exec: true, ent: true },
  { feature: "Executive Academy", free: false, pro: true, exec: true, ent: true },
  { feature: "Executive Simulator", free: "limited", pro: true, exec: true, ent: true, note: "3/week" },
  { feature: "Executive Debate", free: false, pro: true, exec: true, ent: true },
  { feature: "Truth Engine", free: false, pro: true, exec: true, ent: true },
  { feature: "Leadership DNA™", free: false, pro: false, exec: true, ent: true },
  { feature: "Executive Council™", free: false, pro: false, exec: true, ent: true },
  { feature: "Company Intelligence", free: "limited", pro: true, exec: true, ent: true, note: "1 company" },
  { feature: "Executive Analytics", free: false, pro: true, exec: true, ent: true },
  { feature: "Marketplace", free: true, pro: true, exec: true, ent: true },
  { feature: "Organization Dashboard", free: false, pro: false, exec: false, ent: true },
  { feature: "HR Dashboard", free: false, pro: false, exec: false, ent: true },
  { feature: "Promotion Readiness", free: false, pro: false, exec: false, ent: true },
  { feature: "Succession Planning", free: false, pro: false, exec: false, ent: true },
  { feature: "Learning Assignments", free: false, pro: false, exec: false, ent: true },
  { feature: "Seat Management", free: false, pro: false, exec: false, ent: true },
  { feature: "SSO", free: false, pro: false, exec: false, ent: true },
  { feature: "SCIM", free: false, pro: false, exec: false, ent: true },
  { feature: "API Access", free: false, pro: false, exec: false, ent: true },
  { feature: "Audit Logs", free: false, pro: false, exec: false, ent: true },
  { feature: "Dedicated Customer Success", free: false, pro: false, exec: false, ent: true },
];

export const FAQ_ITEMS = [
  { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription at any time from your billing settings. You'll retain access until the end of your current billing period. No questions asked, no cancellation fees." },
  { q: "Do you offer annual billing?", a: "Yes. Annual billing gives you 2 months free compared to monthly billing. For example, Professional is $29/month or $290/year — saving you $58 annually. You can switch between monthly and annual billing at any time." },
  { q: "How does Enterprise pricing work?", a: "Enterprise pricing is always custom-generated by our CPQ (Configure, Price, Quote) engine based on your number of active users, selected modules, AI package, support tier, and contract length. We never display fixed Enterprise pricing because every organization's needs are different. Use our Enterprise Estimator to get an instant estimate, then request a proposal for a tailored quote." },
  { q: "Do you support government organizations?", a: "Yes. We support government organizations with dedicated enterprise plans that include SSO, SCIM provisioning, audit logs, and compliance-ready features. Government and non-profit organizations qualify for special pricing discounts. Contact our sales team to discuss your requirements." },
  { q: "Can universities subscribe?", a: "Yes. We offer 25% educational discounts for universities and academic institutions. Enterprise plans for education include learning assignments, department analytics, and full SSO integration with your university's identity provider. Contact us to set up your institution." },
  { q: "Can I migrate existing users?", a: "Absolutely. Our implementation team handles user migration, content transfer, and progress tracking from your existing LMS or platform. Data migration is included as a professional service in enterprise contracts, and SCIM 2.0 enables automated provisioning going forward." },
  { q: "How does AI usage work?", a: "Each plan includes AI-powered coaching, simulation, and analysis. Professional and Executive plans have unlimited AI requests for individual users. Enterprise plans can choose from four AI packages (Basic, Professional, Executive, Unlimited) based on organizational usage needs. The AI Usage Dashboard lets admins track token consumption and costs in real time." },
  { q: "How does the CPQ engine work?", a: "Our CPQ engine dynamically generates enterprise pricing based on your configuration: seat count (with volume discounts at every tier), selected modules, AI package, support level, contract length, currency, and applicable tax rules. It automatically applies multi-year bonuses, educational discounts, and non-profit pricing. Every proposal generates a branded PDF with a full breakdown — no manual quotes, no hidden fees." },
];

export const TRUST_BADGES = [
  { icon: "Lock", title: "Enterprise-Grade Security", desc: "Bank-level encryption and security infrastructure" },
  { icon: "ShieldCheck", title: "Encrypted Data", desc: "All data encrypted in transit and at rest" },
  { icon: "EyeOff", title: "Privacy First", desc: "Your data is never sold or shared with third parties" },
  { icon: "FileCheck", title: "GDPR Ready", desc: "Full compliance with EU data protection regulations" },
  { icon: "ScrollText", title: "Audit Logs", desc: "Comprehensive activity logging for compliance" },
  { icon: "KeyRound", title: "Role-Based Access", desc: "Granular permissions and access controls" },
  { icon: "Headset", title: "Enterprise Support", desc: "Dedicated success team with priority SLAs" },
];