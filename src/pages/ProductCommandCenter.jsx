import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, Boxes, ShieldCheck, Brain, Users, DollarSign, Building2,
  Rocket, Sparkles, Zap, LayoutDashboard, RefreshCw, Lock,
} from 'lucide-react';
import { getCommandCenterData } from '@/lib/productCommandCenterEngine';
import SectionShell from '@/components/command-center/SectionShell';
import ExecutiveScoreboard from '@/components/command-center/ExecutiveScoreboard';
import PlatformStatus from '@/components/command-center/PlatformStatus';
import EngineeringPipeline from '@/components/command-center/EngineeringPipeline';
import QualityCenter from '@/components/command-center/QualityCenter';
import AIIntelligence from '@/components/command-center/AIIntelligence';
import CustomerIntelligence from '@/components/command-center/CustomerIntelligence';
import CommercialIntelligence from '@/components/command-center/CommercialIntelligence';
import EnterpriseReadiness from '@/components/command-center/EnterpriseReadiness';
import ReleaseIntegrity from '@/components/command-center/ReleaseIntegrity';
import FounderInsights from '@/components/command-center/FounderInsights';
import QuickActions from '@/components/command-center/QuickActions';

export default function ProductCommandCenter() {
  const data = useMemo(() => getCommandCenterData(), []);
  const overallHealth = data.scoreboard.find((s) => s.id === 'platform_health');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/5 px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={20} className="text-amber-400" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Product Command Center™</h1>
            <p className="text-white/30 text-xs">Operate the entire EXECLEAD.AI platform from one intelligence workspace.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-white/30 text-xs">
            <RefreshCw size={11} />
            Synced {new Date(data.syncedAt).toLocaleTimeString()}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 font-medium transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent border border-amber-500/15 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck size={28} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Overall Platform Health</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-400">{overallHealth.value}{overallHealth.unit}</span>
                <span className="text-white/30 text-sm">/ {overallHealth.target}{overallHealth.unit} target</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Lock size={12} className="text-blue-400" />
              <span className="text-blue-400 text-xs font-medium">Architecture Frozen</span>
            </div>
            <Link to="/rc2-confidence" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/15 transition-colors">
              <span className="text-emerald-400 text-xs font-medium">RC2 Ready</span>
            </Link>
          </div>
        </motion.div>

        {/* Executive Scoreboard */}
        <SectionShell icon={Activity} title="Top Executive Scoreboard" subtitle="8 platform KPIs with trend, target & confidence">
          <ExecutiveScoreboard metrics={data.scoreboard} />
        </SectionShell>

        {/* Platform Status */}
        <SectionShell
          icon={ShieldCheck}
          title="Platform Status"
          subtitle={`${data.platformStatusSummary.healthy}/${data.platformStatusSummary.total} subsystems healthy`}
        >
          <PlatformStatus subsystems={data.platformStatus} summary={data.platformStatusSummary} />
        </SectionShell>

        {/* Engineering Pipeline */}
        <SectionShell icon={Boxes} title="Engineering Pipeline" subtitle="Kanban — Backlog to Released">
          <EngineeringPipeline columns={data.pipeline.columns} items={data.pipeline.items} />
        </SectionShell>

        {/* Quality Center */}
        <SectionShell icon={ShieldCheck} title="Quality Center" subtitle="Bug counts, regression risk & release blockers">
          <QualityCenter summary={data.quality.summary} />
        </SectionShell>

        {/* AI Intelligence */}
        <SectionShell icon={Brain} title="AI Intelligence" subtitle="Confidence, accuracy, hallucination & cost metrics">
          <AIIntelligence metrics={data.ai} />
        </SectionShell>

        {/* Customer Intelligence */}
        <SectionShell icon={Users} title="Customer Intelligence" subtitle="Members, retention, NPS & top feature requests">
          <CustomerIntelligence data={data.customer} />
        </SectionShell>

        {/* Commercial Intelligence */}
        <SectionShell icon={DollarSign} title="Commercial Intelligence" subtitle="MRR, ARR, funnel & growth trend">
          <CommercialIntelligence data={data.commercial} />
        </SectionShell>

        {/* Enterprise Readiness */}
        <SectionShell icon={Building2} title="Enterprise Readiness" subtitle="Compliance, identity & security posture">
          <EnterpriseReadiness items={data.enterprise} />
        </SectionShell>

        {/* Release Integrity */}
        <SectionShell icon={Rocket} title="Release Integrity" subtitle={`${data.release.currentRelease} · Build ${data.release.buildNumber}`}>
          <ReleaseIntegrity data={data.release} />
        </SectionShell>

        {/* Founder Insights */}
        <SectionShell icon={Sparkles} title="Founder Insights" subtitle="AI-generated executive briefing">
          <FounderInsights data={data.founderInsights} />
        </SectionShell>

        {/* Quick Actions */}
        <SectionShell icon={Zap} title="Quick Actions" subtitle="One-click access to operational tools">
          <QuickActions actions={data.quickActions} />
        </SectionShell>

        <p className="text-center text-white/20 text-xs pt-4">
          Product Command Center™ v{data.version} · Mission Control for EXECLEAD.AI · One Leadership Journey. One AI Platform.
        </p>
      </div>
    </div>
  );
}