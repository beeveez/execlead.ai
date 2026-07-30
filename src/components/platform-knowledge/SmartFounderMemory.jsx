import React from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { getSmartFounderMemory } from '@/lib/platformIntelligenceEngine/index';
import { Brain, TrendingUp, AlertTriangle, Sparkles, Zap, Clock, Award, GitMerge, FileX, Ghost, Cpu, Star, Heart, Route } from 'lucide-react';

function Widget({ title, icon: Icon, color, items, render }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <h3 className="text-xs font-semibold text-white">{title}</h3>
        <span className="text-[10px] text-white/30 ml-auto">{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.length === 0 ? <div className="text-[11px] text-white/30">None.</div> : items.map((it, i) => render(it, i))}
      </div>
    </div>
  );
}

function moduleRow(m, i, suffix) {
  return (
    <div key={i} className="flex items-center justify-between text-[11px]">
      <span className="text-white/70 truncate">{m.name || m}</span>
      {suffix ? <span className="text-white/30 text-[10px]">{suffix}</span> : null}
    </div>
  );
}

export default function SmartFounderMemory() {
  const fm = getSmartFounderMemory();
  return (
    <SectionShell title="Smart Founder Memory™" subtitle="Your AI strategic advisor — 17 widgets that surface what matters about the platform" icon={Brain}
      actions={<Badge color="#f59e0b">Platform Health {fm.healthSummary.platformHealth.current}/100</Badge>}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Widget title="Features You Forgot About" icon={Clock} color="#0ea5e9" items={fm.featuresYouForgotAbout}
          render={(m, i) => moduleRow(m, i, m.estimatedBuildDate)} />
        <Widget title="Similar Features Already Exist" icon={GitMerge} color="#ef4444" items={fm.similarFeaturesAlreadyExist}
          render={(d, i) => <div key={i} className="text-[11px]"><span className="text-white/70">{d.a.name} ↔ {d.b.name}</span> <span className="text-amber-400">{d.similarity}%</span></div>} />
        <Widget title="Modules Built But Rarely Used" icon={Ghost} color="#64748b" items={fm.modulesBuiltButRarelyUsed}
          render={(m, i) => moduleRow(m, i)} />
        <Widget title="Modules Missing Documentation" icon={FileX} color="#f59e0b" items={fm.modulesMissingDocumentation}
          render={(m, i) => moduleRow(m, i, m.category)} />
        <Widget title="Modules Missing AI" icon={Cpu} color="#8b5cf6" items={fm.modulesMissingAI}
          render={(m, i) => moduleRow(m, i, m.category)} />
        <Widget title="Routes Never Visited" icon={Route} color="#f97316" items={fm.routesNeverVisited}
          render={(r, i) => <div key={i} className="text-[11px] text-white/70">{r.name} <span className="text-white/30">{r.path}</span></div>} />
        <Widget title="Largest Components" icon={Sparkles} color="#ec4899" items={fm.largestComponents}
          render={(m, i) => moduleRow(m, i, `complexity ${m.complexity}`)} />
        <Widget title="Most Valuable Modules" icon={Star} color="#10b981" items={fm.mostValuableModules}
          render={(m, i) => moduleRow(m, i, `maturity ${m.maturity}`)} />
        <Widget title="Highest Risk Modules" icon={AlertTriangle} color="#ef4444" items={fm.highestRiskModules}
          render={(m, i) => moduleRow(m, i, `${m.complexity}/10 · ${m.maturity}`)} />
        <Widget title="Technical Debt Hotspots" icon={AlertTriangle} color="#f59e0b" items={fm.technicalDebtHotspots}
          render={(d, i) => <div key={i} className="text-[11px] text-white/70">{d.title}</div>} />
        <Widget title="Architecture Wins" icon={Award} color="#10b981" items={fm.architectureWins}
          render={(m, i) => moduleRow(m, i, `${m.maturity} / ${m.trustScore}`)} />
        <Widget title="Architecture Smells" icon={AlertTriangle} color="#ef4444" items={fm.architectureSmells}
          render={(m, i) => moduleRow(m, i, !m.documentation ? 'undocumented' : `complex ${m.complexity}`)} />
        <Widget title="AI Improvement Opportunities" icon={Cpu} color="#8b5cf6" items={fm.aiImprovementOpportunities}
          render={(m, i) => moduleRow(m, i, m.category)} />
        <Widget title="Suggested Next Priorities" icon={TrendingUp} color="#6366f1" items={fm.suggestedNextPriorities}
          render={(t, i) => <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/70"><span className="text-indigo-400">{i + 1}.</span><span>{t}</span></div>} />
        <Widget title="Quick Wins" icon={Zap} color="#f59e0b" items={fm.quickWins}
          render={(d, i) => <div key={i} className="text-[11px] text-white/70">{d.title}</div>} />
        <Widget title="Long-term Investments" icon={Heart} color="#ec4899" items={fm.longTermInvestments}
          render={(d, i) => <div key={i} className="text-[11px] text-white/70">{d.title}</div>} />
        <Widget title="Highest Complexity" icon={Sparkles} color="#ec4899" items={fm.highestComplexity}
          render={(m, i) => moduleRow(m, i, `${m.complexity}/10`)} />
      </div>
    </SectionShell>
  );
}