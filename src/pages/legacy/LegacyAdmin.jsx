import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Check, X, Star, Archive, Loader2, Eye, Heart, MessageCircle, Bookmark, TrendingUp, Globe, Building2 } from "lucide-react";
import { formatCount } from "@/lib/legacyLibrary";

const STATUS_TABS = [
  { value: "pending_review", label: "Pending Review" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

export default function LegacyAdmin() {
  const { toast } = useToast();
  const [tab, setTab] = useState("pending_review");
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [acting, setActing] = useState(null);
  const [view, setView] = useState("queue");

  useEffect(() => {
    loadData();
    loadAnalytics();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "admin_list", status: tab });
      const d = res.data || res;
      setLetters(d.letters || []);
    } catch (e) { toast({ title: "Failed to load", variant: "destructive" }); }
    setLoading(false);
  };

  const loadAnalytics = async () => {
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "analytics" });
      const d = res.data || res;
      setAnalytics(d);
    } catch (e) {}
  };

  const handleAction = async (letterId, adminAction) => {
    setActing(letterId);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "admin_action", letter_id: letterId, admin_action: adminAction });
      const d = res.data || res;
      if (d.success) {
        toast({ title: `Letter ${adminAction}d` });
        loadData();
        loadAnalytics();
      }
    } catch (e) { toast({ title: "Action failed", variant: "destructive" }); }
    setActing(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
        <Shield size={12} className="text-indigo-400" /> Admin
      </div>
      <h1 className="text-2xl font-bold mb-6">Leadership Legacy Library — Moderation</h1>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Published" value={analytics.published} icon={Check} color="text-emerald-400" />
          <StatCard label="Pending" value={analytics.pending_review} icon={Loader2} color="text-amber-400" />
          <StatCard label="Total Views" value={formatCount(analytics.total_views)} icon={Eye} color="text-indigo-400" />
          <StatCard label="Total Likes" value={formatCount(analytics.total_likes)} icon={Heart} color="text-red-400" />
          <StatCard label="Bookmarks" value={formatCount(analytics.total_bookmarks)} icon={Bookmark} color="text-purple-400" />
          <StatCard label="Comments" value={formatCount(analytics.total_comments)} icon={MessageCircle} color="text-cyan-400" />
          <StatCard label="Shares" value={formatCount(analytics.total_shares)} icon={TrendingUp} color="text-emerald-400" />
          <StatCard label="Countries" value={analytics.countries?.length || 0} icon={Globe} color="text-amber-400" />
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView("queue")} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "queue" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>Moderation Queue</button>
        <button onClick={() => setView("analytics")} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "analytics" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>Analytics</button>
      </div>

      {view === "analytics" && analytics ? (
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Building2 size={14} className="text-indigo-400" /><h3 className="text-sm font-semibold">Top Industries</h3></div>
            <div className="space-y-2">
              {analytics.industries?.slice(0, 10).map((ind) => (
                <div key={ind.name} className="flex items-center gap-3">
                  <span className="text-white/60 text-xs w-32">{ind.name}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500/40 h-full" style={{ width: `${Math.min(100, (ind.count / (analytics.industries[0]?.count || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-white/40 text-xs w-6 text-right">{ind.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Globe size={14} className="text-amber-400" /><h3 className="text-sm font-semibold">Top Countries</h3></div>
            <div className="flex flex-wrap gap-2">
              {analytics.countries?.slice(0, 15).map((c) => (
                <span key={c.name} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white/60 text-xs">{c.name} ({c.count})</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Status Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {STATUS_TABS.map((t) => (
              <button key={t.value} onClick={() => setTab(t.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.value ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 border border-transparent"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Letters */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : letters.length === 0 ? (
            <div className="text-center py-16"><p className="text-white/30 text-sm">No letters in this category.</p></div>
          ) : (
            <div className="space-y-3">
              {letters.map((l) => (
                <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 text-[10px] font-medium">{l.category}</span>
                        {l.featured && <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-medium">Featured</span>}
                      </div>
                      <Link to={`/legacy-library/${l.id}`} className="text-white/90 font-medium text-sm hover:text-indigo-400 transition-colors block truncate">{l.title}</Link>
                      <div className="text-white/40 text-xs mt-0.5">by {l.author_name} · {l.organization || "No org"} · {l.industry || "No industry"}</div>
                      <p className="text-white/40 text-xs mt-1 line-clamp-2">{l.message?.substring(0, 200)}</p>
                      <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
                        <span className="flex items-center gap-1"><Eye size={10} /> {l.views}</span>
                        <span className="flex items-center gap-1"><Heart size={10} /> {l.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={10} /> {l.comments_count}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {tab === "pending_review" && (
                        <>
                          <button onClick={() => handleAction(l.id, "approve")} disabled={acting === l.id} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            <Check size={12} /> Approve
                          </button>
                          <button onClick={() => handleAction(l.id, "reject")} disabled={acting === l.id} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}
                      {tab === "published" && (
                        <>
                          <button onClick={() => handleAction(l.id, l.featured ? "unfeature" : "feature")} disabled={acting === l.id} className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${l.featured ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-white/5 border border-white/10 text-white/50 hover:text-amber-400"}`}>
                            <Star size={12} fill={l.featured ? "currentColor" : "none"} /> {l.featured ? "Unfeature" : "Feature"}
                          </button>
                          <button onClick={() => handleAction(l.id, "archive")} disabled={acting === l.id} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            <Archive size={12} /> Archive
                          </button>
                        </>
                      )}
                      {(tab === "rejected" || tab === "archived") && (
                        <button onClick={() => handleAction(l.id, "approve")} disabled={acting === l.id} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          <Check size={12} /> Restore
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
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