import React from 'react';
import { Brain, AlertTriangle, CheckCircle2, Lightbulb, Target } from 'lucide-react';

export default function ResumeIntelligenceReport({ report }) {
  if (!report) return null;
  const score = report.resume_score || 0;
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-gradient-to-r from-indigo-500/5 to-transparent border border-indigo-500/15 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Resume Intelligence™ Report</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${scoreColor}15`, border: `2px solid ${scoreColor}30` }}>
            <span className="text-xl font-bold" style={{ color: scoreColor }}>{score}</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Resume Score</div>
            <div className="text-[10px] text-white/40">{score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Needs Work'}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ReportItem icon={AlertTriangle} label="Missing Sections" items={report.missing_sections} color="#f59e0b" />
          <ReportItem icon={CheckCircle2} label="Strengths" items={report.leadership_strengths} color="#10b981" />
          <ReportItem icon={Target} label="Career Gaps" items={report.career_gaps} color="#ef4444" />
          <ReportItem icon={Lightbulb} label="Improvements" items={report.suggested_improvements} color="#3b82f6" />
        </div>
      </div>
    </div>
  );
}

function ReportItem({ icon: Icon, label, items, color }) {
  const count = items ? items.length : 0;
  return (
    <div className="bg-white/[0.02] rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] text-white/40">{label}</span>
        <span className="text-[10px] font-bold ml-auto" style={{ color }}>{count}</span>
      </div>
      {count > 0 && <div className="space-y-0.5">{items.slice(0, 2).map((item, i) => <div key={i} className="text-[9px] text-white/40 truncate">{item}</div>)}</div>}
    </div>
  );
}