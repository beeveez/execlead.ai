import React from "react";
import { Building2, TrendingUp } from "lucide-react";
import EnterpriseIntelligence from "@/components/intelligence/EnterpriseIntelligence";

export default function EnterpriseIntelligencePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Building2 size={12} className="text-cyan-400" />
          Enterprise Intelligence Dashboard™
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Intelligence</h1>
        <p className="text-white/40 text-sm mt-1">Actionable leadership intelligence for your organization.</p>
      </div>

      <EnterpriseIntelligence />
    </div>
  );
}