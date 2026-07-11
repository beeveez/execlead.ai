import React from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2 } from "lucide-react";
import { EELM_ENTERPRISE_APPLICATIONS } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyEnterprise() {
  return (
    <section id="enterprise" className="max-w-5xl mx-auto px-4 py-12">
      <SectionHeader number="07" title="Enterprise Application" subtitle="Organizations use EELM™ to build and measure leadership capability at scale" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {EELM_ENTERPRISE_APPLICATIONS.map((app, i) => (
          <motion.div
            key={app}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]"
          >
            <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
            <span className="text-white/70 text-sm">{app}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
        <Building2 size={14} className="text-cyan-400 flex-shrink-0" />
        <p className="text-cyan-300/70 text-xs">Enterprise Intelligence Dashboard™ provides organization-wide visibility into leadership distribution, readiness, and risk.</p>
      </div>
    </section>
  );
}