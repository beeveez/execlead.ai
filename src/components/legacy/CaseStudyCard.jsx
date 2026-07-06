import React from "react";
import ReactMarkdown from "react-markdown";
import { Pencil, Trash2, Building2, Briefcase, Cpu, AlertTriangle } from "lucide-react";

const RISK_STYLES = {
  low: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

export default function CaseStudyCard({ study, onEdit, onDelete }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {study.year && <span className="text-indigo-400/60 text-xs font-mono mr-2">{study.year}</span>}
          <h3 className="text-white font-semibold text-sm inline">{study.title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(study)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => onDelete(study)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>

      {study.leadership && <p className="text-white/40 text-xs mb-3"><span className="text-white/20">Leadership:</span> {study.leadership}</p>}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {study.industry && <Tag icon={Building2} value={study.industry} />}
        {study.role && <Tag icon={Briefcase} value={study.role} />}
        {study.technology && <Tag icon={Cpu} value={study.technology} />}
        {study.company_size && <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40">{study.company_size}</span>}
        {study.risk && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${RISK_STYLES[study.risk]}`}>
            <AlertTriangle size={10} /> {study.risk}
          </span>
        )}
      </div>

      {study.decision && <Field label="Decision" value={study.decision} />}
      {study.outcome && <Field label="Outcome" value={study.outcome} />}
      {study.result && <Field label="Result" value={study.result} />}
      {study.lessons && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <span className="text-white/20 text-xs uppercase tracking-wider">Lessons</span>
          <div className="prose prose-sm prose-invert max-w-none text-white/50 text-xs mt-1"><ReactMarkdown>{study.lessons}</ReactMarkdown></div>
        </div>
      )}
    </div>
  );
}

function Tag({ icon: Icon, value }) {
  return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40"><Icon size={10} /> {value}</span>;
}

function Field({ label, value }) {
  return <p className="text-white/50 text-xs mb-1"><span className="text-white/20">{label}:</span> {value}</p>;
}