/**
 * CPQ Catalog — Default seed data
 * All of this is seeded into the database and editable by admins.
 * Nothing in the pricing engine is hardcoded — it all reads from DB.
 */

export const DEFAULT_MODULES = [
  { module_id: "platform_core", name: "Platform Core", description: "Base platform fee — infrastructure, security, compliance, updates", type: "platform", category: "Core", icon: "🏗️", monthly_price: 2000, annual_price: 20000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 0 },

  { module_id: "executive_academy", name: "Executive Academy", description: "18 learning paths with daily lessons and certifications", type: "module", category: "Learning", icon: "🎓", monthly_price: 8, annual_price: 80, is_per_user: true, included_plans: ["professional", "executive", "enterprise"], is_active: true, sort_order: 1 },
  { module_id: "executive_coach", name: "Executive Coach", description: "11 AI personas mentoring 24/7 across leadership dimensions", type: "module", category: "Coaching", icon: "💬", monthly_price: 12, annual_price: 120, is_per_user: true, included_plans: ["professional", "executive", "enterprise"], is_active: true, sort_order: 2 },
  { module_id: "executive_simulator", name: "Executive Simulator", description: "15+ realistic scenarios: interviews, QBRs, crises, negotiations", type: "module", category: "Simulation", icon: "🧠", monthly_price: 15, annual_price: 150, is_per_user: true, included_plans: ["executive", "enterprise"], is_active: true, sort_order: 3 },
  { module_id: "career_studio", name: "Career Studio", description: "Resume builder, cover letters, LinkedIn optimizer, ATS scoring", type: "module", category: "Career", icon: "💼", monthly_price: 6, annual_price: 60, is_per_user: true, included_plans: ["professional", "executive", "enterprise"], is_active: true, sort_order: 4 },
  { module_id: "resume_intelligence", name: "Resume Intelligence", description: "AI-powered resume analysis with skill gap detection", type: "module", category: "Career", icon: "📄", monthly_price: 5, annual_price: 50, is_per_user: true, included_plans: ["professional", "executive", "enterprise"], is_active: true, sort_order: 5 },
  { module_id: "ats_analyzer", name: "ATS Analyzer", description: "Applicant tracking system compatibility scoring and optimization", type: "module", category: "Career", icon: "🔍", monthly_price: 4, annual_price: 40, is_per_user: true, included_plans: ["executive", "enterprise"], is_active: true, sort_order: 6 },
  { module_id: "truth_engine", name: "Truth Engine", description: "Detects exaggeration, inflated metrics, and false ownership", type: "module", category: "Intelligence", icon: "🛡️", monthly_price: 7, annual_price: 70, is_per_user: true, included_plans: ["executive", "enterprise"], is_active: true, sort_order: 7 },
  { module_id: "leadership_dna", name: "Leadership DNA", description: "Competency radar, strengths/weaknesses, executive readiness scoring", type: "module", category: "Intelligence", icon: "🧬", monthly_price: 10, annual_price: 100, is_per_user: true, included_plans: ["executive", "enterprise"], is_active: true, sort_order: 8 },
  { module_id: "executive_council", name: "Executive Council", description: "Multi-persona AI council for strategic decision-making", type: "module", category: "Intelligence", icon: "👥", monthly_price: 12, annual_price: 120, is_per_user: true, included_plans: ["enterprise"], is_active: true, sort_order: 9 },
  { module_id: "org_intelligence", name: "Organization Intelligence", description: "Deep profiles on 20+ global technology organizations", type: "module", category: "Intelligence", icon: "🏢", monthly_price: 8, annual_price: 80, is_per_user: true, included_plans: ["executive", "enterprise"], is_active: true, sort_order: 10 },
  { module_id: "executive_analytics", name: "Executive Analytics", description: "Radar charts, trends, and heat maps tracking executive growth", type: "module", category: "Analytics", icon: "📊", monthly_price: 6, annual_price: 60, is_per_user: true, included_plans: ["professional", "executive", "enterprise"], is_active: true, sort_order: 11 },
  { module_id: "marketplace", name: "Marketplace", description: "Premium content marketplace with learning paths and playbooks", type: "module", category: "Content", icon: "🏪", monthly_price: 3, annual_price: 30, is_per_user: true, included_plans: ["professional", "executive", "enterprise"], is_active: true, sort_order: 12 },
  { module_id: "admin_console", name: "Admin Console", description: "User management, role assignment, and organizational controls", type: "module", category: "Administration", icon: "⚙️", monthly_price: 2, annual_price: 20, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 13 },
  { module_id: "feature_flags", name: "Feature Flags", description: "Granular feature control and rollout management per organization", type: "module", category: "Administration", icon: "🚩", monthly_price: 1, annual_price: 10, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 14 },

  { module_id: "implementation", name: "Implementation", description: "White-glove onboarding, configuration, and go-live support", type: "service", category: "Professional Services", icon: "🚀", monthly_price: 0, annual_price: 15000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 20 },
  { module_id: "training", name: "Training", description: "Admin and end-user training sessions with certification", type: "service", category: "Professional Services", icon: "📚", monthly_price: 0, annual_price: 8000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 21 },
  { module_id: "data_migration", name: "Data Migration", description: "Migrate users, content, and progress from existing systems", type: "service", category: "Professional Services", icon: "📦", monthly_price: 0, annual_price: 12000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 22 },
  { module_id: "custom_integrations", name: "Custom Integrations", description: "Build custom API integrations with your existing stack", type: "service", category: "Professional Services", icon: "🔌", monthly_price: 0, annual_price: 10000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 23 },

  { module_id: "sso", name: "SSO", description: "Single Sign-On via SAML 2.0 / OIDC", type: "addon", category: "Identity", icon: "🔑", monthly_price: 0, annual_price: 5000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 30 },
  { module_id: "scim", name: "SCIM", description: "Automated user provisioning and deprovisioning via SCIM 2.0", type: "addon", category: "Identity", icon: "🔄", monthly_price: 0, annual_price: 3000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 31 },
  { module_id: "api_access", name: "API Access", description: "Full REST API access for custom workflows and reporting", type: "addon", category: "Developer", icon: "🔗", monthly_price: 0, annual_price: 2000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 32 },
  { module_id: "white_label", name: "White Label", description: "Custom branding, domain, and white-labeled experience (Future)", type: "addon", category: "Branding", icon: "🎨", monthly_price: 0, annual_price: 15000, is_per_user: false, included_plans: ["enterprise"], is_active: true, sort_order: 33 },
];

export const DEFAULT_SEAT_TIERS = [
  { tier_name: "100+", min_seats: 100, max_seats: 249, monthly_price_per_user: 15, annual_price_per_user: 150, sort_order: 1 },
  { tier_name: "250+", min_seats: 250, max_seats: 499, monthly_price_per_user: 14, annual_price_per_user: 140, sort_order: 2 },
  { tier_name: "500+", min_seats: 500, max_seats: 999, monthly_price_per_user: 13, annual_price_per_user: 130, sort_order: 3 },
  { tier_name: "1,000+", min_seats: 1000, max_seats: 2499, monthly_price_per_user: 12, annual_price_per_user: 120, sort_order: 4 },
  { tier_name: "2,500+", min_seats: 2500, max_seats: 4999, monthly_price_per_user: 11, annual_price_per_user: 110, sort_order: 5 },
  { tier_name: "5,000+", min_seats: 5000, max_seats: 9999, monthly_price_per_user: 10, annual_price_per_user: 100, sort_order: 6 },
  { tier_name: "10,000+", min_seats: 10000, max_seats: 49999, monthly_price_per_user: 9, annual_price_per_user: 90, sort_order: 7 },
  { tier_name: "50,000+", min_seats: 50000, max_seats: 0, monthly_price_per_user: 8, annual_price_per_user: 80, sort_order: 8 },
];

export const DEFAULT_AI_PACKAGES = [
  { package_id: "basic_ai", name: "Basic AI", description: "Essential AI features for daily learning", monthly_requests: 100, storage_gb: 5, priority_processing: false, advanced_models: false, monthly_price: 2, annual_price: 24, is_per_user: true, sort_order: 1 },
  { package_id: "professional_ai", name: "Professional AI", description: "Enhanced AI with higher limits", monthly_requests: 500, storage_gb: 20, priority_processing: false, advanced_models: false, monthly_price: 5, annual_price: 60, is_per_user: true, sort_order: 2 },
  { package_id: "executive_ai", name: "Executive AI", description: "Advanced models with priority processing", monthly_requests: 2000, storage_gb: 100, priority_processing: true, advanced_models: true, monthly_price: 10, annual_price: 120, is_per_user: true, sort_order: 3 },
  { package_id: "unlimited_ai", name: "Unlimited AI", description: "Unlimited requests with all features unlocked", monthly_requests: 0, storage_gb: 500, priority_processing: true, advanced_models: true, monthly_price: 20, annual_price: 240, is_per_user: true, sort_order: 4 },
];

export const DEFAULT_SUPPORT_PACKAGES = [
  { package_id: "standard", name: "Standard", description: "Email support during business hours", response_sla_hours: 48, dedicated_csm: false, technical_account_manager: false, support_24x7: false, monthly_price: 0, annual_price: 5000, sort_order: 1 },
  { package_id: "business", name: "Business", description: "Email and chat support with faster response", response_sla_hours: 24, dedicated_csm: false, technical_account_manager: false, support_24x7: false, monthly_price: 0, annual_price: 15000, sort_order: 2 },
  { package_id: "premium", name: "Premium", description: "24x7 support with dedicated Customer Success Manager", response_sla_hours: 4, dedicated_csm: true, technical_account_manager: false, support_24x7: true, monthly_price: 0, annual_price: 40000, sort_order: 3 },
  { package_id: "enterprise", name: "Enterprise", description: "24x7 support with CSM and Technical Account Manager", response_sla_hours: 1, dedicated_csm: true, technical_account_manager: true, support_24x7: true, monthly_price: 0, annual_price: 75000, sort_order: 4 },
];

export const DEFAULT_DISCOUNT_RULES = [
  { rule_id: "percentage", name: "Percentage Discount", discount_type: "percentage", discount_value: 0, max_discount_amount: 0, min_contract_value: 0, approval_threshold: 15000, multi_year_bonus: 0, is_active: true },
  { rule_id: "fixed", name: "Fixed Amount Discount", discount_type: "fixed", discount_value: 0, max_discount_amount: 0, min_contract_value: 0, approval_threshold: 10000, multi_year_bonus: 0, is_active: true },
  { rule_id: "promotional", name: "Promotional (10%)", discount_type: "promotional", discount_value: 10, max_discount_amount: 50000, min_contract_value: 0, approval_threshold: 50000, multi_year_bonus: 0, is_active: true },
  { rule_id: "partner", name: "Partner Discount (15%)", discount_type: "partner", discount_value: 15, max_discount_amount: 100000, min_contract_value: 0, approval_threshold: 100000, multi_year_bonus: 0, is_active: true },
  { rule_id: "educational", name: "Educational (25%)", discount_type: "educational", discount_value: 25, max_discount_amount: 0, min_contract_value: 0, approval_threshold: 0, multi_year_bonus: 5, is_active: true },
  { rule_id: "non_profit", name: "Non-Profit (30%)", discount_type: "non_profit", discount_value: 30, max_discount_amount: 0, min_contract_value: 0, approval_threshold: 0, multi_year_bonus: 5, is_active: true },
  { rule_id: "multi_year", name: "Multi-Year Bonus", discount_type: "percentage", discount_value: 0, max_discount_amount: 0, min_contract_value: 0, approval_threshold: 0, multi_year_bonus: 7, is_active: true },
];

export const DEFAULT_TAX_RULES = [
  { country_code: "US", country_name: "United States", tax_type: "sales_tax", rate: 0, description: "Varies by state — 0% default" },
  { country_code: "GB", country_name: "United Kingdom", tax_type: "vat", rate: 0.20, description: "VAT 20%" },
  { country_code: "DE", country_name: "Germany", tax_type: "vat", rate: 0.19, description: "VAT 19%" },
  { country_code: "FR", country_name: "France", tax_type: "vat", rate: 0.20, description: "VAT 20%" },
  { country_code: "NL", country_name: "Netherlands", tax_type: "vat", rate: 0.21, description: "VAT 21%" },
  { country_code: "SG", country_name: "Singapore", tax_type: "gst", rate: 0.09, description: "GST 9%" },
  { country_code: "PH", country_name: "Philippines", tax_type: "vat", rate: 0.12, description: "VAT 12%" },
  { country_code: "AU", country_name: "Australia", tax_type: "gst", rate: 0.10, description: "GST 10%" },
  { country_code: "JP", country_name: "Japan", tax_type: "sales_tax", rate: 0.10, description: "Consumption Tax 10%" },
  { country_code: "CA", country_name: "Canada", tax_type: "gst", rate: 0.05, description: "GST 5% (federal)" },
  { country_code: "IN", country_name: "India", tax_type: "gst", rate: 0.18, description: "GST 18%" },
  { country_code: "AE", country_name: "UAE", tax_type: "vat", rate: 0.05, description: "VAT 5%" },
];

export const DEFAULT_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", exchange_rate: 1, is_active: true },
  { code: "EUR", name: "Euro", symbol: "€", exchange_rate: 0.92, is_active: true },
  { code: "GBP", name: "British Pound", symbol: "£", exchange_rate: 0.79, is_active: true },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", exchange_rate: 1.35, is_active: true },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", exchange_rate: 56.0, is_active: true },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", exchange_rate: 1.52, is_active: true },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", exchange_rate: 150.0, is_active: true },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", exchange_rate: 1.36, is_active: true },
];