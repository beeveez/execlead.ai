import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EELM_SECTIONS, EELM_NAME, EELM_SHORT_NAME } from "@/lib/eelmMethodology";
import MethodologyHero from "@/components/eelm/MethodologyHero";
import MethodologyPrinciples from "@/components/eelm/MethodologyPrinciples";
import MethodologyLoop from "@/components/eelm/MethodologyLoop";
import MethodologyFrameworks from "@/components/eelm/MethodologyFrameworks";
import MethodologyEvidence from "@/components/eelm/MethodologyEvidence";
import MethodologyDecisionModel from "@/components/eelm/MethodologyDecisionModel";
import MethodologyMaturity from "@/components/eelm/MethodologyMaturity";
import MethodologyEnterprise from "@/components/eelm/MethodologyEnterprise";
import MethodologyGovernance from "@/components/eelm/MethodologyGovernance";
import MethodologyFoundation from "@/components/eelm/MethodologyFoundation";

export default function EELMMethodology() {
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    EELM_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white/80 text-xs flex-shrink-0 transition-colors">
            ← Back
          </button>
          <div className="text-xs font-semibold text-white/70 flex-shrink-0 hidden sm:block">{EELM_SHORT_NAME}</div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 justify-end">
              {EELM_SECTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    title={s.label}
                    className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${isActive ? "bg-indigo-500/20 text-indigo-400" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <MethodologyHero />
      <MethodologyPrinciples />
      <MethodologyLoop />
      <MethodologyFrameworks />
      <MethodologyEvidence />
      <MethodologyDecisionModel />
      <MethodologyMaturity />
      <MethodologyEnterprise />
      <MethodologyGovernance />
      <MethodologyFoundation />
    </div>
  );
}