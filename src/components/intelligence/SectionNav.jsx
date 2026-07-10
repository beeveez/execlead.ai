import React, { useState, useEffect } from "react";

const SECTIONS = [
  { id: "header", label: "Profile" },
  { id: "readiness", label: "Readiness" },
  { id: "potential", label: "Potential" },
  { id: "archetype", label: "Archetype" },
  { id: "competency", label: "Competency" },
  { id: "career", label: "Career" },
  { id: "reputation", label: "Reputation" },
  { id: "impact", label: "Impact" },
  { id: "insights", label: "Insights" },
  { id: "growth", label: "Growth" },
  { id: "timeline", label: "Timeline" },
  { id: "achievements", label: "Achievements" },
  { id: "benchmarking", label: "Benchmarks" },
  { id: "history", label: "History" },
  { id: "export", label: "Export" },
];

/**
 * SectionNav — sticky sub-navigation for the Executive Intelligence Profile.
 * Allows quick jumping between sections via smooth scroll.
 */
export default function SectionNav() {
  const [active, setActive] = useState("header");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-2 z-30 bg-[#0d0d14]/95 backdrop-blur-xl border border-white/5 rounded-xl p-1.5 mb-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              active === s.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}