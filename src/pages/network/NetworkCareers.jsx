import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Briefcase, MapPin, DollarSign, Building2, ArrowUpRight, Search,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const WORK_MODELS = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };
const OPPORTUNITY_LABELS = {
  c_level: "C-Level", vp: "VP", director: "Director", board: "Board", global: "Global",
};

export default function NetworkCareers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [fModel, setFModel] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        setJobs(await base44.entities.CareerOpportunity.list("-created_date", 100));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const countries = [...new Set(jobs.map((j) => j.country).filter(Boolean))].sort();

  const filtered = jobs.filter((j) => {
    if (fCountry && j.country !== fCountry) return false;
    if (fModel && j.work_model !== fModel) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        j.title?.toLowerCase().includes(q) ||
        j.company?.toLowerCase().includes(q) ||
        j.industry?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApply = async (job) => {
    try {
      await base44.entities.CareerOpportunity.update(job.id, {
        application_count: (job.application_count || 0) + 1,
      });
      setAppliedIds((prev) => new Set([...prev, job.id]));
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, application_count: (j.application_count || 0) + 1 } : j
        )
      );
      toast({
        title: "Application submitted",
        description: `You've applied for ${job.title} at ${job.company} using your EXECLEAD profile.`,
      });
    } catch (e) {
      toast({ title: "Could not apply", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Briefcase size={12} className="text-indigo-400" /> Career Opportunities
        </div>
        <h1 className="text-xl font-bold text-white">Executive Job Board</h1>
        <p className="text-white/40 text-sm mt-1">
          Premium executive positions — C-Level, VP, Director, and Board roles.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, or industry..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select value={fCountry} onChange={(e) => setFCountry(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={fModel} onChange={(e) => setFModel(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">All Models</option>
          {Object.entries(WORK_MODELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No opportunities found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{job.title}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-300">
                      {OPPORTUNITY_LABELS[job.opportunity_type] || job.opportunity_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                    <span className="flex items-center gap-1"><Building2 size={11} /> {job.company}</span>
                    {job.country && <span className="flex items-center gap-1"><MapPin size={11} /> {job.country}</span>}
                    {job.work_model && <span>{WORK_MODELS[job.work_model] || job.work_model}</span>}
                    {job.salary_range && <span className="flex items-center gap-1 text-emerald-400/70"><DollarSign size={11} /> {job.salary_range}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleApply(job)}
                  disabled={appliedIds.has(job.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    appliedIds.has(job.id) ? "bg-emerald-500/10 text-emerald-400 cursor-default" : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {appliedIds.has(job.id) ? "Applied" : <><ArrowUpRight size={12} /> Apply</>}
                </button>
              </div>
              {job.description && <p className="text-white/50 text-xs leading-relaxed mb-2 line-clamp-2">{job.description}</p>}
              {job.requirements?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.slice(0, 5).map((req, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/40">{req}</span>
                  ))}
                </div>
              )}
              <div className="text-white/20 text-[10px] mt-2">{job.application_count || 0} applications</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}