import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Users, CheckCircle2, Clock, XCircle, Mail,
  TrendingUp, Bug, Lightbulb, MessageSquare, Award, Gauge, Rocket,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import {
  BETA_STAGES, BETA_TIERS, APPLICATION_STATUSES,
  getCurrentBetaStage, getBetaProgramStats, reviewApplication, sendInvitation,
} from "@/lib/betaProgramEngine";

function StatCard({ icon: Icon, label, value, color = "text-white" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-white/30" />
        <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = APPLICATION_STATUSES[status] || APPLICATION_STATUSES.pending;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.border} border ${config.text}`}>
      {config.label}
    </span>
  );
}

function ApplicationRow({ app, onAction, actionLoading }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0">
          {app.full_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-white truncate">{app.full_name}</div>
          <div className="text-[10px] text-white/40 truncate">{app.email}</div>
        </div>
        <div className="hidden sm:block text-[10px] text-white/30">{app.company || "—"}</div>
        <StatusBadge status={app.status} />
        <ChevronRight size={12} className={`text-white/30 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><span className="text-white/30">Role:</span> <span className="text-white/60">{app.current_role || "—"}</span></div>
            <div><span className="text-white/30">Experience:</span> <span className="text-white/60">{app.years_of_experience || "—"} years</span></div>
            <div><span className="text-white/30">LinkedIn:</span> {app.linkedin_url ? <a href={app.linkedin_url} target="_blank" rel="noopener" className="text-indigo-400 hover:underline">View</a> : <span className="text-white/30">—</span>}</div>
            <div><span className="text-white/30">Source:</span> <span className="text-white/60 capitalize">{(app.how_heard || "—").replace("_", " ")}</span></div>
          </div>
          {app.why_join && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Why Join</div>
              <div className="text-[11px] text-white/60 leading-relaxed bg-white/[0.02] rounded-lg p-2">{app.why_join}</div>
            </div>
          )}
          {app.review_notes && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Review Notes</div>
              <div className="text-[11px] text-white/60 bg-white/[0.02] rounded-lg p-2">{app.review_notes}</div>
            </div>
          )}
          {app.status === "pending" && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onAction(app.id, "approved")}
                disabled={actionLoading === app.id}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-30"
              >
                Approve
              </button>
              <button
                onClick={() => onAction(app.id, "waitlisted")}
                disabled={actionLoading === app.id}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-30"
              >
                Waitlist
              </button>
              <button
                onClick={() => onAction(app.id, "rejected")}
                disabled={actionLoading === app.id}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-30"
              >
                Reject
              </button>
            </div>
          )}
          {app.status === "approved" && (
            <button
              onClick={() => onAction(app.id, "invited")}
              disabled={actionLoading === app.id}
              className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-30"
            >
              <Mail size={11} /> Send Invitation
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "applications", label: "Applications", icon: Users, filter: "pending" },
  { id: "approved", label: "Approved", icon: CheckCircle2, filter: "approved" },
  { id: "waitlist", label: "Waitlist", icon: Clock, filter: "waitlisted" },
  { id: "rejected", label: "Rejected", icon: XCircle, filter: "rejected" },
  { id: "invited", label: "Invited", icon: Mail, filter: "invited" },
  { id: "activated", label: "Activated", icon: CheckCircle2, filter: "activated" },
];

export default function BetaProgramCenter() {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");

  const stage = getCurrentBetaStage();

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, apps] = await Promise.all([
        getBetaProgramStats(),
        base44.entities.BetaApplication.list("-created_date", 200),
      ]);
      setStats(s);
      setApplications(apps);
    } catch {
      setStats(null);
      setApplications([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredApps = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return applications;
    return applications.filter((a) => a.status === tab.filter);
  }, [applications, activeTab]);

  const handleAction = async (appId, decision) => {
    setActionLoading(appId);
    try {
      const user = await base44.auth.me().catch(() => null);
      if (decision === "invited") {
        await sendInvitation(appId);
        toast({ title: "Invitation sent", description: "The applicant will receive an email." });
      } else {
        await reviewApplication(appId, decision, {}, user);
        const labels = { approved: "Approved", waitlisted: "Waitlisted", rejected: "Rejected" };
        toast({ title: labels[decision] || "Updated", description: "Application status updated." });
      }
      await loadData();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-white/40">
        <Link to="/developer" className="hover:text-white/70 transition-colors">Developer Console</Link>
        <ChevronRight size={10} className="text-white/20" />
        <span className="text-amber-400 flex items-center gap-1">
          <Rocket size={11} /> Beta Program Center™
        </span>
      </nav>

      {/* Stage Banner */}
      <div className="bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{stage.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{stage.label}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">v{stage.version}</span>
            </div>
            <p className="text-[11px] text-white/40">{stage.description}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Capacity</div>
            <div className="text-sm font-bold text-white">
              {stats?.activeBetaUsers || 0} / {stage.maxUsers || "∞"}
            </div>
            {stats?.capacityUsedPct > 0 && (
              <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${stats.capacityUsedPct}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Applications" value={stats?.total ?? "—"} />
        <StatCard icon={Clock} label="Pending Review" value={stats?.pending ?? "—"} color="text-amber-400" />
        <StatCard icon={CheckCircle2} label="Active Beta Users" value={stats?.activeBetaUsers ?? "—"} color="text-emerald-400" />
        <StatCard icon={Mail} label="Invited" value={stats?.invited ?? "—"} color="text-cyan-400" />
      </div>

      {/* Beta Tier Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={12} className="text-white/30" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Feature Flag Tiers</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(BETA_TIERS).map(([key, tier]) => (
            <div key={key} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold" style={{ color: tier.color }}>{stats?.tierBreakdown?.[key] ?? 0}</div>
              <div className="text-[9px] text-white/30 mt-0.5">{tier.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70"
            }`}
          >
            <tab.icon size={12} /> {tab.label}
            <span className="text-[9px] text-white/30 ml-0.5">
              {applications.filter((a) => a.status === tab.filter).length}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-white/30 text-xs">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-xs">No applications in this category.</div>
        ) : (
          filteredApps.map((app) => (
            <ApplicationRow key={app.id} app={app} onAction={handleAction} actionLoading={actionLoading} />
          ))
        )}
      </div>
    </div>
  );
}