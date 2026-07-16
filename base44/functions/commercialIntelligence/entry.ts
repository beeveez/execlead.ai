import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const AIRTABLE_API = "https://api.airtable.com/v0";
const MEMBERS_TABLE = "Executive Members";
const PLAN_MONTHLY = {
  free: 0, professional: 29, executive: 79, enterprise: 500,
  "founding member": 59.25, founding: 59.25, developer_unlimited: 0,
};
const FOUNDING_LIMIT = 35;
const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

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

const num = (v) => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || 0 : 0);
const str = (v) => (v ? String(v) : "");
const bool = (v) => v === true || v === 1 || v === "true";
const parseDate = (v) => { if (!v) return null; try { const d = new Date(v); return isNaN(d.getTime()) ? null : d; } catch { return null; } };
const withinDays = (ds, d) => { const dt = parseDate(ds); if (!dt) return false; const diff = (Date.now() - dt.getTime()) / 86400000; return diff >= 0 && diff <= d; };
const isToday = (ds) => { const dt = parseDate(ds); if (!dt) return false; return dt.toDateString() === new Date().toDateString(); };
const daysSince = (ds) => { const dt = parseDate(ds); if (!dt) return null; return Math.floor((Date.now() - dt.getTime()) / 86400000); };
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;

function normalizePlan(v) {
  const s = str(v).toLowerCase().trim();
  if (s.includes("founding")) return "founding member";
  if (s.includes("enterprise")) return "enterprise";
  if (s.includes("executive")) return "executive";
  if (s.includes("professional")) return "professional";
  if (s.includes("developer")) return "developer_unlimited";
  return "free";
}

function computeStage(f) {
  const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]);
  const idComp = num(f["Identity Completion"]);
  const idVer = bool(f["Identity Verified"]);
  const ldna = num(f["Leadership DNA Score"]);
  const promo = num(f["Promotion Readiness"]);
  const execScore = num(f["Executive Score"]);
  const active7 = withinDays(f["Last Login"], 7);
  let stage = 1;
  if (idComp >= 50 || idVer) stage = 2;
  if (idComp >= 70) stage = 3;
  if (ldna > 0) stage = Math.max(stage, 4);
  if (promo > 0) stage = Math.max(stage, 5);
  if (plan === "professional") stage = Math.max(stage, 6);
  if (plan === "executive") stage = Math.max(stage, 7);
  if (plan === "enterprise") stage = Math.max(stage, 8);
  if (plan === "founding member") stage = Math.max(stage, 9);
  if (execScore >= 80 && active7) stage = 10;
  return stage;
}

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
  const profConv = total > 0 ? (professional / total) * 100 : 0;
  const execConv = total > 0 ? (executive / total) * 100 : 0;
  const entConv = total > 0 ? (enterprise / total) * 100 : 0;

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

  const execScores = fields.map((f) => num(f["Executive Score"])).filter((s) => s > 0);
  const promoScores = fields.map((f) => num(f["Promotion Readiness"])).filter((s) => s > 0);
  const avgExec = execScores.length > 0 ? execScores.reduce((a, b) => a + b, 0) / execScores.length : 0;
  const avgId = fields.length > 0 ? fields.reduce((a, f) => a + num(f["Identity Completion"]), 0) / fields.length : 0;

  const buckets = [
    { label: "0-20", min: 0, max: 20 }, { label: "21-40", min: 21, max: 40 },
    { label: "41-60", min: 41, max: 60 }, { label: "61-80", min: 61, max: 80 },
    { label: "81-100", min: 81, max: 100 },
  ];
  const dist = (scores) => buckets.map((b) => ({ bucket: b.label, count: scores.filter((s) => s >= b.min && s <= b.max).length }));

  return {
    totalUsers: total, newUsersToday: newToday, newUsersThisWeek: newWeek,
    active7d: active7, active30d: active30,
    freeMembers: free, professionalMembers: professional, executiveMembers: executive,
    enterpriseCustomers: enterprise, foundingMembers: founding, foundingLimit: FOUNDING_LIMIT,
    trialUsers: trial,
    trialConversionRate: r1(trialConv), professionalConversionRate: r1(profConv),
    executiveConversionRate: r1(execConv), enterpriseConversionRate: r1(entConv),
    mrr: r2(mrr), arr: r2(arr), arpu: r2(arpu), clv: r2(clv),
    churnRate: r1(churnRate), revenueGrowth: r1(revenueGrowth),
    avgExecScore: r1(avgExec), avgIdentityCompletion: r1(avgId),
    execReadinessDistribution: dist(execScores),
    promotionReadinessDistribution: dist(promoScores),
  };
}

function computeFunnel(records) {
  const STAGES = ["Signup", "Identity Complete", "Resume Uploaded", "Leadership DNA", "Promotion Forecast", "Professional", "Executive", "Enterprise", "Founding Member", "Customer Advocate"];
  const stages = records.map((r) => computeStage(r.fields || {}));
  const cumulative = STAGES.map((_, i) => stages.filter((s) => s >= i + 1).length);
  const recs = [
    "All registered users. Focus on acquisition channels to grow top of funnel.",
    "Users completing identity verification. Streamline onboarding to improve conversion.",
    "Users who uploaded their resume. Encourage uploads during onboarding.",
    "Users with Leadership DNA assessment. Promote this feature to engaged users.",
    "Users with promotion forecast. Highlight career advancement outcomes.",
    "Professional subscribers. Nurture with executive-level value propositions.",
    "Executive subscribers. Showcase enterprise capabilities and ROI.",
    "Enterprise customers. Assign dedicated account management.",
    "Founding Members. Leverage for advocacy and referrals.",
    "Customer Advocates. Equip with referral tools and recognition.",
  ];
  return STAGES.map((name, i) => {
    const users = cumulative[i];
    const prev = i > 0 ? cumulative[i - 1] : users;
    const conv = prev > 0 ? (users / prev) * 100 : 100;
    const drop = 100 - conv;
    const stageRecs = records.filter((_, idx) => stages[idx] >= i + 1);
    const times = stageRecs.map((r) => daysSince(r.fields?.["Registration Date"])).filter((t) => t !== null && t >= 0);
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return { name, users, conversionPct: r1(conv), dropoffPct: r1(drop), avgTimeDays: avgTime, recommendations: recs[i] };
  });
}

function computeGrowth(records) {
  const fields = records.map((r) => r.fields || {});
  const weekAgo = Date.now() - 7 * 86400000;
  const twoWeeksAgo = Date.now() - 14 * 86400000;

  const planList = ["free", "professional", "executive", "enterprise", "founding member"];
  let fastest = { segment: "N/A", growthRate: 0, description: "Insufficient data" };
  planList.forEach((plan) => {
    const recent = fields.filter((f) => { const reg = parseDate(f["Registration Date"]); return reg && reg.getTime() >= weekAgo && normalizePlan(f["Current Plan"] || f["Membership Type"]) === plan; }).length;
    const prev = fields.filter((f) => { const reg = parseDate(f["Registration Date"]); return reg && reg.getTime() >= twoWeeksAgo && reg.getTime() < weekAgo && normalizePlan(f["Current Plan"] || f["Membership Type"]) === plan; }).length;
    const rate = prev > 0 ? ((recent - prev) / prev) * 100 : recent > 0 ? 100 : 0;
    if (rate > fastest.growthRate) fastest = { segment: plan, growthRate: r1(rate), description: `${plan} segment grew ${r1(rate)}% week-over-week (${recent} new vs ${prev} previous)` };
  });

  const countries = {};
  fields.forEach((f) => { const c = str(f["Country"]) || "Unknown"; if (!countries[c]) countries[c] = { total: 0, paid: 0 }; countries[c].total++; const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); if (["professional", "executive", "enterprise", "founding member"].includes(plan)) countries[c].paid++; });
  let highest = { segment: "N/A", conversionRate: 0, description: "Insufficient data" };
  Object.entries(countries).forEach(([country, d]) => { if (d.total < 2) return; const rate = (d.paid / d.total) * 100; if (rate > highest.conversionRate) highest = { segment: country, conversionRate: r1(rate), description: `${country} has ${r1(rate)}% paid conversion (${d.paid}/${d.total} users)` }; });

  const likelyToUpgrade = fields
    .filter((f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); return plan === "free" || str(f["Status"]).toLowerCase().includes("trial"); })
    .map((f) => {
      const execScore = num(f["Executive Score"]); const idComp = num(f["Identity Completion"]); const ldna = num(f["Leadership DNA Score"]); const active7 = withinDays(f["Last Login"], 7);
      const probability = Math.min(100, execScore * 0.4 + idComp * 0.3 + ldna * 0.3);
      const recommendedPlan = execScore >= 60 ? "Executive" : "Professional";
      const reasons = [];
      if (execScore >= 50) reasons.push(`Exec Score: ${execScore}`);
      if (idComp >= 70) reasons.push(`Identity: ${idComp}%`);
      if (ldna > 0) reasons.push(`DNA: ${ldna}`);
      if (active7) reasons.push("Active 7d");
      return { name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", email: str(f["Email"]), currentPlan: normalizePlan(f["Current Plan"] || f["Membership Type"]), recommendedPlan, probability: r1(probability), reason: reasons.join(", ") || "Engagement signals detected" };
    })
    .filter((u) => u.probability >= 30).sort((a, b) => b.probability - a.probability).slice(0, 10);

  const seniorTitles = /\b(ceo|cto|cfo|coo|cio|chief|vp|vice president|director|head of|partner|founder|managing)\b/i;
  const enterpriseOpps = fields
    .filter((f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); return plan !== "enterprise" && plan !== "founding member"; })
    .filter((f) => str(f["Company"]).length > 0 || seniorTitles.test(str(f["Job Title"])))
    .map((f) => ({ name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", company: str(f["Company"]), currentPlan: normalizePlan(f["Current Plan"] || f["Membership Type"]), reason: seniorTitles.test(str(f["Job Title"])) ? `Senior title: ${str(f["Job Title"])}` : `Company: ${str(f["Company"])}` }))
    .slice(0, 10);

  const dormant = fields.map((f) => ({ name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", email: str(f["Email"]), lastLogin: str(f["Last Login"]), daysInactive: daysSince(f["Last Login"]) })).filter((u) => u.daysInactive !== null && u.daysInactive >= 30).sort((a, b) => b.daysInactive - a.daysInactive).slice(0, 10);

  const paidPlans = ["professional", "executive", "enterprise", "founding member"];
  const atRisk = fields
    .filter((f) => paidPlans.includes(normalizePlan(f["Current Plan"] || f["Membership Type"])))
    .map((f) => { const days = daysSince(f["Last Login"]) || 0; const riskLevel = days >= 30 ? "critical" : days >= 21 ? "high" : "medium"; return { name: str(f["Full Name"]) || str(f["Email"]) || "Unknown", email: str(f["Email"]), plan: normalizePlan(f["Current Plan"] || f["Membership Type"]), daysInactive: days, riskLevel }; })
    .filter((u) => u.daysInactive >= 14).sort((a, b) => b.daysInactive - a.daysInactive).slice(0, 10);

  const outreach = [
    ...likelyToUpgrade.slice(0, 3).map((u) => ({ name: u.name, email: u.email, reason: `High upgrade probability (${u.probability}%) — ${u.reason}`, priority: "high" })),
    ...atRisk.slice(0, 3).map((u) => ({ name: u.name, email: u.email, reason: `At-risk ${u.plan} subscriber — ${u.daysInactive}d inactive`, priority: u.riskLevel })),
    ...enterpriseOpps.slice(0, 3).map((u) => ({ name: u.name, email: u.email, reason: `Enterprise opportunity — ${u.reason}`, priority: "medium" })),
  ];

  return { fastestGrowingSegment: fastest, highestConvertingSegment: highest, likelyToUpgrade, enterpriseOpportunities: enterpriseOpps, dormantUsers: dormant, atRiskSubscribers: atRisk, outreachNeeded: outreach };
}

function computeRevenue(records, kpis) {
  const fields = records.map((r) => r.fields || {});
  const mrr = kpis.mrr;
  const planList = ["free", "professional", "executive", "enterprise", "founding member"];
  const mix = planList.map((plan) => { const count = fields.filter((f) => normalizePlan(f["Current Plan"] || f["Membership Type"]) === plan).length; const revenue = count * (PLAN_MONTHLY[plan] || 0); return { plan, count, revenue: r2(revenue), pct: r1(mrr > 0 ? (revenue / mrr) * 100 : 0) }; }).filter((m) => m.count > 0);

  const foundingCount = fields.filter((f) => normalizePlan(f["Current Plan"] || f["Membership Type"]) === "founding member").length;
  const foundingRevenue = foundingCount * PLAN_MONTHLY["founding member"];
  const growthRate = kpis.revenueGrowth / 100;
  const mrrForecast = mrr * (1 + growthRate);
  const arrForecast = mrrForecast * 12;
  const recentRate = kpis.newUsersThisWeek / 7;
  const paidUsers = kpis.totalUsers - kpis.freeMembers;
  const avgPrice = paidUsers > 0 ? mrr / paidUsers : 0;
  const newSubs30 = recentRate * 30 * 0.15;
  const newSubs90 = recentRate * 90 * 0.15;
  const revenue30d = mrr + newSubs30 * avgPrice;
  const revenue90d = mrr * 3 + newSubs90 * avgPrice;
  const upgradeForecast = [
    { fromPlan: "Free", toPlan: "Professional", projectedUpgrades: Math.round(kpis.freeMembers * 0.05), projectedRevenue: r2(kpis.freeMembers * 0.05 * 29) },
    { fromPlan: "Professional", toPlan: "Executive", projectedUpgrades: Math.round(kpis.professionalMembers * 0.1), projectedRevenue: r2(kpis.professionalMembers * 0.1 * 50) },
    { fromPlan: "Executive", toPlan: "Enterprise", projectedUpgrades: Math.round(kpis.executiveMembers * 0.02), projectedRevenue: r2(kpis.executiveMembers * 0.02 * 421) },
  ];

  return { mrr: r2(mrr), arr: r2(kpis.arr), mrrForecast: r2(mrrForecast), arrForecast: r2(arrForecast), revenue30d: r2(revenue30d), revenue90d: r2(revenue90d), foundingRevenue: r2(foundingRevenue), subscriptionMix: mix, upgradeForecast };
}

function computeAlerts(records) {
  const fields = records.map((r) => r.fields || {});
  const alerts = [];
  const now = new Date().toISOString();

  fields.filter((f) => normalizePlan(f["Current Plan"] || f["Membership Type"]) === "executive" && withinDays(f["Registration Date"], 1)).slice(0, 3).forEach((f) => {
    alerts.push({ type: "new_executive", severity: "high", title: "New Executive Subscriber", description: `${str(f["Full Name"]) || str(f["Email"])} upgraded to Executive ($79/mo)`, date: str(f["Registration Date"]) || now });
  });
  fields.filter((f) => normalizePlan(f["Current Plan"] || f["Membership Type"]) === "enterprise" && withinDays(f["Registration Date"], 7)).slice(0, 3).forEach((f) => {
    alerts.push({ type: "enterprise_inquiry", severity: "critical", title: "New Enterprise Inquiry", description: `${str(f["Full Name"])} from ${str(f["Company"])} — enterprise interest detected`, date: str(f["Registration Date"]) || now });
  });
  fields.filter((f) => normalizePlan(f["Current Plan"] || f["Membership Type"]) === "founding member" && withinDays(f["Registration Date"], 7)).slice(0, 3).forEach((f) => {
    alerts.push({ type: "founding_purchased", severity: "high", title: "Founding Member Joined", description: `${str(f["Full Name"])} became a Founding Member`, date: str(f["Registration Date"]) || now });
  });
  fields.filter((f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); const days = daysSince(f["Last Login"]); return ["executive", "enterprise", "founding member"].includes(plan) && days !== null && days >= 14; }).slice(0, 5).forEach((f) => {
    alerts.push({ type: "high_value_inactive", severity: "high", title: "High-Value User Inactive", description: `${str(f["Full Name"])} (${normalizePlan(f["Current Plan"] || f["Membership Type"])}) — ${daysSince(f["Last Login"])}d inactive`, date: now });
  });
  fields.filter((f) => str(f["Status"]).toLowerCase().includes("trial") && daysSince(f["Registration Date"]) >= 12).slice(0, 5).forEach((f) => {
    alerts.push({ type: "trial_expiring", severity: "medium", title: "Trial Expiring Soon", description: `${str(f["Email"])} — trial started ${daysSince(f["Registration Date"])}d ago`, date: now });
  });
  fields.filter((f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); const days = daysSince(f["Last Login"]); return ["professional", "executive"].includes(plan) && days !== null && days >= 21; }).slice(0, 5).forEach((f) => {
    alerts.push({ type: "churn_risk", severity: "high", title: "Churn Risk Detected", description: `${str(f["Full Name"])} (${normalizePlan(f["Current Plan"] || f["Membership Type"])}) — ${daysSince(f["Last Login"])}d inactive`, date: now });
  });

  const mrr = fields.reduce((s, f) => { const plan = normalizePlan(f["Current Plan"] || f["Membership Type"]); const st = str(f["Status"]).toLowerCase(); return st.includes("churn") || st.includes("cancel") ? s : s + (PLAN_MONTHLY[plan] || 0); }, 0);
  if (mrr >= 10000) alerts.push({ type: "revenue_milestone", severity: "critical", title: "Revenue Milestone: $10K MRR", description: `MRR has reached $${r2(mrr)}`, date: now });
  else if (mrr >= 5000) alerts.push({ type: "revenue_milestone", severity: "high", title: "Revenue Milestone: $5K MRR", description: `MRR has reached $${r2(mrr)}`, date: now });
  else if (mrr >= 1000) alerts.push({ type: "revenue_milestone", severity: "medium", title: "Revenue Milestone: $1K MRR", description: `MRR has reached $${r2(mrr)}`, date: now });

  const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes(user.role)) return Response.json({ error: "Forbidden — admin access required" }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("airtable");
    const schema = await resolveSchema(accessToken);
    const records = await fetchAllRecords(accessToken, schema.baseId, schema.membersTableId);

    const kpis = computeKPIs(records);
    const funnel = computeFunnel(records);
    const growth = computeGrowth(records);
    const revenue = computeRevenue(records, kpis);
    const alerts = computeAlerts(records);

    return Response.json({
      kpis, funnel, growth, revenue, alerts,
      meta: { baseId: schema.baseId, recordCount: records.length, lastSynced: records[0]?.fields?.["Last Synced"] || null, generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});