import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Target, CheckCircle2, AlertCircle, TrendingUp, Award } from "lucide-react";
import { skillsIntelligenceService } from "@/lib/skillsIntelligenceService";
import { toast } from "@/components/ui/use-toast";

const ROLE_SUGGESTIONS = ["CIO", "CTO", "COO", "VP of Operations", "Director", "Senior Director", "IT Manager", "Service Delivery Manager"];

export default function RoleBenchmarkPanel({ skills, targetRole }) {
  const [roleName, setRoleName] = useState(targetRole || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => { if (targetRole && !roleName) setRoleName(targetRole); }, [targetRole]);

  const handleBenchmark = useCallback(async () => {
    if (!roleName.trim()) return;
    setLoading(true);
    try {
      const result = await skillsIntelligenceService.getRoleMatch(roleName.trim());
      setData(result);
    } catch (err) {
      toast({ title: "Benchmark failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [roleName]);

  const match = data?.match;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white/80">Role Benchmark Engine™</h3>
      </div>
      <p className="text-white/30 text-xs mb-3">Compare your skills against target executive roles.</p>
      <div className="flex items-center gap-2 mb-3">
        <input value={roleName} onChange={e => setRoleName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBenchmark()}
          placeholder="e.g. CIO, Director, VP..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50" />
        <Button onClick={handleBenchmark} disabled={loading || !roleName.trim()} size="sm" className="bg-amber-600 hover:bg-amber-500">
          {loading ? <Loader2 size={12} className="animate-spin" /> : "Benchmark"}
        </Button>
      </div>
      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ROLE_SUGGESTIONS.map(r => (
          <button key={r} onClick={() => setRoleName(r)} className="text-[10px] text-white/40 bg-white/5 border border-white/5 rounded px-2 py-0.5 hover:text-white/70 hover:border-white/10 transition-colors">{r}</button>
        ))}
      </div>

      {match && (
        <div className="space-y-3">
          {/* Readiness Score */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 - (match.estimated_readiness / 100) * 2 * Math.PI * 28}
                  strokeLinecap="round" className={match.estimated_readiness >= 70 ? "text-emerald-400" : match.estimated_readiness >= 40 ? "text-amber-400" : "text-red-400"} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{match.estimated_readiness}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/80">{data.role}</div>
              <div className="text-xs text-white/40">Estimated Executive Readiness</div>
            </div>
          </div>

          {match.analysis && <p className="text-xs text-white/50 leading-relaxed bg-white/[0.02] rounded-lg p-2.5">{match.analysis}</p>}

          <div className="grid grid-cols-1 gap-2">
            {match.strong_skills?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5"><CheckCircle2 size={10} /> Strong Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {match.strong_skills.map((s, i) => <span key={i} className="text-[11px] text-emerald-300 bg-emerald-500/5 border border-emerald-500/15 rounded-md px-2 py-1">{s}</span>)}
                </div>
              </div>
            )}
            {match.missing_skills?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5"><AlertCircle size={10} /> Missing Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {match.missing_skills.map((s, i) => <span key={i} className="text-[11px] text-amber-300 bg-amber-500/5 border border-amber-500/15 rounded-md px-2 py-1">{s}</span>)}
                </div>
              </div>
            )}
            {match.recommended_skills?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5"><TrendingUp size={10} /> Recommended Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {match.recommended_skills.map((s, i) => <span key={i} className="text-[11px] text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 rounded-md px-2 py-1">{s}</span>)}
                </div>
              </div>
            )}
            {match.required_skills?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5"><Award size={10} /> Required Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {match.required_skills.map((s, i) => <span key={i} className="text-[11px] text-white/50 bg-white/5 border border-white/5 rounded-md px-2 py-1">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!match && !loading && (
        <div className="text-center py-4">
          <Target size={20} className="text-white/10 mx-auto mb-1.5" />
          <p className="text-white/30 text-xs">Enter a role name to benchmark your skills.</p>
        </div>
      )}
    </div>
  );
}