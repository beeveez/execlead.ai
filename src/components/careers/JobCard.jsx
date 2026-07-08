import React from "react";
import { Bookmark, Building2, MapPin, DollarSign, Briefcase } from "lucide-react";
import MatchScoreRing from "@/components/careers/MatchScoreRing";
import SourceBadge from "@/components/careers/SourceBadge";
import { EXEC_LEVELS, WORK_MODELS, formatTimeAgo } from "@/lib/careerMarketplace";

export default function JobCard({ job, heuristicScore, isSaved, isApplied, onSave, onClick }) {
  const companyInitial = (job.company || "?")[0]?.toUpperCase();

  return (
    <div
      onClick={onClick}
      className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/15 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Company Logo */}
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/40 text-sm font-bold">{companyInitial}</span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                <Building2 size={10} />
                <span className="truncate">{job.company}</span>
              </div>
            </div>
            {heuristicScore !== null && (
              <MatchScoreRing score={heuristicScore} size={42} />
            )}
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {job.executive_level && (
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-300 font-medium">
                {EXEC_LEVELS[job.executive_level] || job.executive_level}
              </span>
            )}
            {job.work_model && (
              <span className="text-[10px] text-white/30">{WORK_MODELS[job.work_model] || job.work_model}</span>
            )}
            {job.location && (
              <span className="flex items-center gap-0.5 text-[10px] text-white/30">
                <MapPin size={9} /> {job.location}
              </span>
            )}
            {job.salary_display && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400/70">
                <DollarSign size={9} /> {job.salary_display}
              </span>
            )}
          </div>

          {/* Source + Save */}
          <div className="flex items-center justify-between mt-2.5">
            <SourceBadge sourceType={job.source_type} sourceName={job.source_name} />
            <div className="flex items-center gap-1.5">
              {isApplied && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-medium">
                  Applied
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(job);
                }}
                className={`p-1 rounded transition-colors ${isSaved ? "text-amber-400" : "text-white/20 hover:text-white/50"}`}
              >
                <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}