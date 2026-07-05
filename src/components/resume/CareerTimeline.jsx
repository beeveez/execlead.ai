import React from "react";
import { Briefcase, Award, GraduationCap, Folder } from "lucide-react";
import { motion } from "framer-motion";

export default function CareerTimeline({ data }) {
  if (!data) return null;
  const history = data.career_history || [];
  const education = data.education || [];
  const projects = data.major_projects || [];
  const awards = data.awards || [];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Career History</h3>
        <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
          {history.map((role, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
              <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center ${role.current ? "bg-emerald-500/20 ring-2 ring-emerald-500/30" : "bg-white/5"}`}>
                <Briefcase size={12} className={role.current ? "text-emerald-400" : "text-white/40"} />
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="text-white font-medium text-sm">{role.job_title}</h4>
                    <p className="text-indigo-400 text-xs">{role.employer}</p>
                  </div>
                  <span className="text-xs text-white/30 whitespace-nowrap">{role.start_date} — {role.current ? "Present" : role.end_date}</span>
                </div>
                {role.description && <p className="text-white/50 text-sm mt-2">{role.description}</p>}
                {role.key_achievements?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {role.key_achievements.map((a, j) => (
                      <li key={j} className="text-white/40 text-xs flex items-start gap-1.5"><span className="text-emerald-400 mt-0.5">•</span> {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {education.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Education</h3>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <GraduationCap size={16} className="text-amber-400" />
                <div className="flex-1"><p className="text-sm text-white/70">{edu.degree}</p><p className="text-xs text-white/30">{edu.institution}</p></div>
                <span className="text-xs text-white/30">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Major Projects</h3>
          <div className="space-y-2">
            {projects.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <Folder size={16} className="text-cyan-400 mt-0.5" />
                <div><p className="text-sm text-white/70 font-medium">{p.name}</p><p className="text-xs text-white/40 mt-0.5">{p.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {awards.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Awards</h3>
          <div className="flex flex-wrap gap-2">
            {awards.map((a, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs"><Award size={12} /> {a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}