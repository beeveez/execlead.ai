import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { enrichCompany, isEnriched } from "@/lib/companyEnrichment";

export default function CompanyEnrichButton({ company, onEnriched }) {
  const [loading, setLoading] = useState(false);
  const enriched = isEnriched(company);

  const handleEnrich = async () => {
    setLoading(true);
    try {
      const enrichedData = await enrichCompany(company);
      const today = new Date().toISOString().split("T")[0];
      await base44.entities.Company.update(company.id, {
        ...enrichedData,
        last_updated: today,
        version_number: (company.version_number || 1) + 1,
        quality_score: 90,
      });
      toast({ title: "Company Enriched", description: `${company.name} now has full executive intelligence.` });
      onEnriched?.();
    } catch (e) {
      toast({ title: "Enrichment Failed", description: "Could not enrich company data.", variant: "destructive" });
    }
    setLoading(false);
  };

  if (enriched) {
    return (
      <button
        onClick={handleEnrich}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        {loading ? "Refreshing..." : "Refresh Intelligence"}
      </button>
    );
  }

  return (
    <button
      onClick={handleEnrich}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-violet-500 hover:bg-violet-600 text-white transition-colors disabled:opacity-40"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {loading ? "Enriching with AI..." : "Enrich with AI"}
    </button>
  );
}