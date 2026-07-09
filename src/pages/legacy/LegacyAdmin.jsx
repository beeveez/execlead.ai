import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield, Check, X, Star, Loader2, Eye, Heart, MessageCircle, Bookmark,
  TrendingUp, Globe, Building2, Flag, FileText, Search, Bot, Clock,
  Users, Sparkles, MessageSquare
} from "lucide-react";
import { formatCount } from "@/lib/legacyLibrary";
import ModerationQueueItem from "@/components/legacy/ModerationQueueItem";
import RejectionModal from "@/components/legacy/RejectionModal";
import RevisionModal from "@/components/legacy/RevisionModal";
import ReportsPanel from "@/components/legacy/ReportsPanel";
import AuditLogPanel from "@/components/legacy/AuditLogPanel";
import AssignReviewerModal from "@/components/legacy/AssignReviewerModal";

const STATUS_TABS = [
  { value: "pending_human_review", label: "Pending Review" },
  { value: "revision_requested", label: "Revisions" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
  { value: "draft", label: "Drafts" },
  { value: "all", label: "All" },
];

export default function LegacyAdmin() {
  const { toast } = useToast();
  const [view, setView] = useState("queue");
  const [tab, setTab] = useState("pending_human_review");
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [acting, setActing] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rejectLetter, setRejectLetter] = useState(null);
  const [revisionLetter, setRevisionLetter] = useState(null);
  const [assignLetter, setAssignLetter] = useState(null);

  useEffect(() => { if (view === "queue") loadData(); }, [tab, view, search]);
  useEffect(() => { loadAnalytics(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "admin_list", status: tab, search });
      const d = res.data || res;
      setLetters(d.letters || []);
    } catch (e) { toast({ title: "Failed to load", variant: "destructive" }); }
    setLoading(false);
  };

  const loadAnalytics = async () => {
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "analytics" });
      setAnalytics((res.data || res));
    } catch (e) {}
  };

  const handleAction = async (action, letter) => {
    if (action === "reject") { setRejectLetter(letter); return; }
    if (action === "request_revision") { setRevisionLetter(letter); return; }
    if (action === "assign_reviewer") { setAssignLetter(letter); return; }
    if (action === "delete") {
      if (!window.confirm(`Delete "${letter.title}"? This permanently removes the letter and all related data.`)) return;
    }

    setActing(letter.id);
    try {
      let payload = { action, letter_id: letter.id };
      if (action === "feature") payload.feature_type = "featured";
      if (action === "approve_feature") { payload.action = "approve"; payload.feature = true; }

      const res = await base44.functions.invoke("manageLegacyLibrary", payload);
      const d = res.data || res;

      if (action === "detect_duplicates") {
        if (d.duplicates?.length > 0) {
          toast({ title: `${d.duplicates.length} potential duplicate(s) found`, description: d.duplicates.map((dup) => dup.letter.title).join(", "), variant: "warning" });
        } else {
          toast({ title: "No duplicates found" });
        }
      } else if (d.success !== false) {
        toast({ title: action === "approve_feature" ? "Letter approved & featured" : `Letter ${action.replace("_", " ")}d successfully` });
        loadData();
        loadAnalytics();
      } else {
        toast({ title: d.error || "Action failed", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
    setActing(null);
  };

  const handleReject = async (reason, comments) => {
    if (!rejectLetter) return;
    setActing(rejectLetter.id);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "reject", letter_id: rejectLetter.id, reason, comments });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Letter rejected" });
        setRejectLetter(null);
        loadData();
        loadAnalytics();
      }
    } catch (e) { toast({ title: "Failed to reject", variant: "destructive" }); }
    setActing(null);
  };

  const handleRequestRevision = async (notes) => {
    if (!revisionLetter) return;
    setActing(revisionLetter.id);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "request_revision", letter_id: revisionLetter.id, revision_notes: notes });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Revision requested — author notified" });
        setRevisionLetter(null);
        loadData();
        loadAnalytics();
      }
    } catch (e) { toast({ title: "Failed to request revision", variant: "destructive" }); }
    setActing(null);
  };

  const handleAssign = async (reviewerId, reviewerName) => {
    if (!assignLetter) return;
    setActing(assignLetter.id);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "assign_reviewer", letter_id: assignLetter.id, reviewer_id: reviewerId, reviewer_name: reviewerName });
      const d = res.data || res;
      if (d.success) {
        toast({ title: reviewerId ? `Assigned to ${reviewerName}` : "Reviewer unassigned" });
        setAssignLetter(null);
        loadData();
      }
    } catch (e) { toast({ title: "Failed to assign reviewer", variant: "destructive" }); }
    setActing(null);
  };

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
        <Shield size={12} className="text-indigo-400" /> Admin
      </div>
      <h1 className="text-2xl font-bold mb-6">Leadership Legacy Library — Moderation</h1>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Published" value={analytics.published} icon={Check} color="text-emerald-400" />
          <StatCard label="Pending" value={analytics.pending_review} icon={Loader2} color="text-amber-400" />
          <StatCard label="Revisions" value={analytics.revision_requested} icon={MessageSquare} color="text-blue-400" />
          <StatCard label="Total Views" value={formatCount(analytics.total_views)} icon={Eye} color="text-indigo-400" />
          <StatCard label="AI Approval" value={`${analytics.ai_approval_rate}%`} icon={Bot} color="text-purple-400" />
          <StatCard label="Avg Review" value={`${analytics.avg_review_hours}h`} icon={Clock} color="text-cyan-400" />
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <ViewButton active={view === "queue"} onClick={() => setView("queue")} icon={Shield}>Moderation Queue</ViewButton>
        <ViewButton active={view === "reports"} onClick={() => setView("reports")} icon={Flag}>Reports</ViewButton>
        <ViewButton active={view === "audit"} onClick={() => setView("audit")} icon={FileText}>Audit Log</ViewButton>
        <ViewButton active={view === "analytics"} onClick={() => setView("analytics")} icon={TrendingUp}>Analytics</ViewButton>
      </div>

      {/* Views */}
      {view === "reports" ? (
        <ReportsPanel />
      ) : view === "audit" ? (
        <AuditLogPanel />
      ) : view === "analytics" ? (
        <AnalyticsView analytics={analytics} />
      ) : (
        <>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, author, or category…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <button type="submit" className="px-4 h-10 rounded-lg text-sm bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25">Search</button>
          </form>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {STATUS_TABS.map((t) => (
              <button key={t.value} onClick={() => setTab(t.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.value ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 border border-transparent"}`}>
                {t.label}
                {t.value === "pending_human_review" && analytics?.pending_review > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">{analytics.pending_review}</span>
                )}
              </button>
            ))}
          </div>

          {/* Letters */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : letters.length === 0 ? (
            <div className="text-center py-16"><p className="text-white/30 text-sm">{search ? "No letters match your search." : "No letters in this category."}</p></div>
          ) : (
            <div className="space-y-3">
              {letters.map((l) => (
                <ModerationQueueItem key={l.id} letter={l} acting={acting} onAction={handleAction} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {rejectLetter && (
        <RejectionModal letter={rejectLetter} onClose={() => setRejectLetter(null)} onReject={handleReject} loading={acting === rejectLetter.id} />
      )}
      {revisionLetter && (
        <RevisionModal letter={revisionLetter} onClose={() => setRevisionLetter(null)} onRequestRevision={handleRequestRevision} loading={acting === revisionLetter.id} />
      )}
      {assignLetter && (
        <AssignReviewerModal letter={assignLetter} onClose={() => setAssignLetter(null)} onAssign={handleAssign} loading={acting === assignLetter.id} />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} className={`${color} mb-2`} />
      <div className="text-2xl font-bold text-white/90">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}

function ViewButton({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 border border-transparent hover:text-white/70"}`}>
      <Icon size={14} /> {children}
    </button>
  );
}

function AnalyticsView({ analytics }) {
  if (!analytics) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Moderation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="AI Approval Rate" value={`${analytics.ai_approval_rate}%`} icon={Bot} color="text-purple-400" />
        <MetricCard label="Human Approval Rate" value={`${analytics.human_approval_rate}%`} icon={Check} color="text-emerald-400" />
        <MetricCard label="Avg Review Time" value={`${analytics.avg_review_hours}h`} icon={Clock} color="text-cyan-400" />
        <MetricCard label="Featured" value={analytics.featured} icon={Star} color="text-amber-400" />
      </div>

      {/* Industries */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3"><Building2 size={14} className="text-indigo-400" /><h3 className="text-sm font-semibold">Top Industries</h3></div>
        <div className="space-y-2">
          {(analytics.industries || []).slice(0, 10).map((ind) => (
            <div key={ind.name} className="flex items-center gap-3">
              <span className="text-white/60 text-xs w-32 truncate">{ind.name}</span>
              <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500/40 h-full" style={{ width: `${Math.min(100, (ind.count / (analytics.industries[0]?.count || 1)) * 100)}%` }} />
              </div>
              <span className="text-white/40 text-xs w-6 text-right">{ind.count}</span>
            </div>
          ))}
          {analytics.industries?.length === 0 && <p className="text-white/30 text-xs">No data yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Countries */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Globe size={14} className="text-amber-400" /><h3 className="text-sm font-semibold">Top Countries</h3></div>
          <div className="flex flex-wrap gap-2">
            {(analytics.countries || []).slice(0, 15).map((c) => (
              <span key={c.name} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white/60 text-xs">{c.name} ({c.count})</span>
            ))}
            {analytics.countries?.length === 0 && <p className="text-white/30 text-xs">No data yet.</p>}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Sparkles size={14} className="text-indigo-400" /><h3 className="text-sm font-semibold">Categories</h3></div>
          <div className="space-y-2">
            {(analytics.categories || []).slice(0, 8).map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-white/60 text-xs flex-1 truncate">{cat.name}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500/40 h-full" style={{ width: `${Math.min(100, (cat.count / (analytics.categories[0]?.count || 1)) * 100)}%` }} />
                </div>
                <span className="text-white/40 text-xs w-6 text-right">{cat.count}</span>
              </div>
            ))}
            {analytics.categories?.length === 0 && <p className="text-white/30 text-xs">No data yet.</p>}
          </div>
        </div>
      </div>

      {/* Top Authors */}
      {analytics.top_authors?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Users size={14} className="text-emerald-400" /><h3 className="text-sm font-semibold">Top Authors</h3></div>
          <div className="space-y-2">
            {analytics.top_authors.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white/30 text-xs w-4">{i + 1}.</span>
                <span className="text-white/60 text-xs flex-1 truncate">{a.name}</span>
                <span className="text-white/40 text-xs">{a.letters} letters</span>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-indigo-400 text-xs">{formatCount(a.views)} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} className={`${color} mb-2`} />
      <div className="text-xl font-bold text-white/90">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}