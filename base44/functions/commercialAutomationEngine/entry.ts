import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const AIRTABLE_API = "https://api.airtable.com/v0";
const MEMBERS_TABLE = "Executive Members";
const PLAN_MONTHLY = {
  free: 0, professional: 29, executive: 79, enterprise: 500,
  "founding member": 59.25, founding: 59.25, developer_unlimited: 0,
};
const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

// ════════════════════════════════════════════════════════════════
// Airtable Helpers
// ════════════════════════════════════════════════════════════════
let schemaCache = null;

async function resolveSchema(token) {
  if (schemaCache) return schemaCache;
  const h = { Authorization: `Bearer ${token}` };
  const basesRes = await fetch(`${AIRTABLE_API}/meta/bases`, { headers: h });
  if (!basesRes.ok) throw new Error(`Airtable bases lookup failed: ${basesRes.status}`);
  const bases = (await basesRes.json()).bases || [];
  for (const base of bases) {
    const tRes = await fetch(`${AIRTABLE_API}/meta/bases/${base.id}/tables`, { headers: h });
    if (!tRes.ok) continue;
    const tables = (await tRes.json()).tables || [];
    const members = tables.find((t) => t.name === MEMBERS_TABLE);
    if (members) {
      schemaCache = { baseId: base.id, membersTableId: members.id };
      return schemaCache;
    }
  }
  throw new Error(`Could not find "${MEMBERS_TABLE}" table in Airtable.`);
}

async function fetchAllRecords(token, baseId, tableId) {
  const h = { Authorization: `Bearer ${token}` };
  let all = [], offset = null;
  for (let i = 0; i < 50; i++) {
    let url = `${AIRTABLE_API}/${baseId}/${tableId}?pageSize=100`;
    if (offset) url += `&offset=${offset}`;
    const res = await fetch(url, { headers: h });
    if (!res.ok) throw new Error(`Airtable list failed: ${res.status}`);
    const data = await res.json();
    all = all.concat(data.records || []);
    offset = data.offset;
    if (!offset) break;
  }
  return all;
}

async function fetchCRMData(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("airtable");
  const schema = await resolveSchema(accessToken);
  return await fetchAllRecords(accessToken, schema.baseId, schema.membersTableId);
}

// ════════════════════════════════════════════════════════════════
// Data Helpers
// ════════════════════════════════════════════════════════════════
const num = (v) => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || 0 : 0);
const str = (v) => (v ? String(v) : "");
const bool = (v) => v === true || v === 1 || v === "true";
const parseDate = (v) => { if (!v) return null; try { const d = new Date(v); return isNaN(d.getTime()) ? null : d; } catch { return null; } };
const daysSince = (ds) => { const dt = parseDate(ds); if (!dt) return null; return Math.floor((Date.now() - dt.getTime()) / 86400000); };
const withinDays = (ds, d) => { const dt = parseDate(ds); if (!dt) return false; const diff = (Date.now() - dt.getTime()) / 86400000; return diff >= 0 && diff <= d; };
const isToday = (ds) => { const dt = parseDate(ds); if (!dt) return false; return dt.toDateString() === new Date().toDateString(); };
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const clamp = (n) => Math.max(0, Math.min(100, n));

function normalizePlan(v) {
  const s = str(v).toLowerCase().trim();
  if (s.includes("founding")) return "founding member";
  if (s.includes("enterprise")) return "enterprise";
  if (s.includes("executive")) return "executive";
  if (s.includes("professional")) return "professional";
  if (s.includes("developer")) return "developer_unlimited";
  return "free";
}

// ════════════════════════════════════════════════════════════════
// KPI Computation
// ════════════════════════════════════════════════════════════════
function computeKPIs(records) {
  const fields = records.map((r) => r.fields || {});
  const total = records.length;
  const newToday = fields.filter((f) => isToday(f["Registration Date"])).length;
  const newWeek = fields.filter((f) => withinDays(f["Registration Date"], 7)).length;
  const active7 = fields.filter((f) => withinDays(f["Last Login"], 7)).length;
  const active30 = fields.filter((f) => withinDays(f["Last Login"], 30)).length;
  const plans = fields.map((f) => normalizePlan(f["Current Plan"] || f["Membership Type"]));
  const free = plans.filter((p) => p === "free").length;
  const professional = plans.filter((p) => p === "professional").length;
  const executive = plans.filter((p) => p === "executive").length;
  const enterprise = plans.filter((p) => p === "enterprise").length;
  const founding = plans.filter((p) => p === "founding member").length;
  const statuses = fields.map((f) => str(f["Status"]).toLowerCase());
  const trial = statuses.filter((s) => s.includes("trial")).length;
  const churned = statuses.filter((s) => s.includes("churn") || s.includes("cancel")).length;
  const paid = professional + executive + enterprise + founding;
  const trialConv = paid + trial > 0 ? (paid / (paid + trial)) * 100 : 0;

  let mrr = 0;
  fields.forEach((f) => {
    const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]);
    const st = str(f["Status"]).toLowerCase();
    if (st.includes("churn") || st.includes("cancel")) return;
    mrr += PLAN_MONTHLY[plan] || 0;
  });
  const arr = mrr * 12;
  const arpu = total > 0 ? mrr / total : 0;
  const churnRate = total > 0 ? (churned / total) * 100 : 0;
  const recentMrr = fields
    .filter((f) => withinDays(f["Registration Date"], 7))
    .reduce((s, f) => s + (PLAN_MONTHLY[normalizePlan(f["Current Plan"] || f["Membership Type"])] || 0), 0);
  const revenueGrowth = mrr > 0 ? (recentMrr / mrr) * 100 : 0;
  const clv = arpu * 12;
  const avgExec = fields.length > 0 ? fields.reduce((a, f) => a + num(f["Executive Score"]), 0) / fields.length : 0;
  const avgId = fields.length > 0 ? fields.reduce((a, f) => a + num(f["Identity Completion"]), 0) / fields.length : 0;

  return {
    totalUsers: total, newUsersToday: newToday, newUsersThisWeek: newWeek,
    active7d: active7, active30d: active30,
    freeMembers: free, professionalMembers: professional, executiveMembers: executive,
    enterpriseCustomers: enterprise, foundingMembers: founding,
    trialUsers: trial, trialConversionRate: r1(trialConv),
    mrr: r2(mrr), arr: r2(arr), arpu: r2(arpu), clv: r2(clv),
    churnRate: r1(churnRate), revenueGrowth: r1(revenueGrowth),
    avgExecScore: r1(avgExec), avgIdentityCompletion: r1(avgId),
  };
}

// ════════════════════════════════════════════════════════════════
// Growth Intelligence
// ════════════════════════════════════════════════════════════════
function computeGrowth(records) {
  const fields = records.map((r) => r.fields || {});
  const seniorTitles = /\b(ceo|cto|cfo|coo|cio|chief|vp|vice president|director|head of|partner|founder|managing)\b/i;

  const likelyToUpgrade = fields
    .filter((f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); return plan === "free" || str(f["Status"]).toLowerCase().includes("trial"); })
    .map((f) => {
      const execScore = num(f["Executive Score"]); const idComp = num(f["Identity Completion"]); const ldna = num(f["Leadership DNA Score"]); const active7 = withinDays(f["Last Login"], 7);
      const probability = Math.min(100, execScore * 0.4 + idComp * 0.3 + ldna * 0.3);
      const recommendedPlan = execScore >= 60 ? "Executive" : "Professional";
      return { name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", email: str(f["Email"]), currentPlan: normalizePlan(f["Current Plan"] || f["Membership Type"]), recommendedPlan, probability: r1(probability), reason: `Exec Score: ${execScore}, Identity: ${idComp}%`, expectedRevenue: recommendedPlan === "Executive" ? 948 : 348 };
    })
    .filter((u) => u.probability >= 30).sort((a, b) => b.probability - a.probability).slice(0, 10);

  const enterpriseOpps = fields
    .filter((f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); return plan !== "enterprise" && plan !== "founding member"; })
    .filter((f) => str(f["Company"]).length > 0 || seniorTitles.test(str(f["Job Title"])))
    .map((f) => ({ name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", email: str(f["Email"]), company: str(f["Company"]), currentPlan: normalizePlan(f["Current Plan"] || f["Membership Type"]), reason: seniorTitles.test(str(f["Job Title"])) ? `Senior title: ${str(f["Job Title"])}` : `Company: ${str(f["Company"])}`, expectedRevenue: 6000 }))
    .slice(0, 10);

  const paidPlans = ["professional", "executive", "enterprise", "founding member"];
  const atRisk = fields
    .filter((f) => paidPlans.includes(normalizePlan(f["Current Plan"] || f["Membership Type"])))
    .map((f) => { const days = daysSince(f["Last Login"]) || 0; const riskLevel = days >= 30 ? "critical" : days >= 21 ? "high" : "medium"; return { name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", email: str(f["Email"]), plan: normalizePlan(f["Current Plan"] || f["Membership Type"]), daysInactive: days, riskLevel, expectedRevenueLoss: PLAN_MONTHLY[normalizePlan(f["Current Plan"] || f["Membership Type"])] * 12 }; })
    .filter((u) => u.daysInactive >= 14).sort((a, b) => b.daysInactive - a.daysInactive).slice(0, 10);

  const outreach = [
    ...likelyToUpgrade.slice(0, 3).map((u) => ({ name: u.name, email: u.email, reason: `High upgrade probability (${u.probability}%) — ${u.reason}`, priority: "high" })),
    ...atRisk.slice(0, 3).map((u) => ({ name: u.name, email: u.email, reason: `At-risk ${u.plan} subscriber — ${u.daysInactive}d inactive`, priority: u.riskLevel })),
    ...enterpriseOpps.slice(0, 3).map((u) => ({ name: u.name, email: u.email, reason: `Enterprise opportunity — ${u.reason}`, priority: "medium" })),
  ];

  return { likelyToUpgrade, enterpriseOpportunities: enterpriseOpps, atRiskSubscribers: atRisk, outreachNeeded: outreach };
}

// ════════════════════════════════════════════════════════════════
// Default Automation Rules
// ════════════════════════════════════════════════════════════════
const DEFAULT_RULES = [
  {
    name: "New Executive Signup Follow-up",
    description: "When a new Executive subscriber signs up, create a Founder follow-up task.",
    trigger: "new_executive_signup",
    actions_json: JSON.stringify(["create_task:follow_up", "notify_founder"]),
    cooldown_hours: 168,
    priority: "high",
    is_system: true,
  },
  {
    name: "Enterprise Inquiry Detection",
    description: "When an enterprise inquiry is detected, create an Enterprise Opportunity and notify the Founder.",
    trigger: "enterprise_inquiry",
    actions_json: JSON.stringify(["create_task:enterprise_opportunity", "notify_founder"]),
    cooldown_hours: 168,
    priority: "critical",
    is_system: true,
  },
  {
    name: "Trial Expiring Upgrade Email",
    description: "When a trial is about to expire in 3 days, queue an upgrade email.",
    trigger: "trial_expiring_3d",
    actions_json: JSON.stringify(["create_task:upgrade_email"]),
    cooldown_hours: 72,
    priority: "medium",
    is_system: true,
  },
  {
    name: "High Promotion Readiness Recommendation",
    description: "When a user reaches 90% Promotion Readiness, recommend the Executive plan.",
    trigger: "high_promotion_readiness",
    actions_json: JSON.stringify(["create_task:recommendation"]),
    cooldown_hours: 168,
    priority: "medium",
    is_system: true,
  },
  {
    name: "Inactive User Re-engagement",
    description: "When a user is inactive for 14 days, queue a re-engagement campaign.",
    trigger: "inactive_14d",
    actions_json: JSON.stringify(["create_task:re_engagement"]),
    cooldown_hours: 168,
    priority: "medium",
    is_system: true,
  },
  {
    name: "Dormant Executive Retention",
    description: "When an Executive subscriber becomes dormant (21d inactive), trigger high priority retention workflow.",
    trigger: "dormant_executive",
    actions_json: JSON.stringify(["create_task:retention", "notify_founder"]),
    cooldown_hours: 168,
    priority: "critical",
    is_system: true,
  },
  {
    name: "Founding Member Welcome Workflow",
    description: "When a Founding Member purchases, send welcome workflow, notify Founder, and issue Founding Member benefits.",
    trigger: "founding_member_purchased",
    actions_json: JSON.stringify(["create_task:welcome_workflow", "notify_founder", "create_task:issue_benefits"]),
    cooldown_hours: 720,
    priority: "critical",
    is_system: true,
  },
];

// ════════════════════════════════════════════════════════════════
// Rule Evaluation
// ════════════════════════════════════════════════════════════════
function matchesRule(rule, fields) {
  const trigger = rule.trigger;
  const plan = normalizePlan(fields["Current Plan"] || fields["Membership Type"]);
  const status = str(fields["Status"]).toLowerCase();
  const daysSinceReg = daysSince(fields["Registration Date"]);
  const daysSinceLogin = daysSince(fields["Last Login"]);
  const promoReadiness = num(fields["Promotion Readiness"]);

  switch (trigger) {
    case "new_executive_signup":
      return plan === "executive" && daysSinceReg !== null && daysSinceReg <= 1;
    case "enterprise_inquiry":
      return plan === "enterprise" && daysSinceReg !== null && daysSinceReg <= 7;
    case "trial_expiring_3d":
      return status.includes("trial") && daysSinceReg !== null && daysSinceReg >= 12;
    case "high_promotion_readiness":
      return promoReadiness >= 90;
    case "inactive_14d":
      return daysSinceLogin !== null && daysSinceLogin >= 14 && daysSinceLogin < 21;
    case "dormant_executive":
      return plan === "executive" && daysSinceLogin !== null && daysSinceLogin >= 21;
    case "founding_member_purchased":
      return plan === "founding member" && daysSinceReg !== null && daysSinceReg <= 7;
    default:
      return false;
  }
}

const TASK_TEMPLATES = {
  new_executive_signup: { task_type: "follow_up", suggested_action: "Send personalized welcome message and schedule onboarding call", expected_impact: "Ensure retention of $79/mo subscription and encourage full platform adoption", expected_revenue: 948, owner: "founder", exec_rec: "Reach out within 24 hours to ensure successful onboarding. Highlight Executive-tier features and schedule a platform walkthrough." },
  enterprise_inquiry: { task_type: "enterprise_opportunity", suggested_action: "Prepare a customized enterprise proposal and arrange a discovery call", expected_impact: "Secure enterprise contract worth $500+/mo", expected_revenue: 6000, owner: "enterprise", exec_rec: "Prepare a customized enterprise proposal and arrange a discovery call within 48 hours. Leverage their company context for a tailored pitch." },
  trial_expiring_3d: { task_type: "upgrade_email", suggested_action: "Send personalized upgrade email highlighting value already experienced", expected_impact: "Convert trial user to paid subscriber", expected_revenue: 348, owner: "marketing", exec_rec: "Send a personalized upgrade email highlighting the value they've already experienced. Include a limited-time offer to create urgency." },
  high_promotion_readiness: { task_type: "recommendation", suggested_action: "Recommend the Executive plan to accelerate career advancement", expected_impact: "Upgrade free/trial user to Executive ($79/mo)", expected_revenue: 948, owner: "marketing", exec_rec: "Recommend the Executive plan with a personalized message about how it will accelerate their career advancement given their high readiness score." },
  inactive_14d: { task_type: "re_engagement", suggested_action: "Send re-engagement email with personalized content based on last activity", expected_impact: "Reactivate inactive user and prevent churn", expected_revenue: 348, owner: "marketing", exec_rec: "Send a re-engagement email with personalized content based on their last activity. Highlight new features or content since their last visit." },
  dormant_executive: { task_type: "retention", suggested_action: "Personal outreach from Founder — high priority retention workflow", expected_impact: "Retain high-value Executive subscriber ($948/yr)", expected_revenue: 948, owner: "founder", exec_rec: "This is a high-value retention situation — personal outreach from the Founder recommended immediately. Schedule a 1:1 call to understand their needs." },
  founding_member_purchased: { task_type: "welcome_workflow", suggested_action: "Execute welcome workflow, notify Founder, and issue all founding benefits", expected_impact: "Ensure Founding Member activation and advocacy", expected_revenue: 711, owner: "founder", exec_rec: "Execute the full welcome workflow: send personalized welcome, notify the Founder, and issue all founding benefits including certificate and referral setup." },
};

function buildTaskFromRule(rule, fields) {
  const trigger = rule.trigger;
  const name = str(fields["Full Name"]) || str(fields["Email"]) || "Unknown";
  const email = str(fields["Email"]);
  const company = str(fields["Company"]);
  const plan = normalizePlan(fields["Current Plan"] || fields["Membership Type"]);
  const tpl = TASK_TEMPLATES[trigger] || {};

  const titles = {
    new_executive_signup: `Follow up with new Executive subscriber: ${name}`,
    enterprise_inquiry: `Enterprise Opportunity: ${name}${company ? ` (${company})` : ""}`,
    trial_expiring_3d: `Trial expiring — send upgrade email to ${name}`,
    high_promotion_readiness: `Recommend Executive plan to ${name} (90%+ readiness)`,
    inactive_14d: `Re-engagement campaign for inactive user: ${name}`,
    dormant_executive: `URGENT: Retention outreach for dormant Executive: ${name}`,
    founding_member_purchased: `Founding Member welcome workflow: ${name}`,
  };

  const dueDays = { critical: 0, high: 1, medium: 3, low: 7 };
  const due = new Date();
  due.setDate(due.getDate() + (dueDays[rule.priority] || 3));

  return {
    title: titles[trigger] || `Commercial action: ${name}`,
    description: rule.description || "",
    priority: rule.priority,
    task_type: tpl.task_type || "follow_up",
    reason: `Triggered by rule "${rule.name}" (${trigger})`,
    suggested_action: tpl.suggested_action || "Review and take appropriate action",
    expected_impact: tpl.expected_impact || "",
    expected_revenue: tpl.expected_revenue || 0,
    owner: tpl.owner || "founder",
    due_date: due.toISOString().split("T")[0],
    status: "pending",
    source_rule_id: rule.id,
    source_rule_name: rule.name,
    source_trigger: trigger,
    target_email: email,
    target_name: name,
    target_company: company,
    target_plan: plan,
    exec_recommendation: tpl.exec_rec || `Review and take action on ${name}.`,
  };
}

async function evaluateRules(base44) {
  const records = await fetchCRMData(base44);
  let rules = await base44.asServiceRole.entities.AutomationRule.filter({ enabled: true });

  // Seed defaults if no rules exist
  if (rules.length === 0) {
    await seedDefaultRules(base44);
    rules = await base44.asServiceRole.entities.AutomationRule.filter({ enabled: true });
  }

  const tasksCreated = [];
  const ruleReports = [];

  for (const rule of rules) {
    const matchingRecords = records.filter((r) => matchesRule(rule, r.fields || {}));
    if (matchingRecords.length === 0) {
      ruleReports.push({ ruleId: rule.id, ruleName: rule.name, trigger: rule.trigger, matches: 0, tasksCreated: 0, status: "no_match" });
      continue;
    }

    let created = 0;
    let skipped = 0;

    for (const record of matchingRecords) {
      const fields = record.fields || {};
      const email = str(fields["Email"]);
      if (!email) { skipped++; continue; }

      // Check cooldown — existing task with same rule + email within cooldown window
      const cooldownMs = (rule.cooldown_hours || 24) * 3600 * 1000;
      const since = new Date(Date.now() - cooldownMs).toISOString();
      const existing = await base44.asServiceRole.entities.CommercialTask.filter({
        source_rule_id: rule.id,
        target_email: email,
      });
      const inCooldown = existing.some((t) => new Date(t.created_date) > new Date(since));
      if (inCooldown) { skipped++; continue; }

      const taskData = buildTaskFromRule(rule, fields);
      const createdTask = await base44.asServiceRole.entities.CommercialTask.create(taskData);
      tasksCreated.push(createdTask);
      created++;
    }

    // Update rule execution stats
    const history = (() => { try { return JSON.parse(rule.execution_history_json || "[]"); } catch { return []; } })();
    history.unshift({ date: new Date().toISOString(), matches: matchingRecords.length, tasksCreated: created, skipped, status: created > 0 ? "success" : "no_match" });
    await base44.asServiceRole.entities.AutomationRule.update(rule.id, {
      execution_count: (rule.execution_count || 0) + 1,
      last_fired_date: new Date().toISOString(),
      last_execution_status: created > 0 ? "success" : "no_match",
      last_execution_summary: `${created} tasks created, ${skipped} skipped (cooldown)`,
      execution_history_json: JSON.stringify(history.slice(0, 50)),
    });

    ruleReports.push({ ruleId: rule.id, ruleName: rule.name, trigger: rule.trigger, matches: matchingRecords.length, tasksCreated: created, skipped, status: created > 0 ? "success" : "no_match" });
  }

  return { tasksCreated: tasksCreated.length, ruleReports, evaluatedAt: new Date().toISOString() };
}

async function seedDefaultRules(base44) {
  const existing = await base44.asServiceRole.entities.AutomationRule.filter({});
  if (existing.length > 0) return { seeded: 0, message: "Rules already exist" };

  const created = await base44.asServiceRole.entities.AutomationRule.bulkCreate(
    DEFAULT_RULES.map((r) => ({ ...r, enabled: true, execution_count: 0 }))
  );
  return { seeded: created.length, message: `Seeded ${created.length} default automation rules` };
}

// ════════════════════════════════════════════════════════════════
// Commercial Health™
// ════════════════════════════════════════════════════════════════
function computeHealth(records) {
  const kpis = computeKPIs(records);
  const growth = computeGrowth(records);
  const fields = records.map((r) => r.fields || {});
  const total = records.length || 1;

  // Revenue Health: MRR growth + ARPU + CLV
  const revenueGrowthScore = clamp(kpis.revenueGrowth);
  const arpuScore = clamp((kpis.arpu / 79) * 100);
  const clvScore = clamp((kpis.clv / 1000) * 100);
  const revenueHealth = r1(revenueGrowthScore * 0.4 + arpuScore * 0.3 + clvScore * 0.3);

  // Growth Health: new users + activation rate + revenue growth
  const newUsersScore = clamp(kpis.newUsersThisWeek * 10);
  const activationScore = clamp((kpis.active7d / total) * 100);
  const growthHealth = r1(newUsersScore * 0.4 + activationScore * 0.3 + revenueGrowthScore * 0.3);

  // Retention Health: inverse churn + active30 + at-risk
  const churnScore = clamp(100 - kpis.churnRate);
  const active30Score = clamp((kpis.active30d / total) * 100);
  const atRiskRatio = (growth.atRiskSubscribers.length / total) * 100;
  const atRiskScore = clamp(100 - atRiskRatio);
  const retentionHealth = r1(churnScore * 0.5 + active30Score * 0.25 + atRiskScore * 0.25);

  // Activation Health: identity completion + exec score + trial conversion
  const idScore = clamp(kpis.avgIdentityCompletion);
  const execScore = clamp(kpis.avgExecScore);
  const trialScore = clamp(kpis.trialConversionRate);
  const activationHealth = r1(idScore * 0.4 + execScore * 0.3 + trialScore * 0.3);

  // Enterprise Health: enterprise count + conversion + pipeline
  const entCountScore = clamp(kpis.enterpriseCustomers * 20);
  const entConvScore = clamp((kpis.enterpriseCustomers / total) * 500);
  const pipelineScore = clamp(growth.enterpriseOpportunities.length * 10);
  const enterpriseHealth = r1(entCountScore * 0.4 + entConvScore * 0.3 + pipelineScore * 0.3);

  // Commercial Health Score: weighted composite
  const commercialHealth = r1(
    revenueHealth * 0.30 + growthHealth * 0.25 + retentionHealth * 0.25 + activationHealth * 0.10 + enterpriseHealth * 0.10
  );

  const healthLabel = commercialHealth >= 80 ? "Excellent" : commercialHealth >= 60 ? "Healthy" : commercialHealth >= 40 ? "Needs Attention" : "Critical";

  return {
    commercialHealth, healthLabel,
    revenueHealth, growthHealth, retentionHealth, activationHealth, enterpriseHealth,
    details: { ...kpis, atRiskCount: growth.atRiskSubscribers.length, upgradePipeline: growth.likelyToUpgrade.length, enterprisePipeline: growth.enterpriseOpportunities.length },
    computedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════
// Founder Daily Actions™
// ════════════════════════════════════════════════════════════════
async function generateDailyActions(base44) {
  const records = await fetchCRMData(base44);
  const kpis = computeKPIs(records);
  const growth = computeGrowth(records);
  const health = computeHealth(records);

  // Fetch pending tasks sorted by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const allTasks = await base44.asServiceRole.entities.CommercialTask.filter({ status: "pending" });
  const priorities = allTasks
    .sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3))
    .slice(0, 5)
    .map((t) => ({
      id: t.id, title: t.title, priority: t.priority, task_type: t.task_type,
      target_name: t.target_name, target_email: t.target_email, target_company: t.target_company,
      suggested_action: t.suggested_action, expected_revenue: t.expected_revenue,
      exec_recommendation: t.exec_recommendation, due_date: t.due_date,
    }));

  // Today's expected revenue (MRR / 30 + projected new subscriptions today)
  const recentRate = kpis.newUsersThisWeek / 7;
  const paidUsers = kpis.totalUsers - kpis.freeMembers;
  const avgPrice = paidUsers > 0 ? kpis.mrr / paidUsers : 0;
  const expectedRevenueToday = r2(kpis.mrr / 30 + recentRate * 0.15 * avgPrice);

  // Today's growth forecast
  const growthForecastToday = r1(recentRate);

  return {
    priorities,
    upgradeOpportunities: growth.likelyToUpgrade.slice(0, 5),
    enterpriseOpportunities: growth.enterpriseOpportunities.slice(0, 5),
    churnRisks: growth.atRiskSubscribers.slice(0, 5),
    outreachNeeded: growth.outreachNeeded.slice(0, 5),
    expectedRevenueToday,
    growthForecastToday,
    pendingTaskCount: allTasks.length,
    health,
    kpis,
    generatedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════
// EXEC™ Commands
// ════════════════════════════════════════════════════════════════
async function execCommand(base44, body) {
  const command = body.command;
  const context = body.context || {};

  if (command === "show_priorities" || command === "who_to_contact") {
    const actions = await generateDailyActions(base44);
    if (command === "show_priorities") {
      const list = actions.priorities.map((p, i) => `${i + 1}. [${p.priority.toUpperCase()}] ${p.title} — ${p.suggested_action}`).join("\n");
      return { response: `Today's Top ${actions.priorities.length} Commercial Priorities:\n\n${list}\n\nPending tasks: ${actions.pendingTaskCount}\nExpected revenue today: $${actions.expectedRevenueToday}` };
    }
    const first = actions.priorities[0];
    if (!first) return { response: "No pending commercial priorities. The engine is up to date." };
    return { response: `Contact ${first.target_name || "this contact"} first.\n\nReason: ${first.title}\nAction: ${first.suggested_action}\nEXEC™ Recommendation: ${first.exec_recommendation}\n\nEmail: ${first.target_email || "N/A"}${first.target_company ? `\nCompany: ${first.target_company}` : ""}` };
  }

  // Gather CRM context for LLM-based commands
  const records = await fetchCRMData(base44);
  const kpis = computeKPIs(records);
  const growth = computeGrowth(records);
  const tasks = await base44.asServiceRole.entities.CommercialTask.filter({ status: "pending" });

  const businessContext = `EXECLEAD.AI Commercial Snapshot:
- Total Users: ${kpis.totalUsers}
- MRR: $${kpis.mrr} | ARR: $${kpis.arr}
- Active 7d: ${kpis.active7d} | Churn Rate: ${kpis.churnRate}%
- Free: ${kpis.freeMembers} | Professional: ${kpis.professionalMembers} | Executive: ${kpis.executiveMembers} | Enterprise: ${kpis.enterpriseCustomers} | Founding: ${kpis.foundingMembers}
- Pending Tasks: ${tasks.length}
- Top Upgrade Opportunities: ${growth.likelyToUpgrade.slice(0, 3).map((u) => `${u.name} (${u.probability}% — recommend ${u.recommendedPlan})`).join(", ")}
- Enterprise Pipeline: ${growth.enterpriseOpportunities.slice(0, 3).map((u) => `${u.name} (${u.company})`).join(", ")}
- At-Risk Subscribers: ${growth.atRiskSubscribers.slice(0, 3).map((u) => `${u.name} (${u.plan}, ${u.daysInactive}d inactive)`).join(", ")}`;

  const prompts = {
    generate_followup_email: () => {
      const target = context.target_name ? `for ${context.target_name} (${context.target_email})` : "for a new Executive subscriber";
      return `Write a personalized follow-up email ${target}. The email should be warm, professional, and encourage them to schedule an onboarding call. Keep it concise (under 200 words). Sign as the Founder of EXECLEAD.AI.\n\nBusiness Context:\n${businessContext}`;
    },
    generate_enterprise_proposal: () => {
      const target = context.target_company ? `for ${context.target_company}` : "for a prospective enterprise customer";
      return `Generate a concise enterprise proposal outline ${target}. Include: value proposition, key features for enterprise teams, pricing tier ($500/mo), and next steps. Keep it under 300 words.\n\nBusiness Context:\n${businessContext}`;
    },
    generate_upgrade_campaign: () => {
      return `Create an upgrade email campaign targeting free and trial users. Highlight the value of upgrading to Professional ($29/mo) or Executive ($79/mo) plans. Include a compelling subject line, personalized body, and clear CTA. Keep it under 250 words.\n\nBusiness Context:\n${businessContext}`;
    },
    generate_retention_campaign: () => {
      return `Create a retention email campaign for at-risk subscribers who have been inactive for 14+ days. The email should be personal, empathetic, and offer value to re-engage them. Include subject line, body, and CTA. Keep it under 250 words.\n\nBusiness Context:\n${businessContext}`;
    },
    generate_weekly_briefing: () => {
      return `Generate a weekly founder briefing summarizing the commercial health of EXECLEAD.AI. Include: revenue summary, growth highlights, retention concerns, top opportunities, and recommended actions for the coming week. Format as a structured executive summary under 400 words.\n\nBusiness Context:\n${businessContext}`;
    },
  };

  const promptFn = prompts[command];
  if (!promptFn) return { error: `Unknown EXEC™ command: ${command}` };

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: promptFn(),
    model: "gpt_5_mini",
  });

  return { response: typeof result === "string" ? result : result.response || JSON.stringify(result), command };
}

// ════════════════════════════════════════════════════════════════
// Handler
// ════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes(user.role)) return Response.json({ error: "Forbidden — admin access required" }, { status: 403 });

    let body = {};
    try { body = await req.json(); } catch { body = {}; }
    const action = body.action;

    switch (action) {
      case "evaluate_rules":
        return Response.json(await evaluateRules(base44));
      case "compute_health":
        return Response.json(computeHealth(await fetchCRMData(base44)));
      case "generate_daily_actions":
        return Response.json(await generateDailyActions(base44));
      case "exec_command":
        return Response.json(await execCommand(base44, body));
      case "seed_default_rules":
        return Response.json(await seedDefaultRules(base44));
      default:
        return Response.json({ error: `Unknown action: ${action}. Valid: evaluate_rules, compute_health, generate_daily_actions, exec_command, seed_default_rules` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});