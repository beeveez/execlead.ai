import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { BarChart3, Eye, QrCode, Linkedin, Share2, Globe2, TrendingUp, Loader2 } from "lucide-react";

const SOURCE_META = {
  direct: { label: "Direct", icon: Eye, color: "#6366f1" },
  qr: { label: "QR Scan", icon: QrCode, color: "#06b6d4" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  share: { label: "Shared Link", icon: Share2, color: "#a855f7" },
  search: { label: "Search", icon: TrendingUp, color: "#f59e0b" },
  other: { label: "Other", icon: Globe2, color: "#64748b" },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function ExecutiveAnalytics({ profile }) {
  const [views, setViews] = useState([]);
  const [shares, setShares] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.public_username) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const [viewRes, shareRes] = await Promise.all([
          base44.entities.ProfileView.filter({ owner_username: profile.public_username }),
          base44.entities.ShareEvent.list("-created_date", 100).catch(() => []),
        ]);
        if (!active) return;
        setViews(viewRes || []);
        setShares((shareRes || []).length);
      } catch (e) {
        if (!active) return;
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile?.public_username]);

  const totalViews = views.length;
  const qrScans = views.filter((v) => v.source === "qr").length;
  const linkedinClicks = views.filter((v) => v.source === "linkedin").length;
  const countries = new Set(views.map((v) => (v.viewer_timezone || "").split("/")[0]).filter(Boolean));

  // 7-day trend
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayViews = views.filter((v) => {
      if (!v.created_date) return false;
      const vd = new Date(v.created_date);
      return vd.toDateString() === date.toDateString();
    }).length;
    trendData.push({ day: dayLabel, views: dayViews });
  }

  const sourceBreakdown = Object.entries(SOURCE_META).map(([key, meta]) => ({
    source: key,
    label: meta.label,
    count: views.filter((v) => (v.source || "direct") === key).length,
    color: meta.color,
  })).filter((s) => s.count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={20} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!profile?.public_username) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
        <BarChart3 size={28} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/50 mb-1">Analytics activate once your profile is published.</p>
        <p className="text-xs text-white/30">Set a username and publish to start tracking views.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="Profile Views" value={totalViews} color="#6366f1" />
        <StatCard icon={QrCode} label="QR Scans" value={qrScans} color="#06b6d4" />
        <StatCard icon={Linkedin} label="LinkedIn Clicks" value={linkedinClicks} color="#0A66C2" />
        <StatCard icon={Share2} label="Profile Shares" value={shares} color="#a855f7" />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">7-Day View Trend</h3>
          </div>
          <span className="text-xs text-white/30">{trendData.reduce((a, d) => a + d.views, 0)} this week</span>
        </div>
        <div className="p-5 h-48">
          {totalViews === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-white/30">No views yet. Share your profile to get started.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ background: "#11111a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "rgba(255,255,255,0.5)" }} />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, i) => (
                    <Cell key={i} fill={entry.views > 0 ? "#6366f1" : "rgba(255,255,255,0.05)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
          </div>
          <div className="p-5 space-y-3">
            {sourceBreakdown.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No source data yet.</p>
            ) : (
              sourceBreakdown.map((s) => {
                const pct = totalViews > 0 ? Math.round((s.count / totalViews) * 100) : 0;
                return (
                  <div key={s.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">{s.label}</span>
                      <span className="text-xs text-white/40">{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Globe2 size={14} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Regions</h3>
            </div>
          </div>
          <div className="p-5">
            {countries.size === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No region data yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...countries].map((region) => (
                  <span key={region} className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs">{region}</span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-white/30 mt-3">Region derived from viewer timezone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}