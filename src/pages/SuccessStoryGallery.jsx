import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import SuccessStoryCard from '@/components/success-stories/SuccessStoryCard';
import { Search, Trophy, Loader2, Sparkles } from 'lucide-react';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';

const SORTS = [
  { v: 'recent', l: 'Most Recent' },
  { v: 'inspiring', l: 'Most Inspiring' },
  { v: 'readiness', l: 'Highest Readiness' },
];

export default function SuccessStoryGallery() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState('all');
  const [role, setRole] = useState('all');
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    base44.entities.ExecutiveSuccessStory.filter({ published: true }, '-generated_date', 100)
      .then((all) => setStories((all || []).filter((s) => s.visibility !== 'private')))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(() => {
    const set = new Set(stories.map((s) => s.industry).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [stories]);

  const roles = useMemo(() => {
    const set = new Set(stories.map((s) => s.target_role || s.user_role).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [stories]);

  const filtered = useMemo(() => {
    let list = stories.slice();
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter((s) => (s.title || '').toLowerCase().includes(ql) || (s.summary || '').toLowerCase().includes(ql));
    }
    if (industry !== 'all') list = list.filter((s) => s.industry === industry);
    if (role !== 'all') list = list.filter((s) => (s.target_role || s.user_role) === role);
    if (sort === 'inspiring') list.sort((a, b) => (safeParse(b.metrics_snapshot_json, {}).improvement || 0) - (safeParse(a.metrics_snapshot_json, {}).improvement || 0));
    else if (sort === 'readiness') list.sort((a, b) => (safeParse(b.metrics_snapshot_json, {}).readinessCurrent || 0) - (safeParse(a.metrics_snapshot_json, {}).readinessCurrent || 0));
    else list.sort((a, b) => new Date(b.generated_date || 0) - new Date(a.generated_date || 0));
    return list;
  }, [stories, q, industry, role, sort]);

  const featured = stories.filter((s) => s.featured).slice(0, 3);

  const selectCls = 'bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-accent-orange/40';

  return (
    <div className="pt-28 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange font-semibold uppercase tracking-wider mb-4">
            <Trophy size={13} /> Executive Success Stories™
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Real Leadership Journeys. Measurable Growth.</h1>
          <p className="text-white/50 max-w-2xl mx-auto">AI-generated case studies from verified EXECLEAD.AI members — coaching, simulations, evidence, and outcomes transformed into compelling executive narratives.</p>
        </div>

        {featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-sm text-amber-400 font-semibold"><Trophy size={15} /> Featured Stories</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((s) => <SuccessStoryCard key={s.id} story={s} />)}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40" />
          </div>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
            {industries.map((i) => <option key={i} value={i} className="bg-[#0d0d14]">{i === 'all' ? 'All Industries' : i}</option>)}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls}>
            {roles.map((r) => <option key={r} value={r} className="bg-[#0d0d14]">{r === 'all' ? 'All Roles' : r}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
            {SORTS.map((s) => <option key={s.v} value={s.v} className="bg-[#0d0d14]">{s.l}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-accent-orange" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/8 rounded-2xl">
            <Sparkles size={24} className="text-white/30 mx-auto mb-3" />
            <p className="text-sm text-white/50">No success stories match your filters yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => <SuccessStoryCard key={s.id} story={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}