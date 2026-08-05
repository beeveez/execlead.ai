import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Layers } from "lucide-react";
import {
  getCategoryScores, getOverallReadiness, getDependencyReport, getPlatformServicesAdoption, getArchitectureValidation, MIGRATION_PHASES,
} from "@/lib/migrationReadinessEngine";
import MigrationReadinessHero from "@/components/migration-readiness/MigrationReadinessHero";
import CategoryScoreGrid from "@/components/migration-readiness/CategoryScoreGrid";
import DependencyAuditTable from "@/components/migration-readiness/DependencyAuditTable";
import PlatformServicesAdoption from "@/components/migration-readiness/PlatformServicesAdoption";
import ArchitectureValidation from "@/components/migration-readiness/ArchitectureValidation";
import ServiceObservability from "@/components/migration-readiness/ServiceObservability";
import { listServices } from "@/lib/platformServices";
import { getObservability } from "@/lib/serviceObservability";

const PHASE_ICON = { complete: CheckCircle2, scaffolded: Layers, partial: Clock, not_started: Circle };
const PHASE_COLOR = {
  complete: "text-emerald-400",
  scaffolded: "text-indigo-400",
  partial: "text-amber-400",
  not_started: "text-white/30",
};

export default function MigrationReadinessDashboard() {
  const overall = useMemo(() => getOverallReadiness(), []);
  const categories = useMemo(() => getCategoryScores(), []);
  const report = useMemo(() => getDependencyReport(), []);
  const adoption = useMemo(() => getPlatformServicesAdoption(), []);
  const services = useMemo(() => listServices(), []);
  const validation = useMemo(() => getArchitectureValidation(), []);
  const [observability, setObservability] = useState(() => getObservability());
  const refreshObservability = () => setObservability(getObservability());
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10 space-y-5">
      <MigrationReadinessHero overall={overall} />

      {/* Category scores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Readiness by Category</h3>
          <span className="text-[11px] text-white/40">Target: 95%+ · click a category to inspect</span>
        </div>
        <CategoryScoreGrid categories={categories} onSelect={setSelected} selected={selected} />

        {selected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mt-3 bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/30">Phase {selected.phase}</div>
                <h4 className="text-sm font-semibold text-white">{selected.label}</h4>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{selected.score}%</div>
                <div className="text-[10px] text-white/40">gap {selected.gap} to {selected.target}%</div>
              </div>
            </div>
            <p className="text-[12px] text-white/55 leading-relaxed">{selected.description}</p>
          </motion.div>
        )}
      </div>

      {/* Platform Services Adoption™ */}
      <PlatformServicesAdoption adoption={adoption} services={services} />

      {/* Architecture Validation */}
      <ArchitectureValidation validation={validation} />

      {/* Service Observability™ */}
      <ServiceObservability observability={observability} consumerCount={adoption.consumers} onRefresh={refreshObservability} />

      {/* Migration phases strip */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Initiative Phases</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {MIGRATION_PHASES.map((p) => {
            const Icon = PHASE_ICON[p.status] || Circle;
            return (
              <div key={p.phase} className="rounded-xl bg-white/[0.02] border border-white/8 p-2.5 text-center">
                <Icon size={16} className={`mx-auto mb-1.5 ${PHASE_COLOR[p.status]}`} />
                <div className="text-[9px] text-white/30 uppercase tracking-wider">Phase {p.phase}</div>
                <div className="text-[10px] text-white/70 leading-tight mt-0.5">{p.name}</div>
                <div className={`text-[9px] mt-1 font-medium ${PHASE_COLOR[p.status]}`}>
                  {p.status === "complete" ? "Complete" : p.status === "scaffolded" ? "Scaffolded" : p.status === "partial" ? "Partial" : "Not Started"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dependency audit */}
      <DependencyAuditTable report={report} />

      {/* Architecture principle */}
      <div className="bg-gradient-to-br from-emerald-500/8 to-transparent border border-emerald-500/15 rounded-2xl p-5">
        <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1.5">Product Philosophy</div>
        <p className="text-sm text-white/70 leading-relaxed">
          Migration readiness is not about leaving Base44 — Base44 remains the production runtime. It is about
          ensuring <span className="text-white font-medium">EXECLEAD.AI owns its architecture</span>: business rules,
          intelligence, and IP sit behind clean boundaries, so the platform can change infrastructure without
          changing its identity, business logic, or user experience. <span className="text-emerald-300">Own the product. Abstract the platform. Preserve optionality.</span>
        </p>
      </div>
    </div>
  );
}