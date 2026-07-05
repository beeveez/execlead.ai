import React from "react";
import { Clock, Briefcase, GraduationCap, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function CareerTimeline({ resumeContent }) {
  const events = [];

  (resumeContent.experience || []).forEach(exp => {
    events.push({ type: "experience", title: exp.job_title, org: exp.employer, date: exp.dates, desc: exp.bullets?.[0], icon: Briefcase, color: "#6366f1" });
  });
  (resumeContent.certifications || []).forEach(c => {
    events.push({ type: "cert", title: c.name, org: c.issuer, date: c.year, icon: Award, color: "#10b981" });
  });
  (resumeContent.education || []).forEach(e => {
    events.push({ type: "education", title: e.degree, org: e.institution, date: e.year, icon: GraduationCap, color: "#a855f7" });
  });
  (resumeContent.awards || []).forEach(a => {
    events.push({ type: "award", title: a.title, org: a.issuer, date: a.year, icon: Star, color: "#f59e0b" });
  });

  events.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2 mb-1"><Clock size={14} className="text-cyan-400" /> Career Timeline</h3>
        <p className="text-white/30 text-xs">Visualizing your career journey, certifications, education, and achievements</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Clock size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No career data yet. Build your resume in the Resume Builder to see your timeline.</p>
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/5" />
          {events.map((event, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative mb-6">
              <div className="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: event.color + "20", border: `2px solid ${event.color}` }}>
                <event.icon size={12} style={{ color: event.color }} />
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 ml-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-white font-medium text-sm">{event.title}</h4>
                    <p className="text-xs mt-0.5" style={{ color: event.color }}>{event.org}</p>
                  </div>
                  {event.date && <span className="text-xs text-white/30 whitespace-nowrap">{event.date}</span>}
                </div>
                {event.desc && <p className="text-white/40 text-xs mt-2 line-clamp-2">{event.desc}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}