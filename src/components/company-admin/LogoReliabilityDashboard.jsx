import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { batchValidateLogos } from "@/lib/companyLogo";
import CompanyLogo from "@/components/companies/CompanyLogo";
import { useToast } from "@/components/ui/use-toast";
import { ImageOff, CheckCircle, AlertTriangle, Loader2, Wrench, ShieldCheck, BarChart3 } from "lucide-react";

export default function LogoReliabilityDashboard({ companies, onUpdated, onRepair }) {
  const [validating, setValidating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [validationSummary, setValidationSummary] = useState(null);
  const { toast } = useToast();

  const stats = useMemo(() => {
    const total = companies.length;
    const valid = companies.filter(c => c.logo_status === "valid").length;
    const invalid = companies.filter(c => c.logo_status === "invalid").length;
    const missing = companies.filter(c => c.logo_status === "missing" || (!c.logo_url && !c.logo_status)).length;
    const pending = companies.filter(c => (!c.logo_status || c.logo_status === "pending") && c.logo_url).length;
    const coverage = total > 0 ? Math.round((valid / total) * 100) : 0;
    const lastValidated = companies
      .filter(c => c.logo_validated_at)
      .map(c => new Date(c.logo_validated_at))
      .sort((a, b) => b - a)[0];
    return { total, valid, invalid, missing, pending, coverage, lastValidated };
  }, [companies]);

  const issues = useMemo(() => companies.filter(c =>
    c.logo_status === "invalid" || c.logo_status === "missing" || (!c.logo_url && !c.logo_status) ||
    (c.logo_url && (!c.logo_status || c.logo_status === "pending"))
  ).slice(0, 20), [companies]);

  const handleValidateAll = async () => {
    if (validating || companies.length === 0) return;
    setValidating(true);
    setProgress({ done: 0, total: companies.length });
    setValidationSummary(null);
    try {
      const results = await batchValidateLogos(companies, (done, total) => setProgress({ done, total }));

      const updates = results.map(r => ({
        id: r.id,
        logo_status: r.logo_status,
        logo_error: r.logo_error,
        logo_validated_at: r.logo_validated_at,
      }));

      // Chunk into batches of 50 for large company libraries
      const CHUNK_SIZE = 50;
      for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        await base44.entities.Company.bulkUpdate(updates.slice(i, i + CHUNK_SIZE));
      }

      const summary = {
        scanned: results.length,
        valid: results.filter(r => r.logo_status === "valid").length,
        invalid: results.filter(r => r.logo_status === "invalid").length,
        missing: results.filter(r => r.logo_status === "missing").length,
        fallbackGenerated: results.filter(r => r.logo_status === "missing" || r.logo_status === "invalid").length,
      };
      setValidationSummary(summary);

      toast({
        title: "Logo Validation Complete",
        description: `${summary.scanned} scanned · ${summary.valid} valid · ${summary.invalid} broken · ${summary.missing} missing · ${summary.fallbackGenerated} fallback logos generated`,
      });

      await onUpdated?.();
    } catch (e) {
      toast({
        title: "Logo Validation Failed",
        description: e?.message || "An unexpected error occurred during validation.",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  const CARDS = [
    { label: "Logo Coverage", value: `${stats.coverage}%`, icon: BarChart3, color: "text-indigo-400" },
    { label: "Valid Logos", value: stats.valid, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Broken Logos", value: stats.invalid, icon: AlertTriangle, color: "text-red-400" },
    { label: "Missing Logos", value: stats.missing, icon: ImageOff, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Logo Reliability</h2>
          {stats.lastValidated && (
            <span className="text-xs text-white/30 ml-2">Last validation: {stats.lastValidated.toLocaleString()}</span>
          )}
        </div>
        <button
          onClick={handleValidateAll}
          disabled={validating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
        >
          {validating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {validating
            ? `Validating ${progress.done}/${progress.total || "…"}`
            : `Validate All Logos${stats.pending > 0 ? ` (${stats.pending} pending)` : ""}`}
        </button>
      </div>

      {validating && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              Scanning company logos...
            </span>
            <span className="text-xs text-white/40">{progress.done} / {progress.total}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {validationSummary && !validating && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <h3 className="text-white font-bold">Logo Validation Complete</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <div className="text-2xl font-bold text-white">{validationSummary.scanned}</div>
              <div className="text-xs text-white/40">Companies Scanned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{validationSummary.valid}</div>
              <div className="text-xs text-white/40">Valid</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{validationSummary.invalid}</div>
              <div className="text-xs text-white/40">Broken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{validationSummary.missing}</div>
              <div className="text-xs text-white/40">Missing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">{validationSummary.fallbackGenerated}</div>
              <div className="text-xs text-white/40">Fallback Generated</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map(c => (
          <div key={c.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <c.icon size={16} className={c.color} />
              <span className="text-xl font-bold text-white">{c.value}</span>
            </div>
            <div className="text-white/30 text-xs">{c.label}</div>
          </div>
        ))}
      </div>

      {issues.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-white/70">Companies Needing Logo Attention</span>
            <span className="text-xs text-white/30 ml-auto">{issues.length} shown</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {issues.map(c => {
              const status = !c.logo_url ? "missing" : (c.logo_status || "pending");
              const badge = status === "missing"
                ? "bg-amber-500/10 text-amber-400"
                : status === "invalid"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-blue-500/10 text-blue-400";
              return (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <CompanyLogo company={c} size="sm" showSkeleton={false} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 font-medium truncate">{c.name}</div>
                    <div className="text-xs text-white/30">{c.industry || "—"} · {c.country || "—"}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${badge}`}>{status}</span>
                  <button onClick={() => onRepair?.(c)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-xs">
                    <Wrench size={12} /> Repair
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}