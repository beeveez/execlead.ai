import React, { useState } from "react";
import { X, MapPin, DollarSign, Briefcase, Building2, Calendar, ExternalLink, Bookmark, BookmarkCheck, CheckCircle2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import SourceBadge from "@/components/careers/SourceBadge";
import MatchAnalysis from "@/components/careers/MatchAnalysis";
import AIApplicationTools from "@/components/careers/AIApplicationTools";
import { EXEC_LEVELS, WORK_MODELS, EMPLOYMENT_TYPES, APP_STATUSES, APP_STATUS_FLOW, formatTimeAgo, formatSyncTime } from "@/lib/careerMarketplace";

export default function JobDetailDrawer({ job, heuristicScore, isSaved, isApplied, application, onClose, onSave, onApply, onApplicationUpdate }) {
  const [showAITools, setShowAITools] = useState(false);

  if (!job) return null;

  const companyInitial = (job.company || "?")[0]?.toUpperCase();
  const statusMeta = application?.status ? APP_STATUSES[application.status] : null;
  const existingContent = application ? {
    cover_letter: application.cover_letter,
    resume_optimization: application.resume_optimization,
    interview_prep: application.interview_prep,
  } : {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-3 flex items-center justify-between">
          <SourceBadge sourceType={job.source_type} sourceName={job.source_name} lastSynced={job.last_synced} showSyncTime />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Job Header */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/40 text-lg font-bold">{companyInitial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-bold text-lg leading-tight">{job.title}</h2>
              <div className="flex items-center gap-1.5 text-sm text-white/50 mt-0.5">
                <Building2 size={12} /> {job.company}
              </div>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-2">
            {job.executive_level && <MetaItem icon={Briefcase} label="Level" value={EXEC_LEVELS[job.executive_level] || job.executive_level} />}
            {job.work_model && <MetaItem icon={MapPin} label="Work Model" value={WORK_MODELS[job.work_model] || job.work_model} />}
            {job.employment_type && <MetaItem icon={Briefcase} label="Employment" value={EMPLOYMENT_TYPES[job.employment_type] || job.employment_type} />}
            {job.location && <MetaItem icon={MapPin} label="Location" value={job.location} />}
            {job.salary_display && <MetaItem icon={DollarSign} label="Salary" value={job.salary_display} accent />}
            {job.department && <MetaItem icon={Building2} label="Department" value={job.department} />}
            {job.industry && <MetaItem icon={Briefcase} label="Industry" value={job.industry} />}
            {job.posted_date && <MetaItem icon={Calendar} label="Posted" value={formatTimeAgo(job.posted_date)} />}
          </div>

          {/* AI Match Analysis */}
          <Section title="AI Executive Match Analysis" icon="🎯">
            <MatchAnalysis jobId={job.id} heuristicScore={heuristicScore} onMatchCalculated={(m) => onApplicationUpdate?.(null, "match", m.match_score)} />
          </Section>

          {/* Job Description */}
          {job.description && (
            <Section title="Job Description" icon="📄">
              <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </Section>
          )}

          {/* Required Skills */}
          {job.required_skills?.length > 0 && (
            <Section title="Required Skills" icon="⚡">
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/5">{skill}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <Section title="Requirements" icon="✓">
              <ul className="space-y-1">
                {job.requirements.map((req, i) => (
                  <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                    <span className="text-indigo-400 mt-0.5">•</span>{req}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* AI Application Tools */}
          <Section title="AI Application Tools" icon="🤖">
            {!showAITools ? (
              <button onClick={() => setShowAITools(true)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                <FileText size={12} /> Generate Cover Letter, Resume Optimization & Interview Prep
              </button>
            ) : (
              <AIApplicationTools jobId={job.id} existingContent={existingContent} onApplicationUpdate={onApplicationUpdate} />
            )}
          </Section>

          {/* Application Status */}
          {application && statusMeta && (
            <Section title="Application Status" icon="📋">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${statusMeta.color}15`, color: statusMeta.color }}>
                  {statusMeta.label}
                </span>
                {application.applied_at && <span className="text-[10px] text-white/30">applied {formatTimeAgo(application.applied_at)}</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {APP_STATUS_FLOW.map((s) => {
                  const meta = APP_STATUSES[s];
                  const isCurrent = application.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => onApplicationUpdate?.(application.id, "status", s)}
                      className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors ${isCurrent ? "" : "opacity-40 hover:opacity-70"}`}
                      style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 bg-[#0d0d14]/95 backdrop-blur border-t border-white/5 px-5 py-3 flex items-center gap-2">
          <button
            onClick={() => onSave(job)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isSaved ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
          >
            {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {isSaved ? "Saved" : "Save"}
          </button>
          {job.apply_url && (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onApply(job, "external")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors"
            >
              <ExternalLink size={13} /> Apply on Site
            </a>
          )}
          <button
            onClick={() => onApply(job, "easy_apply")}
            disabled={isApplied}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 ${isApplied ? "bg-emerald-500/10 text-emerald-400 cursor-default" : "bg-indigo-500 hover:bg-indigo-600 text-white"}`}
          >
            {isApplied ? <><CheckCircle2 size={13} /> Applied</> : "Easy Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[9px] text-white/30 uppercase tracking-wide mb-0.5">
        <Icon size={9} /> {label}
      </div>
      <div className={`text-xs font-medium ${accent ? "text-emerald-400/80" : "text-white/70"}`}>{value}</div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mb-2">
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}