import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Search, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { skillsIntelligenceService } from "@/lib/skillsIntelligenceService";
import { toast } from "@/components/ui/use-toast";

export default function CompanyBenchmarkPanel({ skills }) {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleBenchmark = useCallback(async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    try {
      const result = await skillsIntelligenceService.getCompanyMatch(companyName.trim());
      setData(result);
    } catch (err) {
      toast({ title: "Benchmark failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  const match = data?.match;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={14} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Company Benchmark Engine™</h3>
      </div>
      <p className="text-white/30 text-xs mb-3">Compare your skills against target organizations.</p>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBenchmark()}
            placeholder="e.g. Microsoft, Google, AWS..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <Button onClick={handleBenchmark} disabled={loading || !companyName.trim()} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
          {loading ? <Loader2 size={12} className="animate-spin" /> : "Benchmark"}
        </Button>
      </div>

      {match && (
        <div className="space-y-3">
          {/* Match Score */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 - (match.current_match / 100) * 2 * Math.PI * 28}
                  strokeLinecap="round" className={match.current_match >= 70 ? "text-emerald-400" : match.current_match >= 40 ? "text-amber-400" : "text-red-400"} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{match.current_match}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/80">{data.company}</div>
              <div className="text-xs text-white/40">Executive Readiness: <span className="text-indigo-300 font-medium">{match.executive_readiness}%</span></div>
            </div>
          </div>

          {/* Analysis */}
          {match.analysis && <p className="text-xs text-white/50 leading-relaxed bg-white/[0.02] rounded-lg p-2.5">{match.analysis}</p>}

          {/* Missing Skills */}
          {match.missing_skills?.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5"><AlertCircle size={10} /> Missing Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {match.missing_skills.map((s, i) => <span key={i} className="text-[11px] text-amber-300 bg-amber-500/5 border border-amber-500/15 rounded-md px-2 py-1">{s}</span>)}
              </div>
            </div>
          )}

          {/* Competitive Advantage */}
          {match.competitive_advantage?.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5"><CheckCircle2 size={10} /> Competitive Advantage</div>
              <div className="flex flex-wrap gap-1.5">
                {match.competitive_advantage.map((s, i) => <span key={i} className="text-[11px] text-emerald-300 bg-emerald-500/5 border border-emerald-500/15 rounded-md px-2 py-1">{s}</span>)}
              </div>
            </div>
          )}

          {/* Market Gap */}
          {match.market_gap?.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1.5"><TrendingUp size={10} /> Market Gap</div>
              <div className="flex flex-wrap gap-1.5">
                {match.market_gap.map((s, i) => <span key={i} className="text-[11px] text-purple-300 bg-purple-500/5 border border-purple-500/15 rounded-md px-2 py-1">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {!match && !loading && (
        <div className="text-center py-4">
          <Building2 size={20} className="text-white/10 mx-auto mb-1.5" />
          <p className="text-white/30 text-xs">Enter a company name to benchmark your skills.</p>
        </div>
      )}
    </div>
  );
}