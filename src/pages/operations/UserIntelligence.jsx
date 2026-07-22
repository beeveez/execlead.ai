import React, { useState, useMemo } from "react";
import { Users, Globe, Briefcase, Activity, TrendingUp, Building2, DollarSign, MapPin, BarChart3, Download, Search, Filter, ShieldCheck } from "lucide-react";
import { useUserIntelligenceData } from "@/hooks/useUserIntelligenceData";
import {
  applyFilters, computeOverview, computeDemographics, computeCareer, computeLeadership,
  computeOrganizations, computeBehavior, computeRevenue, computeFunnel, computeGrowth, getFilterOptions,
} from "@/lib/userIntelligenceEngine";
import { LoadingState, EmptyState } from "@/components/user-intelligence/shared";
import OverviewTab from "@/components/user-intelligence/OverviewTab";
import DemographicsTab from "@/components/user-intelligence/DemographicsTab";
import GeographicTab from "@/components/user-intelligence/GeographicTab";
import CareerTab from "@/components/user-intelligence/CareerTab";
import LeadershipJourneyTab from "@/components/user-intelligence/LeadershipJourneyTab";
import OrganizationsTab from "@/components/user-intelligence/OrganizationsTab";
import BehaviorTab from "@/components/user-intelligence/BehaviorTab";
import RevenueTab from "@/components/user-intelligence/RevenueTab";
import GrowthTab from "@/components/user-intelligence/GrowthTab";
import ExportsTab from "@/components/user-intelligence/ExportsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "demographics", label: "Demographics", icon: Users },
  { id: "career", label: "Career Intelligence", icon: Briefcase },
  { id: "behavior", label: "Behavior Analytics", icon: Activity },
  { id: "leadership", label: "Leadership Journey", icon: TrendingUp },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "revenue", label: "Revenue Insights", icon: DollarSign },
  { id: "geographic", label: "Geographic Intelligence", icon: Globe },
  { id: "growth", label: "Growth Trends", icon: TrendingUp },
  { id: "exports", label: "Exports", icon: Download },
];

export default function UserIntelligence() {
  const { data, loading, error } = useUserIntelligenceData();
  const [tab, setTab] = useState("overview");
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => (data ? applyFilters(data, filters) : null), [data, filters]);
  const filterOptions = useMemo(() => getFilterOptions(data), [data]);

  const overview = useMemo(() => (filtered ? computeOverview(filtered) : null), [filtered]);
  const demographics = useMemo(() => (filtered ? computeDemographics(filtered) : null), [filtered]);
  const career = useMemo(() => (filtered ? computeCareer(filtered) : null), [filtered]);
  const leadership = useMemo(() => (filtered ? computeLeadership(filtered) : null), [filtered]);
  const orgs = useMemo(() => (filtered ? computeOrganizations(filtered) : null), [filtered]);
  const behavior = useMemo(() => (filtered ? computeBehavior(filtered) : null), [filtered]);
  const revenue = useMemo(() => (filtered ? computeRevenue(filtered) : null), [filtered]);
  const funnel = useMemo(() => (filtered ? computeFunnel(filtered) : null), [filtered]);
  const growth = useMemo(() => (filtered ? computeGrowth(filtered) : null), [filtered]);

  if (loading) return <LoadingState />;
  if (error || !data) return <EmptyState message="Unable to load intelligence data." />;

  const updateFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val || undefined }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Users size={12} className="text-indigo-400" /> Product Intelligence™ · User Intelligence™ v1.0
        </div>
        <h1 className="text-2xl font-bold text-white">User Intelligence™</h1>
        <p className="text-white/40 text-sm mt-1">Executive analytics for users, organizations, engagement, leadership journeys, and growth.</p>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 bg-emerald-500/[0.04] border border-emerald-500/15 rounded-lg px-4 py-2">
        <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-300/70">Aggregated analytics only — no personally identifiable information is exposed. Privacy Policy, Responsible AI Framework™, and Platform Security Baseline™ compliant.</p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, organizations, companies, industries…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white/90 transition-colors">
          <Filter size={14} /> Filters {Object.values(filters).filter(Boolean).length > 0 && <span className="bg-indigo-500 text-white text-[10px] px-1.5 rounded-full">{Object.values(filters).filter(Boolean).length}</span>}
        </button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <FilterSelect label="Country" value={filters.country} options={filterOptions.countries} onChange={(v) => updateFilter("country", v)} />
          <FilterSelect label="Industry" value={filters.industry} options={filterOptions.industries} onChange={(v) => updateFilter("industry", v)} />
          <FilterSelect label="Subscription" value={filters.plan} options={filterOptions.plans} onChange={(v) => updateFilter("plan", v)} />
          <FilterSelect label="Career Stage" value={filters.careerStage} options={filterOptions.stages} onChange={(v) => updateFilter("careerStage", v)} />
          {Object.values(filters).filter(Boolean).length > 0 && (
            <button onClick={() => setFilters({})} className="text-xs text-red-400 hover:text-red-300 col-span-2 md:col-span-4 text-left">Clear all filters</button>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto pb-px">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? "border-indigo-400 text-indigo-400" : "border-transparent text-white/40 hover:text-white/70"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewTab overview={overview} revenue={revenue} funnel={funnel} data={filtered} />}
      {tab === "demographics" && <DemographicsTab demo={demographics} />}
      {tab === "career" && <CareerTab career={career} />}
      {tab === "behavior" && <BehaviorTab behavior={behavior} />}
      {tab === "leadership" && <LeadershipJourneyTab leadership={leadership} />}
      {tab === "organizations" && <OrganizationsTab orgs={orgs} />}
      {tab === "revenue" && <RevenueTab revenue={revenue} funnel={funnel} />}
      {tab === "geographic" && <GeographicTab demo={demographics} />}
      {tab === "growth" && <GrowthTab growth={growth} />}
      {tab === "exports" && <ExportsTab data={filtered} overview={overview} revenue={revenue} funnel={funnel} />}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] text-white/40 uppercase tracking-wide">{label}</span>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40 capitalize">
        <option value="">All</option>
        {options.map((opt) => <option key={opt} value={opt} className="capitalize">{opt}</option>)}
      </select>
    </label>
  );
}