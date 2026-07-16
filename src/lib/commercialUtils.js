export function buildCommercialContext(data) {
  const k = data.kpis || {};
  const f = data.funnel || [];
  const g = data.growth || {};
  const r = data.revenue || {};
  return JSON.stringify({
    summary: {
      totalUsers: k.totalUsers,
      activeUsers7d: k.active7d,
      activeUsers30d: k.active30d,
      newToday: k.newUsersToday,
      newThisWeek: k.newUsersThisWeek,
    },
    membership: {
      free: k.freeMembers,
      professional: k.professionalMembers,
      executive: k.executiveMembers,
      enterprise: k.enterpriseCustomers,
      founding: k.foundingMembers,
      foundingLimit: k.foundingLimit,
      trial: k.trialUsers,
    },
    conversion: {
      trial: k.trialConversionRate,
      professional: k.professionalConversionRate,
      executive: k.executiveConversionRate,
      enterprise: k.enterpriseConversionRate,
    },
    revenue: {
      mrr: r.mrr || k.mrr,
      arr: r.arr || k.arr,
      mrrForecast: r.mrrForecast,
      revenue30d: r.revenue30d,
      revenue90d: r.revenue90d,
      arpu: k.arpu,
      clv: k.clv,
      churnRate: k.churnRate,
      revenueGrowth: k.revenueGrowth,
    },
    funnel: f.map(s => `${s.name}: ${s.users} users, ${s.conversionPct}% conversion, ${s.dropoffPct}% dropoff, ${s.avgTimeDays}d avg time`),
    growth: {
      fastestGrowing: g.fastestGrowingSegment,
      highestConverting: g.highestConvertingSegment,
      likelyToUpgradeCount: (g.likelyToUpgrade || []).length,
      enterpriseOppsCount: (g.enterpriseOpportunities || []).length,
      dormantCount: (g.dormantUsers || []).length,
      atRiskCount: (g.atRiskSubscribers || []).length,
      likelyToUpgradeTop: (g.likelyToUpgrade || []).slice(0, 5),
      atRiskTop: (g.atRiskSubscribers || []).slice(0, 5),
    },
    alerts: (data.alerts || []).slice(0, 10).map(a => `${a.severity}: ${a.title} — ${a.description}`),
  }, null, 2);
}