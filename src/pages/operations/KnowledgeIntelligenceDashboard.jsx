import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, RefreshCw, Search, FileText, AlertTriangle, Building2, TrendingUp,
  ShieldCheck, Gauge, BookOpen, Lightbulb, ArrowRight, Users, ChevronRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const fmtDate = (d) => { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch (e) { return '—'; } };

function Card({ title, icon: Icon, children, accent = 'text-accent-orange' }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className={accent} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[11px] text-white/45 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}
function QRow({ item }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-[12px] text-white/70 truncate">{item.key || item.title || item.query}</span>
      <span className="text-[11px] text-accent-orange/80 shrink-0">{item.count ?? item.estimatedDemand ?? ''}</span>
    </div>
  );
}
function Empty({ children }) { return <div className="text-[12px] text-white/35 py-3 text-center">{children}</div>; }

export default function KnowledgeIntelligenceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await base44.functions.invoke('getKnowledgeIntelligence', {});
      setData(res.data || res);
    } catch (e) { setErr(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="h-8 w-72 rounded-lg shimmer-bg mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[0,1,2,3].map((i) => <div key={i} className="h-28 rounded-2xl shimmer-bg" />)}</div>
        <div className="h-80 rounded-2xl shimmer-bg" />
      </div>
    );
  }
  if (err) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><AlertTriangle className="text-rose-400 mx-auto mb-3" /><p className="text-white/70">{err}</p><button onClick={load} className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-sm">Retry</button></div>;
  }
  const d = data || {};
  const h = d.health || { score: 0, components: {} };
  const cov = d.coverage || { overall: 0, areas: [] };
  const s = d.search || {};
  const ai = d.aiConfidence || {};
  const ent = d.enterprise || {};
  const com = d.commercial || {};
  const recs = d.recommendations || [];

  const coverageChart = cov.areas.slice(0, 12).map((a) => ({ name: a.label.replace(/[™]/g, ''), coverage: a.coverage }));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-2">
            <Sparkles size={13} /> Knowledge Intelligence™
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Knowledge Intelligence Dashboard™</h1>
          <p className="text-sm text-white/45 mt-1">The Executive Knowledge Center™, learning from real user behavior.</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[12px] text-white/70 hover:bg-white/5 disabled:opacity-40">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Knowledge Health Score™ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.07] to-transparent p-6 flex flex-col items-center justify-center">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-1">Knowledge Health™</div>
          <div className="text-5xl font-bold text-white">{h.score}%</div>
          <div className="text-[11px] text-white/40 mt-1">Trend {h.trend >= 0 ? '+' : ''}{h.trend}%</div>
          <Link to="/help" className="mt-4 text-[11px] text-accent-orange hover:text-accent-orange/80 flex items-center gap-1">Open Knowledge Center <ArrowRight size={11} /></Link>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Coverage" value={`${cov.overall}%`} sub={`${(d.freshness?.totalArticles) || 0} articles`} />
          <Stat label="Freshness (90d)" value={`${d.freshness?.pct || 0}%`} sub={`${d.freshness?.updatedLast90Days || 0} updated`} />
          <Stat label="Helpfulness" value={`${h.components?.helpfulness ?? 0}%`} />
          <Stat label="Search Success" value={`${h.components?.searchSuccess ?? 0}%`} sub={`${s.zeroResultCount || 0} zero-result`} />
          <Stat label="AI Confidence" value={`${ai.avg || 0}%`} sub={`${ai.lowCount || 0} low`} />
          <Stat label="Total Searches" value={s.total || 0} sub={`${s.clickRate || 0}% click-through`} />
        </div>
      </div>

      {/* Coverage + Search Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Knowledge Coverage™" icon={Gauge}>
          <div className="text-[11px] text-white/40 mb-2">Overall coverage {cov.overall}%</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageChart} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }} />
                <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                  {coverageChart.map((c, i) => <Cell key={i} fill={c.coverage >= 100 ? '#10b981' : c.coverage >= 50 ? '#f59e0b' : '#f43f5e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Search Analytics™" icon={Search}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Total" value={s.total || 0} />
            <Stat label="Zero-Result" value={`${s.zeroResultRate || 0}%`} />
            <Stat label="Click Rate" value={`${s.clickRate || 0}%`} />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">Most Searched</div>
          {(s.topQueries || []).length ? (s.topQueries || []).slice(0, 6).map((q) => <QRow key={q.key} item={q} />) : <Empty>No searches yet.</Empty>}
        </Card>
      </div>

      {/* Trending + Zero-result + Repeated + Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card title="Trending (7d)" icon={TrendingUp} accent="text-emerald-400">
          {(s.trending || []).length ? s.trending.map((q) => <QRow key={q.key} item={q} />) : <Empty>No trending searches.</Empty>}
        </Card>
        <Card title="Zero-Result Searches" icon={AlertTriangle} accent="text-rose-400">
          {(s.zeroResult || []).length ? s.zeroResult.map((q) => <QRow key={q.key} item={q} />) : <Empty>None — coverage is complete.</Empty>}
        </Card>
        <Card title="Repeated Searches" icon={RefreshCw} accent="text-amber-400">
          {(s.repeated || []).length ? s.repeated.map((q) => <QRow key={q.key} item={q} />) : <Empty>None detected.</Empty>}
        </Card>
        <Card title="Top Categories (views)" icon={BookOpen}>
          {(s.topCategories || []).length ? s.topCategories.map((q) => <QRow key={q.key} item={q} />) : <Empty>No views yet.</Empty>}
        </Card>
      </div>

      {/* Article Performance */}
      <Card title="Article Performance™" icon={FileText}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-white/40 text-left border-b border-white/8">
                <th className="py-2 pr-3 font-medium">Article</th>
                <th className="py-2 px-2 font-medium text-center">Views</th>
                <th className="py-2 px-2 font-medium text-center">Unique</th>
                <th className="py-2 px-2 font-medium text-center">👍</th>
                <th className="py-2 px-2 font-medium text-center">👎</th>
                <th className="py-2 px-2 font-medium text-center">Related</th>
                <th className="py-2 px-2 font-medium text-center">Trust</th>
                <th className="py-2 px-2 font-medium text-center">AI Cites</th>
                <th className="py-2 px-2 font-medium text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(d.articles || []).slice(0, 12).map((a) => (
                <tr key={a.slug} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 pr-3 text-white/75 max-w-[220px] truncate"><Link to="/help" className="hover:text-accent-orange">{a.question}</Link></td>
                  <td className="py-2 px-2 text-center text-white/70">{a.views}</td>
                  <td className="py-2 px-2 text-center text-white/70">{a.uniqueReaders}</td>
                  <td className="py-2 px-2 text-center text-emerald-400">{a.helpful}</td>
                  <td className="py-2 px-2 text-center text-rose-400">{a.notHelpful}</td>
                  <td className="py-2 px-2 text-center text-white/60">{a.relatedClicks}</td>
                  <td className="py-2 px-2 text-center text-white/60">{a.trustRefs}</td>
                  <td className="py-2 px-2 text-center text-indigo-300">{a.aiCitations}</td>
                  <td className="py-2 px-2 text-right text-white/40">{fmtDate(a.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(d.articles || []).length === 0 && <Empty>No article performance data yet.</Empty>}
        </div>
      </Card>

      {/* Gaps + AI Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card title="Knowledge Gap Analysis™" icon={AlertTriangle} accent="text-rose-400">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">Missing Coverage</div>
          {(d.gaps?.missingCoverage || []).length ? d.gaps.missingCoverage.slice(0, 6).map((a) => (
            <div key={a.key} className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-[12px] text-white/70">{a.label}</span>
              <span className="text-[11px] text-rose-400">{a.coverage}% · {a.count}/{a.target}</span>
            </div>
          )) : <Empty>Full coverage.</Empty>}
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mt-3 mb-1">Low-Rated Articles</div>
          {(d.gaps?.lowRated || []).length ? d.gaps.lowRated.map((a) => <QRow key={a.slug} item={{ key: a.question, count: `👎${a.notHelpful}/👍${a.helpful}` }} />) : <Empty>None.</Empty>}
        </Card>
        <Card title="Ask EXEC™ Confidence™" icon={ShieldCheck} accent="text-indigo-300">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Avg Confidence" value={`${ai.avg || 0}%`} />
            <Stat label="Low Confidence" value={ai.lowCount || 0} />
            <Stat label="Total AI Asks" value={ai.total || 0} />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">Low-Confidence Questions</div>
          {(d.gaps?.lowConfidence || []).length ? d.gaps.lowConfidence.map((q) => <QRow key={q.query} item={{ key: q.query, count: `${q.confidence}%` }} />) : <Empty>None — confidence healthy.</Empty>}
        </Card>
      </div>

      {/* Enterprise + Commercial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card title="Enterprise Insights™" icon={Building2} accent="text-indigo-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <Stat label="Security Views" value={ent.securityViews || 0} />
            <Stat label="Privacy Views" value={ent.privacyViews || 0} />
            <Stat label="Compliance" value={ent.complianceViews || 0} />
            <Stat label="Trust Refs" value={ent.trustRefs || 0} />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">Procurement Searches</div>
          {(ent.procurementQueries || []).length ? ent.procurementQueries.map((q) => <QRow key={q.key} item={q} />) : <Empty>None yet.</Empty>}
        </Card>
        <Card title="Commercial Intelligence™" icon={TrendingUp} accent="text-emerald-400">
          <div className="grid grid-cols-1 gap-2 mb-3">
            <Stat label="Pre-Conversion Knowledge Touches" value={com.preConversionViews || 0} sub="views arriving from /pricing, /beta, /trust-center" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">Top from Pricing</div>
          {(com.topFromPricing || []).length ? com.topFromPricing.map((q) => <QRow key={q.slug} item={{ key: q.question, count: q.views }} />) : <Empty>None yet.</Empty>}
        </Card>
      </div>

      {/* Content Recommendations */}
      <Card title="Content Recommendation Engine™" icon={Lightbulb} accent="text-amber-400">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recs.length ? recs.map((r, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${r.priority === 'High' ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'}`}>{r.priority}</span>
                <span className="text-[10px] text-white/35">{r.source}</span>
              </div>
              <div className="text-[13px] text-white/80 font-medium mb-1">{r.title}</div>
              <div className="text-[11px] text-white/45">{r.expectedImpact} · est. demand {r.estimatedDemand}</div>
            </div>
          )) : <Empty>No recommendations — knowledge demand is well covered.</Empty>}
        </div>
      </Card>

      <div className="text-center mt-8">
        <Link to="/help" className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80">
          <Users size={14} /> Open Executive Knowledge Center™ <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}