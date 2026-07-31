import React from 'react';
import { Inbox, CheckCircle2, AlertTriangle, ThumbsUp, Tag, Clock, Rocket } from 'lucide-react';

export default function FeedbackOverview({ items }) {
  const open = items.filter((i) => !['Resolved', 'Released', 'Rejected', 'Duplicate'].includes(i.status));
  const resolved = items.filter((i) => ['Resolved', 'Released'].includes(i.status));
  const critical = items.filter((i) => i.severity === 'Critical' && !['Resolved', 'Released', 'Rejected', 'Duplicate'].includes(i.status));
  const mostVoted = [...items].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 5);
  const newest = [...items].sort((a, b) => new Date(b.submitted_at || b.created_date) - new Date(a.submitted_at || a.created_date)).slice(0, 5);
  const recentlyReleased = items.filter((i) => i.status === 'Released').slice(0, 5);
  const catCounts = {};
  items.forEach((i) => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = topCats[0]?.[1] || 1;

  const KPI = ({ icon: Icon, label, value, color }) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span></div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Inbox} label="Open" value={open.length} color="text-sky-400" />
        <KPI icon={CheckCircle2} label="Resolved" value={resolved.length} color="text-emerald-400" />
        <KPI icon={AlertTriangle} label="Critical" value={critical.length} color="text-rose-400" />
        <KPI icon={ThumbsUp} label="Most Voted" value={mostVoted[0]?.vote_count || 0} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel icon={Tag} title="Top Categories">
          {topCats.length === 0 ? <Empty text="No feedback yet." /> : (
            <div className="space-y-2">
              {topCats.map(([cat, n]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-white/70 truncate">{cat}</span><span className="text-white/50">{n}</span></div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500/60 to-accent-orange/60" style={{ width: `${(n / maxCat) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel icon={Rocket} title="Recently Released">
          {recentlyReleased.length === 0 ? <Empty text="Nothing released yet." /> : (
            <div className="space-y-2">
              {recentlyReleased.map((i) => (
                <div key={i.id} className="rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2">
                  <div className="flex items-center justify-between"><span className="text-[12px] text-white/80 truncate">{i.title}</span>{i.release_version && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">v{i.release_version}</span>}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{i.feedback_id} · {i.category}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel icon={Clock} title="Newest">
          {newest.length === 0 ? <Empty text="No feedback yet." /> : (
            <div className="space-y-2">
              {newest.map((i) => (
                <div key={i.id} className="rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2">
                  <div className="text-[12px] text-white/80 truncate">{i.title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{i.feedback_id} · {i.severity} · {timeAgo(i.submitted_at || i.created_date)}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel icon={ThumbsUp} title="Most Voted">
          {mostVoted.length === 0 || !mostVoted[0]?.vote_count ? <Empty text="No votes yet." /> : (
            <div className="space-y-2">
              {mostVoted.map((i) => (
                <div key={i.id} className="rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2 flex items-center justify-between">
                  <div className="min-w-0"><div className="text-[12px] text-white/80 truncate">{i.title}</div><div className="text-[10px] text-white/40">{i.feedback_id} · {i.category}</div></div>
                  <span className="text-[12px] font-semibold text-amber-400 shrink-0 ml-3">+{i.vote_count || 0}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4"><Icon size={14} className="text-accent-orange" /><h3 className="text-sm font-semibold text-white">{title}</h3></div>
      {children}
    </div>
  );
}

function Empty({ text }) { return <p className="text-[12px] text-white/40">{text}</p>; }

function timeAgo(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}