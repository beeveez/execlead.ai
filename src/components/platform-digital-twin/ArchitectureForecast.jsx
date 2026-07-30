import React, { useMemo } from 'react';
import { LineChart } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

export default function ArchitectureForecast() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  return (
    <SectionShell title="Architecture Forecast™" subtitle="Predicted platform evolution across 6 / 12 / 24 / 36 months" icon={LineChart}>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {twin.forecast.map((f) => (
          <div key={f.horizon} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between"><Badge color="indigo">{f.horizon}</Badge><Badge color="emerald">Growth {f.growth}</Badge></div>
            <StatCard label="Maintenance Cost" value={`$${(f.maintenanceCost).toLocaleString()}`} color="#f59e0b" />
            <StatCard label="Revenue Potential" value={`$${(f.revenuePotential).toLocaleString()}`} color="#10b981" />
            <StatCard label="Enterprise Adoption" value={`${f.enterpriseAdoption}%`} color="#6366f1" />
            <StatCard label="AI Expansion" value={`${f.aiExpansion} engines`} color="#ec4899" />
            <StatCard label="Technical Debt" value={f.technicalDebt} color="#f43f5e" />
            <StatCard label="Required Refactoring" value={`${f.requiredRefactoring} modules`} color="#8b5cf6" />
            <StatCard label="Documentation Needs" value={`${f.documentationNeeds} pages`} color="#06b6d4" />
            <StatCard label="Complexity" value={f.complexity} color="#14b8a6" />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}