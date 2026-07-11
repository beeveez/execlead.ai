import React from "react";
import { Award, Zap, TrendingUp, AlertTriangle, BadgeCheck, FileText } from "lucide-react";

export default function CompetencyIntelligence({ intel }) {
  const { verified, emerging, developing, gaps } = intel.competencyIntelligence;

  return (
    <section id="section-competencies" className="scroll-mt-20 space-y-4">
      <div className="flex items-center gap-2">
        <Award size={16} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Competency Intelligence</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CategoryCard title="Verified Competencies" items={verified} icon={BadgeCheck} color="emerald"
          emptyText="Complete assessments to earn verified competencies." />
        <CategoryCard title="Emerging Competencies" items={emerging} icon={Zap} color="cyan"
          emptyText="No emerging competencies. Start with foundational learning." />
        <CategoryCard title="Developing Competencies" items={developing} icon={TrendingUp} color="indigo"
          emptyText="No developing competencies yet." />
        <CategoryCard title="Critical Gaps" items={gaps} icon={AlertTriangle} color="red"
          emptyText="No critical gaps identified. Great coverage!" />
      </div>
    </section>
  );
}

function CategoryCard({ title, items, icon: Icon, color, emptyText }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/15",
    cyan: "text-cyan-400 bg-cyan-500/5 border-cyan-500/15",
    indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/15",
    red: "text-red-400 bg-red-500/5 border-red-500/15",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-lg font-bold text-white">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {items.slice(0, 12).map((c) => (
            <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02]">
              <span className="text-xs text-white/70 flex-1 truncate">{c.competency_name}</span>
              <span className="text-[9px] text-white/30 capitalize">{c.verification_source?.replace(/_/g, " ")}</span>
              <span className="text-xs font-semibold text-white/80 w-8 text-right">{c.competency_score || 0}</span>
            </div>
          ))}
          {items.length > 12 && <div className="text-[10px] text-white/30 text-center pt-1">+{items.length - 12} more</div>}
        </div>
      ) : (
        <p className="text-white/30 text-xs py-3 text-center">{emptyText}</p>
      )}
    </div>
  );
}