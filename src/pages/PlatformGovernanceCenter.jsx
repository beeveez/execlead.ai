import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Search, CheckCircle2, Lock, ArrowLeft,
  ScrollText, BookCheck, FileWarning,
} from 'lucide-react';
import {
  validateRegistry, RBAC_REGISTRY, RBAC_STANDARD, RBAC_EXCEPTIONS, OP_LABELS,
} from '@/lib/rbacValidationEngine';

const OP_ORDER = ['create', 'read', 'update', 'delete'];

const STATUS_STYLE = {
  founder: { label: 'Founder ✓', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  missing: { label: 'Missing', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
  public: { label: 'Public', cls: 'bg-white/5 text-white/40 border-white/10' },
  immutable: { label: 'Immutable', cls: 'bg-white/5 text-white/40 border-white/10' },
  other: { label: 'Scoped', cls: 'bg-white/5 text-white/40 border-white/10' },
  none: { label: '—', cls: 'bg-transparent text-white/20 border-transparent' },
};

function StatCard({ icon: Icon, label, value, sub, tone }) {
  const toneCls = tone === 'green' ? 'text-emerald-400' : tone === 'red' ? 'text-rose-400' : 'text-white';
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
        <Icon size={15} className={toneCls} />
      </div>
      <div className={`text-2xl font-bold ${toneCls}`}>{value}</div>
      {sub && <div className="text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

export default function PlatformGovernanceCenter() {
  const [q, setQ] = useState('');
  const report = useMemo(() => validateRegistry(), []);
  const rows = useMemo(() => {
    const list = RBAC_REGISTRY.filter((e) =>
      !q || e.name.toLowerCase().includes(q.toLowerCase())
    );
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <span className="text-[10px] text-white/30">Audit generated: {new Date(report.generatedAt).toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <ShieldCheck size={22} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Platform Governance Center™</h1>
          <p className="text-sm text-white/50">RBAC Consistency Report™ — Founder Root Admin Permission Standard™</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={BookCheck} label="Restricted Entities" value={report.restrictedCount} sub={`${report.totalEntities} total entities audited`} />
        <StatCard icon={CheckCircle2} label="Compliant" value={report.compliant} tone="green" sub={`${report.complianceRate}% compliance`} />
        <StatCard icon={ShieldAlert} label="Violations" value={report.brokenCount} tone={report.brokenCount ? 'red' : 'green'} sub={report.brokenCount ? 'Founder Root Admin missing' : 'No omissions detected'} />
        <StatCard icon={FileWarning} label="Documented Exceptions" value={RBAC_EXCEPTIONS.length} sub="Explicit, reviewed exceptions" />
      </div>

      {/* Compliance bar */}
      <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/60 font-medium">RBAC Compliance Rate</span>
          <span className="text-xs text-emerald-400 font-semibold">{report.complianceRate}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-emerald-400 transition-all" style={{ width: `${report.complianceRate}%` }} />
        </div>
      </div>

      {/* Standard */}
      <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ScrollText size={15} className="text-accent-orange" />
          <h2 className="text-sm font-semibold text-white">RBAC Standard</h2>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">{RBAC_STANDARD}</p>
      </div>

      {/* Developer Guardrail */}
      <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={15} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Developer Guardrail™</h2>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          Whenever a new restricted entity is created, verify that <span className="text-indigo-300 font-medium">founder_root_admin</span>, <span className="text-white/80">platform_admin</span>, <span className="text-white/80">super_admin</span>, and <span className="text-white/80">admin</span> are intentionally configured. The <code className="text-indigo-300 text-xs">checkEntityRls(rls)</code> helper flags any privileged <code className="text-xs text-white/70">$or</code> block that omits Founder Root Admin before the inconsistency ships.
        </p>
      </div>

      {/* Exceptions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Security Exceptions</h2>
        </div>
        {RBAC_EXCEPTIONS.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4 text-sm text-white/50">
            No documented exceptions. Every restricted entity grants Founder Root Admin equivalent access to Super Admin / Platform Admin. Silent omissions are not allowed.
          </div>
        ) : (
          <div className="space-y-2">
            {RBAC_EXCEPTIONS.map((ex, i) => (
              <div key={i} className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 text-sm">
                <div className="font-semibold text-amber-400">{ex.entity} · {ex.permission}</div>
                <div className="text-white/60 mt-1">{ex.reason}</div>
                <div className="text-[11px] text-white/40 mt-1">Approver: {ex.approver} · Review date: {ex.reviewDate}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entity registry */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-white">Restricted Entity Registry ({rows.length})</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter entities…" className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40 w-56" />
          </div>
        </div>

        <div className="overflow-x-auto bg-white/[0.02] border border-white/8 rounded-xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8 text-white/40">
                <th className="text-left px-4 py-3 font-medium">Entity</th>
                {OP_ORDER.map((op) => <th key={op} className="text-center px-3 py-3 font-medium">{OP_LABELS[op]}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-white/80 font-medium">{e.name}</td>
                  {OP_ORDER.map((op) => {
                    const s = STATUS_STYLE[e.ops[op]] || STATUS_STYLE.none;
                    return (
                      <td key={op} className="px-3 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium ${s.cls}`}>{s.label}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}