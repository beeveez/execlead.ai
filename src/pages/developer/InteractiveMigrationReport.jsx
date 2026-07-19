import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, CheckCircle2, XCircle, ArrowRight, AlertTriangle,
  AlertCircle, Info, Package, FileCode, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  INTERACTIVE_COMPONENTS, LEGACY_PATTERNS, MIGRATION_TARGETS, getMigrationStats
} from '@/lib/interactiveComponentMigration';
import InteractiveCard from '@/components/shared/InteractiveCard';

const STATUS_CONFIG = {
  migrated: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Migrated' },
  in_progress: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'In Progress' },
  pending: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Pending' },
};

export default function InteractiveMigrationReport() {
  const stats = useMemo(() => getMigrationStats(), []);
  const completionColor = stats.completionRate >= 90 ? 'text-emerald-400' : stats.completionRate >= 50 ? 'text-amber-400' : 'text-red-400';
  const completionBg = stats.completionRate >= 90 ? 'from-emerald-500/20 to-emerald-500/5' : stats.completionRate >= 50 ? 'from-amber-500/20 to-amber-500/5' : 'from-red-500/20 to-red-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-amber-400" />
              <h1 className="text-2xl font-bold">Interactive Component Migration Report™</h1>
            </div>
            <p className="text-white/40 text-sm">
              Platform-wide migration from legacy components to shared Interactive* components
            </p>
          </div>
          <Link to="/developer/ux-audit" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 font-medium transition-colors">
            UX Audit Report <ArrowRight size={14} />
          </Link>
        </div>

        {/* Completion Hero */}
        <div className={`bg-gradient-to-br ${completionBg} border border-white/10 rounded-2xl p-6 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Migration Completion</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${completionColor}`}>{stats.completionRate}%</span>
                <span className="text-white/30 text-lg">{stats.migratedComponents} / {stats.totalComponents} components</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.fullyMigrated}</p>
                <p className="text-white/30 text-xs">Pages Migrated</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.inProgress}</p>
                <p className="text-white/30 text-xs">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.pending}</p>
                <p className="text-white/30 text-xs">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Interactive Components */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Package size={16} className="text-amber-400" />
            Shared Interactive Components ({stats.availableInteractiveComponents})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {INTERACTIVE_COMPONENTS.map((comp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <InteractiveCard to="/developer/ux-audit" className="bg-white/[0.02] border border-white/5 p-4 hover:border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{comp.name}</span>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed mb-2">{comp.purpose}</p>
                  <div className="flex flex-wrap gap-1">
                    {comp.replaces.map((r, j) => (
                      <span key={j} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-white/30 font-mono">{r}</span>
                    ))}
                  </div>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legacy Pattern Enforcement */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-400" />
            Legacy Pattern Enforcement ({stats.enforcedPatterns} rules active in ESLint)
          </h2>
          <div className="space-y-2">
            {LEGACY_PATTERNS.map((p, i) => {
              const sev = p.severity === 'error' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${sev}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{p.severity}</span>
                  <code className="text-white/50 font-mono text-xs flex-shrink-0">{p.pattern}</code>
                  <ArrowRight size={12} className="text-white/30 flex-shrink-0" />
                  <code className="text-emerald-400 font-mono text-xs flex-shrink-0">{p.replacement}</code>
                  <span className="ml-auto text-[10px] text-white/30 uppercase tracking-wider">{p.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Migration Targets */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <FileCode size={16} className="text-indigo-400" />
            Page Migration Status
          </h2>
          <div className="space-y-2">
            {MIGRATION_TARGETS.map((target, i) => {
              const cfg = STATUS_CONFIG[target.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <InteractiveCard to={target.route} className={`bg-white/[0.02] border ${cfg.border} p-4`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm">{target.page}</p>
                          <p className="text-white/30 text-xs">{target.workspace}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${cfg.color}`}>{target.migratedCount}/{target.totalCount}</p>
                          <p className="text-white/20 text-[10px]">components</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <ArrowRight size={14} className="text-white/20" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {target.components.map((c, j) => (
                        <span key={j} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/40">{c}</span>
                      ))}
                    </div>
                  </InteractiveCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          Interactive Component Migration Report™ · Enforcement via ESLint `no-restricted-syntax` rules
        </p>
      </div>
    </div>
  );
}