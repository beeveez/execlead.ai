import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { getEffectiveRole } from '@/lib/roles';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Loader2, LayoutDashboard, Columns3, List, MessageSquareWarning, ShieldAlert, Search } from 'lucide-react';
import FeedbackOverview from '@/components/beta-feedback/FeedbackOverview';
import FeedbackKanban from '@/components/beta-feedback/FeedbackKanban';
import FeedbackDetailDrawer from '@/components/beta-feedback/FeedbackDetailDrawer';
import SubmitFeedbackForm from '@/components/beta-feedback/SubmitFeedbackForm';
import { statusForColumn, severityColor, statusColor } from '@/lib/betaFeedbackEngine';

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin', 'enterprise_admin'];

export default function BetaFeedbackCenter() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const effectiveRole = getEffectiveRole(user?.role, profile);
  const isAdmin = ADMIN_ROLES.includes(effectiveRole);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Product feedback records are identified by the presence of a feedback_id + category.
      const all = await base44.entities.BetaFeedback.list('-created_date', 500);
      const product = (all || []).filter((i) => i.feedback_id && i.category && i.title);
      setItems(product);
    } catch (e) {
      toast({ title: 'Could not load feedback', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const refreshOne = async (id) => {
    try {
      const updated = await base44.entities.BetaFeedback.get(id);
      setItems((s) => s.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    } catch (e) {}
  };

  const move = async (item, colKey) => {
    const status = statusForColumn(colKey);
    const entry = { status, by_name: user?.full_name || 'Admin', at: new Date().toISOString(), note: `Moved to ${colKey}` };
    const history = (() => { try { return JSON.parse(item.status_history_json || '[]'); } catch { return []; } })();
    const extra = {};
    if (status === 'Released') { extra.released_at = new Date().toISOString(); extra.acknowledged = true; }
    if (status === 'Resolved') { extra.resolved_at = new Date().toISOString(); }
    const next = { ...item, status, status_history_json: JSON.stringify([...history, entry]), ...extra };
    setItems((s) => s.map((i) => (i.id === item.id ? next : i)));
    try {
      await base44.entities.BetaFeedback.update(item.id, { status, status_history_json: JSON.stringify([...history, entry]), ...extra });
    } catch (e) {
      toast({ title: 'Move failed', description: e.message, variant: 'destructive' });
      load();
    }
  };

  const onSubmitted = (created) => {
    setShowSubmit(false);
    load();
    if (created?.id) setDetailId(created.id);
  };

  const filtered = items.filter((i) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (i.title || '').toLowerCase().includes(q) || (i.feedback_id || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q);
  });

  const openDetail = (item) => setDrawer(item);
  useEffect(() => {
    if (!detailId) return;
    const it = items.find((i) => i.id === detailId);
    if (it) { setDrawer(it); setDetailId(null); }
  }, [detailId, items]);

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-white/40"><Loader2 size={22} className="animate-spin" /></div>;
  }

  // Non-admin members can only submit feedback (the Command Center is admin-only).
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center mb-6">
          <ShieldAlert size={22} className="text-amber-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-white mb-1">Beta Feedback Intelligence™</h1>
          <p className="text-sm text-white/55">The Command Center is admin-only. You can still submit product feedback — it becomes structured evidence for the product team.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <SubmitFeedbackForm onSubmitted={onSubmitted} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[11px] text-white/60 font-medium mb-2"><MessageSquareWarning size={12} className="text-accent-orange" /> Product Intelligence System</div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Beta Feedback Center™</h1>
          <p className="text-sm text-white/45 mt-1 max-w-2xl">Every opinion becomes structured evidence. Every suggestion becomes measurable. Every release becomes traceable.</p>
        </div>
        <button onClick={() => setShowSubmit(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors"><Plus size={16} /> New Feedback</button>
      </div>

      {/* tabs + search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10">
          <TabBtn id="overview" icon={LayoutDashboard} label="Overview" tab={tab} setTab={setTab} />
          <TabBtn id="board" icon={Columns3} label="Board" tab={tab} setTab={setTab} />
          <TabBtn id="list" icon={List} label="List" tab={tab} setTab={setTab} />
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search feedback…" className="form-input pl-9 w-64" />
        </div>
      </div>

      {tab === 'overview' && <FeedbackOverview items={filtered} />}
      {tab === 'board' && <FeedbackKanban items={filtered} onMove={move} onOpen={openDetail} />}
      {tab === 'list' && <FeedbackList items={filtered} onOpen={openDetail} />}

      {/* submit modal */}
      {showSubmit && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSubmit(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0f] animate-fade-in max-h-[90vh] overflow-y-auto">
            <SubmitFeedbackForm onClose={() => setShowSubmit(false)} onSubmitted={onSubmitted} />
          </div>
        </div>
      )}

      {/* detail drawer */}
      {drawer && (
        <FeedbackDetailDrawer
          feedback={drawer}
          onClose={() => { setDrawer(null); refreshOne(drawer.id); }}
          onChanged={() => load()}
        />
      )}
    </div>
  );
}

function TabBtn({ id, icon: Icon, label, tab, setTab }) {
  const active = tab === id;
  return (
    <button onClick={() => setTab(id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${active ? 'bg-accent-orange/15 text-accent-orange' : 'text-white/50 hover:text-white/80'}`}>
      <Icon size={13} /> {label}
    </button>
  );
}

function FeedbackList({ items, onOpen }) {
  if (items.length === 0) return <p className="text-sm text-white/40 text-center py-16">No feedback matches.</p>;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/8 overflow-hidden">
      {items.map((i) => (
        <button key={i.id} onClick={() => onOpen(i)} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
          <span className="text-[10px] font-mono text-accent-orange w-20 shrink-0">{i.feedback_id}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-white font-medium truncate">{i.title}</div>
            <div className="text-[10px] text-white/40 truncate">{i.category} · {i.user_name || 'Member'} · {i.submitted_at ? new Date(i.submitted_at).toLocaleDateString() : ''}</div>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${severityColor[i.severity] || severityColor.Low}`}>{i.severity}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${statusColor[i.status] || statusColor.New}`}>{i.status}</span>
          {!!i.vote_count && <span className="text-[10px] text-amber-400 w-8 text-right">+{i.vote_count}</span>}
        </button>
      ))}
    </div>
  );
}