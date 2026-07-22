/**
 * Geographic Intelligence™ Engine — privacy-aware aggregation of user
 * distribution, growth, engagement, leadership, and commercial metrics
 * across countries, regions, and time zones.
 */

const PLAN_PRICES = { free: 0, professional: 29, executive: 99, enterprise: 499 };

const COUNTRY_META = {
  Philippines: { continent: "Asia", region: "Southeast Asia" }, Singapore: { continent: "Asia", region: "Southeast Asia" },
  Malaysia: { continent: "Asia", region: "Southeast Asia" }, Indonesia: { continent: "Asia", region: "Southeast Asia" },
  Thailand: { continent: "Asia", region: "Southeast Asia" }, Vietnam: { continent: "Asia", region: "Southeast Asia" },
  India: { continent: "Asia", region: "South Asia" }, Pakistan: { continent: "Asia", region: "South Asia" },
  Bangladesh: { continent: "Asia", region: "South Asia" }, SriLanka: { continent: "Asia", region: "South Asia" },
  Japan: { continent: "Asia", region: "East Asia" }, China: { continent: "Asia", region: "East Asia" },
  "South Korea": { continent: "Asia", region: "East Asia" }, "Hong Kong": { continent: "Asia", region: "East Asia" },
  Taiwan: { continent: "Asia", region: "East Asia" }, "United Arab Emirates": { continent: "Asia", region: "Middle East" },
  "Saudi Arabia": { continent: "Asia", region: "Middle East" }, Israel: { continent: "Asia", region: "Middle East" },
  Qatar: { continent: "Asia", region: "Middle East" }, Kuwait: { continent: "Asia", region: "Middle East" },
  Bahrain: { continent: "Asia", region: "Middle East" }, Oman: { continent: "Asia", region: "Middle East" },
  Jordan: { continent: "Asia", region: "Middle East" }, Lebanon: { continent: "Asia", region: "Middle East" },
  "United States": { continent: "North America", region: "North America" }, Canada: { continent: "North America", region: "North America" },
  Mexico: { continent: "North America", region: "North America" }, "United Kingdom": { continent: "Europe", region: "Western Europe" },
  Ireland: { continent: "Europe", region: "Western Europe" }, Germany: { continent: "Europe", region: "Western Europe" },
  France: { continent: "Europe", region: "Western Europe" }, Netherlands: { continent: "Europe", region: "Western Europe" },
  Belgium: { continent: "Europe", region: "Western Europe" }, Switzerland: { continent: "Europe", region: "Western Europe" },
  Austria: { continent: "Europe", region: "Western Europe" }, Luxembourg: { continent: "Europe", region: "Western Europe" },
  Spain: { continent: "Europe", region: "Southern Europe" }, Italy: { continent: "Europe", region: "Southern Europe" },
  Portugal: { continent: "Europe", region: "Southern Europe" }, Greece: { continent: "Europe", region: "Southern Europe" },
  Sweden: { continent: "Europe", region: "Northern Europe" }, Norway: { continent: "Europe", region: "Northern Europe" },
  Denmark: { continent: "Europe", region: "Northern Europe" }, Finland: { continent: "Europe", region: "Northern Europe" },
  Iceland: { continent: "Europe", region: "Northern Europe" }, Poland: { continent: "Europe", region: "Eastern Europe" },
  Romania: { continent: "Europe", region: "Eastern Europe" }, "Czech Republic": { continent: "Europe", region: "Eastern Europe" },
  Hungary: { continent: "Europe", region: "Eastern Europe" }, Bulgaria: { continent: "Europe", region: "Eastern Europe" },
  Ukraine: { continent: "Europe", region: "Eastern Europe" }, Russia: { continent: "Europe", region: "Eastern Europe" },
  Australia: { continent: "Oceania", region: "Oceania" }, "New Zealand": { continent: "Oceania", region: "Oceania" },
  Fiji: { continent: "Oceania", region: "Oceania" }, Brazil: { continent: "South America", region: "South America" },
  Argentina: { continent: "South America", region: "South America" }, Chile: { continent: "South America", region: "South America" },
  Colombia: { continent: "South America", region: "South America" }, Peru: { continent: "South America", region: "South America" },
  Venezuela: { continent: "South America", region: "South America" }, Ecuador: { continent: "South America", region: "South America" },
  "South Africa": { continent: "Africa", region: "Southern Africa" }, Nigeria: { continent: "Africa", region: "West Africa" },
  Ghana: { continent: "Africa", region: "West Africa" }, Kenya: { continent: "Africa", region: "East Africa" },
  Egypt: { continent: "Africa", region: "North Africa" }, Morocco: { continent: "Africa", region: "North Africa" },
  Ethiopia: { continent: "Africa", region: "East Africa" }, Tanzania: { continent: "Africa", region: "East Africa" },
};

export function getCountryMeta(country) {
  return COUNTRY_META[country] || { continent: "Other", region: "Other" };
}

function distribution(items, field) {
  if (!items) return [];
  const map = {};
  items.forEach((item) => {
    const val = item[field] || "Unknown";
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}

export function computeGeographicData(data) {
  const { profiles = [], users = [], usageLogs = [], activities = [] } = data;
  const now = new Date();
  const monthAgo = new Date(now - 30 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const profileByUserId = {};
  profiles.forEach((p) => { if (p.user_id) profileByUserId[p.user_id] = p; });

  // Build per-country metrics
  const countryMap = {};
  profiles.forEach((p) => {
    const country = p.country || "Unknown";
    if (!countryMap[country]) {
      countryMap[country] = {
        country, users: 0, activeUsers: 0, execSubs: 0, proSubs: 0, enterpriseSubs: 0,
        mrr: 0, totalReadiness: 0, readinessCount: 0, totalPromotion: 0, promotionCount: 0,
        totalJourneyPoints: 0, journeyCount: 0, sessions: 0, newUsers: 0, firstSeen: null,
      };
    }
    const c = countryMap[country];
    c.users++;
    if (p.last_active_date) {
      const daysSince = (now - new Date(p.last_active_date)) / 86400000;
      if (daysSince <= 30) c.activeUsers++;
    }
    if (p.cached_readiness_score > 0) { c.totalReadiness += p.cached_readiness_score; c.readinessCount++; }
    if (p.cached_promotion_probability > 0) { c.totalPromotion += p.cached_promotion_probability; c.promotionCount++; }
    if (p.cached_journey_points > 0) { c.totalJourneyPoints += p.cached_journey_points; c.journeyCount++; }
    c.sessions += p.sessions_completed || 0;
    if (p.subscription_plan) {
      c.mrr += PLAN_PRICES[p.subscription_plan] || 0;
      if (p.subscription_plan === "executive") c.execSubs++;
      if (p.subscription_plan === "professional") c.proSubs++;
      if (p.subscription_plan === "enterprise") c.enterpriseSubs++;
    }
  });

  // Growth: new users per country this month + first-seen tracking
  users.forEach((u) => {
    const profile = profileByUserId[u.id];
    const country = profile?.country || "Unknown";
    if (!u.created_date) return;
    const d = new Date(u.created_date);
    if (d >= monthAgo && countryMap[country]) countryMap[country].newUsers++;
    if (!countryMap[country]?.firstSeen || d < new Date(countryMap[country].firstSeen)) {
      if (countryMap[country]) countryMap[country].firstSeen = u.created_date;
    }
  });

  const countries = Object.values(countryMap).map((c) => {
    const meta = getCountryMeta(c.country);
    return {
      ...c,
      continent: meta.continent, region: meta.region,
      execPercent: c.users > 0 ? ((c.execSubs / c.users) * 100).toFixed(1) : 0,
      proPercent: c.users > 0 ? ((c.proSubs / c.users) * 100).toFixed(1) : 0,
      enterprisePercent: c.users > 0 ? ((c.enterpriseSubs / c.users) * 100).toFixed(1) : 0,
      avgReadiness: c.readinessCount > 0 ? (c.totalReadiness / c.readinessCount).toFixed(1) : 0,
      avgPromotion: c.promotionCount > 0 ? (c.totalPromotion / c.promotionCount).toFixed(1) : 0,
      avgJourneyPoints: c.journeyCount > 0 ? Math.round(c.totalJourneyPoints / c.journeyCount) : 0,
      growthRate: c.users > 0 ? ((c.newUsers / c.users) * 100).toFixed(1) : 0,
      isNew: c.firstSeen ? new Date(c.firstSeen) >= monthStart : false,
    };
  }).sort((a, b) => b.users - a.users);

  // Privacy-aware city distribution (min 3 users per city)
  const cityMap = {};
  profiles.forEach((p) => {
    if (!p.city) return;
    cityMap[p.city] = (cityMap[p.city] || 0) + 1;
  });
  const cities = Object.entries(cityMap)
    .filter(([, count]) => count >= 3)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);

  // Timezone distribution
  const timezones = distribution(profiles, "timezone");

  // Activity by hour (from activities)
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, hourNum: h, count: 0 }));
  activities.forEach((a) => {
    if (a.created_date) hourBuckets[new Date(a.created_date).getHours()].count++;
  });
  const aiHourBuckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, hourNum: h, count: 0 }));
  usageLogs.forEach((u) => {
    if (u.created_date) aiHourBuckets[new Date(u.created_date).getHours()].count++;
  });
  const peakHours = [...hourBuckets].sort((a, b) => b.count - a.count).slice(0, 3).sort((a, b) => a.hourNum - b.hourNum);

  // Regional aggregates
  const regionMap = {};
  countries.forEach((c) => {
    if (!regionMap[c.region]) {
      regionMap[c.region] = { region: c.region, continent: c.continent, users: 0, activeUsers: 0, mrr: 0, execSubs: 0, newUsers: 0, countries: 0, sessions: 0 };
    }
    const r = regionMap[c.region];
    r.users += c.users; r.activeUsers += c.activeUsers; r.mrr += c.mrr;
    r.execSubs += c.execSubs; r.newUsers += c.newUsers; r.countries++; r.sessions += c.sessions;
  });
  const regions = Object.values(regionMap).map((r) => ({
    ...r,
    growthRate: r.users > 0 ? ((r.newUsers / r.users) * 100).toFixed(1) : 0,
    execPercent: r.users > 0 ? ((r.execSubs / r.users) * 100).toFixed(1) : 0,
    arpu: r.users > 0 ? (r.mrr / r.users).toFixed(2) : 0,
    engagement: r.users > 0 ? ((r.activeUsers / r.users) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.users - a.users);

  // Continent aggregates
  const continentMap = {};
  countries.forEach((c) => {
    if (!continentMap[c.continent]) {
      continentMap[c.continent] = { continent: c.continent, users: 0, activeUsers: 0, mrr: 0, execSubs: 0, newUsers: 0, countries: 0 };
    }
    const ct = continentMap[c.continent];
    ct.users += c.users; ct.activeUsers += c.activeUsers; ct.mrr += c.mrr;
    ct.execSubs += c.execSubs; ct.newUsers += c.newUsers; ct.countries++;
  });
  const continents = Object.values(continentMap).map((ct) => ({
    ...ct,
    growthRate: ct.users > 0 ? ((ct.newUsers / ct.users) * 100).toFixed(1) : 0,
    execPercent: ct.users > 0 ? ((ct.execSubs / ct.users) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.users - a.users);

  // Company intelligence
  const targetCompanyDist = distribution(profiles, "target_company").filter((d) => d.value !== "Unknown");
  const industryDist = distribution(profiles, "industry").filter((d) => d.value !== "Unknown");
  const targetRoleDist = distribution(profiles, "target_role").filter((d) => d.value !== "Unknown");

  // Overview
  const knownCountries = countries.filter((c) => c.country !== "Unknown");
  const totalCountries = knownCountries.length;
  const totalRegions = new Set(regions.map((r) => r.region).filter((r) => r !== "Other")).size;
  const fastestGrowing = [...knownCountries].filter((c) => c.users >= 3).sort((a, b) => parseFloat(b.growthRate) - parseFloat(a.growthRate))[0];
  const largestBase = countries[0];
  const enterpriseCountries = countries.filter((c) => c.enterpriseSubs > 0).length;
  const newCountriesThisMonth = knownCountries.filter((c) => c.isNew).length;
  const avgGrowth = knownCountries.length > 0
    ? (knownCountries.reduce((s, c) => s + parseFloat(c.growthRate), 0) / knownCountries.length).toFixed(1)
    : 0;

  return {
    overview: { totalCountries, totalRegions, totalCities: cities.length, newCountriesThisMonth, fastestGrowing, largestBase, enterpriseCountries, avgGrowth },
    countries, cities, timezones, hourBuckets, aiHourBuckets, peakHours, regions, continents,
    targetCompanyDist, industryDist, targetRoleDist,
  };
}

export function exportGeographicCSV(data) {
  const rows = [["Country", "Continent", "Region", "Users", "Active Users", "New This Month", "Growth %", "Exec Subs", "Exec %", "Pro Subs", "Pro %", "MRR", "Avg Readiness", "Avg Promotion", "Avg Journey Points", "Sessions"]];
  data.countries.forEach((c) => {
    rows.push([c.country, c.continent, c.region, c.users, c.activeUsers, c.newUsers, c.growthRate, c.execSubs, c.execPercent, c.proSubs, c.proPercent, c.mrr, c.avgReadiness, c.avgPromotion, c.avgJourneyPoints, c.sessions]);
  });
  return rows.map((r) => r.join(",")).join("\n");
}