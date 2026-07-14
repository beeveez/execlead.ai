/**
 * EXECLEAD.AI — Customer Lifecycle Management™ Engine
 * ---------------------------------------------------
 * Unifies every customer touchpoint (applications, invitations, profiles,
 * subscriptions, usage, learning, feedback, telemetry, security, billing,
 * organizations, reputation, certifications, referrals) into a single
 * 360-degree view with lifecycle staging, health scoring, pipeline
 * conversion, journey analytics, and automated success playbooks.
 */

export const LIFECYCLE_STAGES = [
  { id: "applicant", label: "Applicant", color: "#64748b" },
  { id: "reviewed", label: "Reviewed", color: "#0ea5e9" },
  { id: "invited", label: "Invited", color: "#6366f1" },
  { id: "activated", label: "Activated", color: "#8b5cf6" },
  { id: "active", label: "Active", color: "#10b981" },
  { id: "power_user", label: "Power User", color: "#14b8a6" },
  { id: "champion", label: "Champion", color: "#f59e0b" },
  { id: "enterprise_advocate", label: "Enterprise Advocate", color: "#ec4899" },
  { id: "renewal", label: "Renewal", color: "#f97316" },
  { id: "alumni", label: "Alumni", color: "#6b7280" },
];

export async function fetchCustomerLifecycleData(base44) {
  const results = await Promise.allSettled([
    base44.entities.BetaApplication.list("-created_date", 500),
    base44.entities.BetaInvitation.list("-created_date", 200),
    base44.entities.UserProfile.list("-created_date", 500),
    base44.entities.Subscription.list("-created_date", 500),
    base44.entities.UsageLog.list("-created_date", 1000),
    base44.entities.LessonProgress.list("-updated_date", 500),
    base44.entities.ProductInsight.list("-created_date", 200),
    base44.entities.TelemetryEvent.list("-created_date", 1000),
    base44.entities.Feedback.list("-created_date", 200),
    base44.entities.Organization.list("-created_date", 200),
    base44.entities.OrgMembership.list("-created_date", 500),
    base44.entities.ExecutiveReputation.list("-created_date", 200),
    base44.entities.SecurityEvent.list("-created_date", 200),
    base44.entities.ConsentRecord.list("-created_date", 200),
    base44.entities.BillingEvent.list("-created_date", 200),
    base44.entities.Invoice.list("-created_date", 200),
    base44.entities.SecuritySession.list("-created_date", 500),
    base44.entities.SimulationSession.list("-created_date", 200),
    base44.entities.Certificate.list("-created_date", 200),
    base44.entities.Referral.list("-created_date", 200),
  ]);
  const r = (x) => (x.status === "fulfilled" ? x.value : []);
  return {
    applications: r(results[0]),
    invitations: r(results[1]),
    profiles: r(results[2]),
    subscriptions: r(results[3]),
    usageLogs: r(results[4]),
    lessonProgress: r(results[5]),
    productInsights: r(results[6]),
    telemetryEvents: r(results[7]),
    feedback: r(results[8]),
    organizations: r(results[9]),
    orgMemberships: r(results[10]),
    reputations: r(results[11]),
    securityEvents: r(results[12]),
    consentRecords: r(results[13]),
    billingEvents: r(results[14]),
    invoices: r(results[15]),
    securitySessions: r(results[16]),
    simulationSessions: r(results[17]),
    certificates: r(results[18]),
    referrals: r(results[19]),
  };
}

function countByUserId(records, idField = "created_by_id") {
  const map = new Map();
  records.forEach((rec) => {
    const uid = rec[idField] || rec.created_by_id;
    if (uid) map.set(uid, (map.get(uid) || 0) + 1);
  });
  return map;
}

function groupByUserId(records, idField = "created_by_id") {
  const map = new Map();
  records.forEach((rec) => {
    const uid = rec[idField] || rec.created_by_id;
    if (uid) {
      if (!map.has(uid)) map.set(uid, []);
      map.get(uid).push(rec);
    }
  });
  return map;
}

function groupByEmail(records, emailField) {
  const map = new Map();
  records.forEach((rec) => {
    const email = rec[emailField]?.toLowerCase();
    if (email) {
      if (!map.has(email)) map.set(email, []);
      map.get(email).push(rec);
    }
  });
  return map;
}

export function computeLifecycleStage(c) {
  if (c.alumni) return "alumni";
  if (c.subscription?.status === "renewing" || c.subscription?.status === "canceling") return "renewal";
  if (c.orgMemberships?.length > 0 && c.usageCount > 10) return "enterprise_advocate";
  if (c.reputation?.reputation_score > 500 || c.referralCount >= 3) return "champion";
  if (c.usageCount > 50 || c.telemetryCount > 100) return "power_user";
  if (c.userId && c.sessionCount > 0) return "active";
  if (c.application?.status === "activated" || (c.userId && !c.sessionCount)) return "activated";
  if (c.application?.status === "invited" || c.invitation?.status === "sent" || c.invitation?.status === "opened") return "invited";
  if (c.application && ["approved", "waitlisted"].includes(c.application.status)) return "reviewed";
  if (c.application) return "applicant";
  if (c.profile) return "activated";
  return "applicant";
}

export function computeCustomerHealth(c) {
  const engagement = Math.min(40, (c.telemetryCount || 0) * 0.2 + (c.sessionCount || 0) * 2);
  const learning = Math.min(25, (c.lessonProgress?.length || 0) * 2 + (c.certificates?.length || c.certificateCount || 0) * 5);
  const leadership = Math.min(20, (c.reputation?.reputation_score || 0) * 0.03 + (c.simulations?.length || 0) * 3);
  const support = Math.min(15, (c.feedback?.length || 0) * 2 + (c.productInsights?.length || 0) * 3);
  const aiUsage = Math.min(15, (c.usageCount || 0) * 0.3);
  const total = Math.round(engagement + learning + leadership + support + aiUsage);
  const riskLevel = total < 25 ? "critical" : total < 45 ? "high" : total < 65 ? "medium" : total < 80 ? "low" : "healthy";
  return { total, engagement: Math.round(engagement), learning: Math.round(learning), leadership: Math.round(leadership), support: Math.round(support), aiUsage: Math.round(aiUsage), riskLevel };
}

function buildCustomerTimeline(c) {
  const events = [];
  if (c.application) events.push({ date: c.application.created_date, type: "application", label: "Applied for Beta", detail: c.application.beta_tier });
  if (c.invitation?.sent_at) events.push({ date: c.invitation.sent_at, type: "invitation", label: "Invitation Sent", detail: c.invitation.invitation_code });
  if (c.invitation?.accepted_at) events.push({ date: c.invitation.accepted_at, type: "invitation", label: "Invitation Accepted" });
  if (c.application?.activated_at) events.push({ date: c.application.activated_at, type: "activation", label: "Account Activated" });
  if (c.simulations?.length) c.simulations.slice(-3).forEach(s => events.push({ date: s.created_date, type: "simulation", label: "Simulation Session", detail: s.status }));
  if (c.lessonProgress?.length) {
    const completed = c.lessonProgress.filter(l => l.completed);
    if (completed.length) events.push({ date: completed[completed.length - 1].updated_date, type: "learning", label: `Completed ${completed.length} lessons` });
  }
  if (c.feedback?.length) c.feedback.slice(-3).forEach(f => events.push({ date: f.created_date, type: "feedback", label: `Feedback: ${f.type || "general"}` }));
  if (c.productInsights?.length) c.productInsights.slice(-2).forEach(pi => events.push({ date: pi.submitted_at || pi.created_date, type: "insight", label: `Survey: ${pi.insight_type}`, detail: pi.score != null ? `Score: ${pi.score}` : null }));
  if (c.certificates?.length || c.certificateCount) events.push({ date: c.created_date, type: "certification", label: `Earned ${c.certificateCount || c.certificates.length} certificates` });
  if (c.referralCount) events.push({ date: c.created_date, type: "referral", label: `Made ${c.referralCount} referrals` });
  return events.filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function computeCustomerLifecycle(raw) {
  const byEmail = new Map();
  const byUserId = new Map();

  raw.applications.forEach((app) => {
    const email = app.email?.toLowerCase();
    if (!email) return;
    const c = byEmail.get(email) || { email, timeline: [] };
    c.application = app;
    c.fullName = app.full_name;
    c.betaTier = app.beta_tier;
    c.betaStatus = app.status;
    c.isActiveBetaUser = app.is_active_beta_user;
    c.npsScore = app.nps_score;
    c.feedbackCount = app.feedback_count;
    c.bugReportCount = app.bug_report_count;
    c.featureRequestCount = app.feature_request_count;
    c.userId = app.user_id;
    if (app.user_id) byUserId.set(app.user_id, c);
    byEmail.set(email, c);
  });

  raw.profiles.forEach((profile) => {
    const email = profile.email?.toLowerCase();
    const uid = profile.user_id || profile.id;
    let c = null;
    if (email) c = byEmail.get(email);
    if (!c && uid) c = byUserId.get(uid);
    if (!c) {
      c = { email: email || uid, timeline: [] };
      if (email) byEmail.set(email, c);
    }
    c.profile = profile;
    c.fullName = c.fullName || profile.full_name || profile.name;
    c.userId = c.userId || uid;
    if (uid) byUserId.set(uid, c);
    if (email) byEmail.set(email, c);
  });

  raw.invitations.forEach((inv) => {
    const email = inv.email?.toLowerCase();
    if (!email) return;
    const c = byEmail.get(email) || { email, timeline: [] };
    c.invitation = inv;
    if (inv.application_id) c.invitationAppId = inv.application_id;
    byEmail.set(email, c);
  });

  raw.subscriptions.forEach((sub) => {
    const uid = sub.user_id;
    const email = sub.user_email?.toLowerCase();
    let c = null;
    if (uid) c = byUserId.get(uid);
    if (!c && email) c = byEmail.get(email);
    if (c) c.subscription = sub;
  });

  const usageMap = countByUserId(raw.usageLogs);
  const telemetryMap = countByUserId(raw.telemetryEvents);
  const sessionMap = countByUserId(raw.securitySessions);
  const feedbackMap = groupByUserId(raw.feedback);
  const lessonsMap = groupByUserId(raw.lessonProgress);
  const simsMap = groupByUserId(raw.simulationSessions);
  const securityMap = groupByUserId(raw.securityEvents);
  const certCountMap = countByUserId(raw.certificates, "user_id");
  const referralCountMap = countByUserId(raw.referrals, "referrer_id");
  const membershipMap = groupByUserId(raw.orgMemberships, "user_id");
  const insightsByEmail = groupByEmail(raw.productInsights, "user_email");
  const consentByEmail = groupByEmail(raw.consentRecords, "user_email");

  byUserId.forEach((c, uid) => {
    c.usageCount = usageMap.get(uid) || 0;
    c.telemetryCount = telemetryMap.get(uid) || 0;
    c.sessionCount = sessionMap.get(uid) || 0;
    c.feedback = feedbackMap.get(uid) || [];
    c.lessonProgress = lessonsMap.get(uid) || [];
    c.simulations = simsMap.get(uid) || [];
    c.securityEvents = securityMap.get(uid) || [];
    c.certificateCount = certCountMap.get(uid) || 0;
    c.referralCount = referralCountMap.get(uid) || 0;
    c.orgMemberships = membershipMap.get(uid) || [];
  });

  byEmail.forEach((c, email) => {
    c.productInsights = insightsByEmail.get(email) || [];
    c.consentRecords = consentByEmail.get(email) || [];
  });

  raw.reputations.forEach((rep) => {
    const c = byUserId.get(rep.user_id);
    if (c) c.reputation = rep;
  });

  const all = Array.from(byEmail.values());
  all.forEach((c) => {
    c.lifecycleStage = computeLifecycleStage(c);
    c.health = computeCustomerHealth(c);
    c.timeline = buildCustomerTimeline(c);
    c.lastActivity = c.timeline[0]?.date || c.application?.created_date || c.profile?.created_date;
  });

  const pipeline = computePipeline(all);
  const journeyAnalytics = computeJourneyAnalytics(all);
  const playbooks = generatePlaybooks(all);
  const organization360s = computeOrganization360s(raw, all);

  return { customers: all, pipeline, journeyAnalytics, playbooks, organizations: organization360s, raw };
}

export function computePipeline(customers) {
  const counts = {};
  LIFECYCLE_STAGES.forEach((s) => (counts[s.id] = 0));
  customers.forEach((c) => {
    if (counts[c.lifecycleStage] != null) counts[c.lifecycleStage]++;
  });

  const stages = LIFECYCLE_STAGES.map((stage, i) => {
    const count = counts[stage.id];
    const prevCount = i > 0 ? counts[LIFECYCLE_STAGES[i - 1].id] : count;
    const conversionRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
    return { ...stage, count, conversionRate, index: i };
  });

  const total = customers.length;
  return { stages, total };
}

export function computeJourneyAnalytics(customers) {
  const stages = LIFECYCLE_STAGES.map((s) => s.id);
  const counts = {};
  stages.forEach((s) => (counts[s] = 0));
  customers.forEach((c) => {
    if (counts[c.lifecycleStage] != null) counts[c.lifecycleStage]++;
  });

  const funnel = stages.map((stageId, i) => {
    const count = counts[stageId];
    const prev = i > 0 ? counts[stages[i - 1]] : count;
    const conversion = prev > 0 ? Math.round((count / prev) * 100) : 100;
    const dropoff = 100 - conversion;
    return { stage: stageId, label: LIFECYCLE_STAGES[i].label, count, conversion, dropoff };
  });

  const acquisition = counts.applicant + counts.reviewed + counts.invited;
  const activation = counts.activated;
  const engagement = counts.active + counts.power_user;
  const retention = counts.champion + counts.enterprise_advocate;
  const expansion = counts.champion + counts.enterprise_advocate + counts.renewal;
  const referralCount = customers.reduce((sum, c) => sum + (c.referralCount || 0), 0);
  const graduation = counts.alumni + counts.champion;

  return { funnel, acquisition, activation, engagement, retention, expansion, referralCount, graduation, totalCustomers: customers.length };
}

export function generatePlaybooks(customers) {
  const playbooks = [];

  customers.forEach((c) => {
    const h = c.health;
    if (h.total < 25 && c.lifecycleStage !== "applicant") {
      playbooks.push({ customer: c, playbook: "Inactive User", priority: "P0", action: "Re-engagement campaign", reason: `Health score ${h.total}/100 — critically low engagement` });
    }
    if (h.total >= 25 && h.total < 45 && c.lifecycleStage === "active") {
      playbooks.push({ customer: c, playbook: "Re-engagement", priority: "P1", action: "Personalized re-engagement email + feature spotlight", reason: `Health declining (${h.total}/100) — at risk of churn` });
    }
    if (c.usageCount > 50 && c.lifecycleStage === "active") {
      playbooks.push({ customer: c, playbook: "Power User", priority: "P2", action: "Invite to power user program + early access", reason: `High AI usage (${c.usageCount} sessions) — ready for power user tier` });
    }
    if (c.reputation?.reputation_score > 300 && c.lifecycleStage !== "champion") {
      playbooks.push({ customer: c, playbook: "Executive Coaching", priority: "P2", action: "Offer executive coaching session", reason: `Strong reputation (${c.reputation.reputation_score}) — coaching candidate` });
    }
    if (c.orgMemberships?.length > 0 && c.usageCount > 10 && c.lifecycleStage !== "enterprise_advocate") {
      playbooks.push({ customer: c, playbook: "Enterprise Expansion", priority: "P1", action: "Schedule enterprise expansion conversation", reason: "Enterprise member with active usage — expansion opportunity" });
    }
    if (c.subscription?.status === "renewing" || c.lifecycleStage === "renewal") {
      playbooks.push({ customer: c, playbook: "Renewal", priority: "P0", action: "Renewal conversation + value review", reason: "Subscription approaching renewal" });
    }
    if ((c.reputation?.reputation_score > 500 || c.referralCount >= 3) && c.lifecycleStage !== "champion") {
      playbooks.push({ customer: c, playbook: "Graduation", priority: "P1", action: "Graduate to champion tier + recognition", reason: "Meets champion criteria — ready for graduation" });
    }
  });

  const byPlaybook = {};
  playbooks.forEach((p) => {
    if (!byPlaybook[p.playbook]) byPlaybook[p.playbook] = [];
    byPlaybook[p.playbook].push(p);
  });

  return { all: playbooks, byPlaybook, total: playbooks.length };
}

export function computeOrganization360s(raw, customers) {
  return raw.organizations.map((org) => {
    const members = customers.filter((c) => c.orgMemberships?.some((m) => m.organization_id === org.id));
    const orgUsageLogs = raw.usageLogs.filter((u) => members.some((m) => m.userId === u.created_by_id));
    const orgLessons = raw.lessonProgress.filter((l) => members.some((m) => m.userId === l.created_by_id));
    const orgSims = raw.simulationSessions.filter((s) => members.some((m) => m.userId === (s.user_id || s.created_by_id)));
    const orgInvoices = raw.invoices.filter((i) => i.organization_id === org.id || members.some((m) => m.userId === i.user_id));
    const orgSecurityEvents = raw.securityEvents.filter((se) => members.some((m) => m.userId === (se.user_id || se.created_by_id)));
    const activeMembers = members.filter((m) => m.health.total >= 45);
    const avgHealth = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.health.total, 0) / members.length) : 0;
    const completedLessons = orgLessons.filter((l) => l.completed).length;

    return {
      organization: org,
      memberCount: members.length,
      activeMembers: activeMembers.length,
      members,
      usageCount: orgUsageLogs.length,
      lessonCount: orgLessons.length,
      completedLessons,
      simulationCount: orgSims.length,
      invoiceCount: orgInvoices.length,
      revenue: orgInvoices.reduce((s, i) => s + (i.amount || 0), 0),
      securityEventCount: orgSecurityEvents.length,
      avgHealth,
      healthLevel: avgHealth >= 75 ? "healthy" : avgHealth >= 50 ? "moderate" : avgHealth >= 25 ? "at_risk" : "critical",
    };
  });
}