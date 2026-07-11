import React from "react";
import { Link } from "react-router-dom";
import { Brain, TrendingUp, Target, Crown, Sparkles, ArrowRight, Zap, Shield } from "lucide-react";

export default function IntelligenceSummary({ intel, profile }) {
  const { overallScore, overallProficiency, strongestDomain, growthDomain, archetype, overallConfidence } = intel;

  const maturityScore = profile?.leadership_maturity || 0;
  const readinessScore = profile?.promotion_readiness || profile?.interview_readiness || 0;

  const aiSummary = strongestDomain && growthDomain
    ? `Your strongest leadership domain is ${strongestDomain.label} (${strongestDomain.score}/100). Your primary growth opportunity lies in ${growthDomain.label} (${growthDomain.score}/100). Focus on developing ${growthDomain.label.toLowerCase()} competencies to accelerate your executive readiness.`
    : "Complete assessments to generate your personalized executive intelligence summary.";

  return (
    <section id="section-summary" className="scroll-mt-20 space-y-4">
      <SectionHeader icon={Brain} label="Executive Intelligence Summary" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <ScoreCard label="Overall Intelligence" value={overallScore} suffix="/100" icon={Brain} color="indigo"
          sub={overallProficiency?.label || "Not Assessed"} subColor={overallProficiency?.color} />
        <ScoreCard label="Executive Maturity" value={maturityScore} suffix="%" icon={Crown} color="purple" />
        <ScoreCard label="Executive Readiness" value={readinessScore} suffix="%" icon={Target} color="emerald" />
        <ScoreCard label="AI Confidence" value={overallConfidence} suffix="%" icon={Shield} color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strongestDomain && (
          <DomainCard title="Strongest Domain" domain={strongestDomain} icon={TrendingUp} accent="emerald" />
        )}
        {growthDomain && (
          <DomainCard title="Growth Opportunity" domain={growthDomain} icon={Zap} accent="amber" />
        )}
      </div>

      {archetype && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-xl p-5">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Executive Archetype
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{archetype.label}</h3>
          <p className="text-white/50 text-sm">{archetype.desc}</p>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
          <Brain size={14} /> AI Summary
        </div>
        <p className="text-white/70 text-sm leading-relaxed">{aiSummary}</p>
        <Link to="/journey" className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-3 hover:gap-2 transition-all">
          View Full Intelligence Profile <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-indigo-400" />
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">{label}</h2>
    </div>
  );
}

function ScoreCard({ label, value, suffix, icon: Icon, color, sub, subColor }) {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  };
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold text-white">{value}<span className="text-sm text-white/30">{suffix}</span></div>
      <div className="text-white/30 text-xs">{label}</div>
      {sub && <div className="text-xs mt-1 font-medium" style={{ color: subColor || undefined }}>{sub}</div>}
    </div>
  );
}

function DomainCard({ title, domain, icon: Icon, accent }) {
  const accents = {
    emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/15",
    amber: "text-amber-400 bg-amber-500/5 border-amber-500/15",
  };
  return (
    <div className={`rounded-xl border p-5 ${accents[accent]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} />
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full" style={{ background: domain.color }} />
        <span className="text-lg font-bold text-white">{domain.label}</span>
        <span className="ml-auto text-3xl font-bold text-white">{domain.score}</span>
      </div>
      <p className="text-white/40 text-xs mt-2">{domain.description}</p>
      <div className="text-white/30 text-xs mt-1">{domain.proficiencyLabel} · {domain.competencyCount} competencies</div>
    </div>
  );
}