import React, { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Briefcase, Search, RefreshCw, Database, TrendingUp, Bookmark, Send } from "lucide-react";
import JobCard from "@/components/careers/JobCard";
import JobDetailDrawer from "@/components/careers/JobDetailDrawer";
import { EXEC_LEVELS, WORK_MODELS, SOURCE_META, calculateHeuristicMatch, formatSyncTime } from "@/lib/careerMarketplace";

export default function NetworkCareers() {
  const { user } = useAuth();
  const { canAccessDeveloper } = useDeveloper();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sources, setSources] = useState([]);
  const [profile, setProfile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [fLevel, setFLevel] = useState("");
  const [fModel, setFModel] = useState("");
  const [fSource, setFSource] = useState("");
  const [fSaved, setFSaved] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [selectedJob, setSelectedJob] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [jobsData, savedData, appsData, sourcesData, profiles, resumes] = await Promise.all([
        base44.entities.CareerOpportunity.filter({ is_active: true }, "-posted_date", 200),
        user?.id ? base44.entities.SavedJob.filter({ user_id: user.id }) : Promise.resolve([]),
        user?.id ? base44.entities.JobApplication.filter({ user_id: user.id }) : Promise.resolve([]),
        base44.entities.JobSource.list("name", 50),
        base44.entities.UserProfile.filter({ created_by_id: user.id }),
        base44.entities.ResumeVersion.list("-created_date", 1),
      ]);

      setJobs(jobsData);
      setSavedJobs(savedData);
      setApplications(appsData);
      setSources(sourcesData);
      setProfile(profiles[0] || null);
      if (resumes[0]?.extracted_data) {
        try { setResumeData(JSON.parse(resumes[0].extracted_data)); } catch (e) {}
      }
    } catch (e) {}
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const savedJobIds = useMemo(() => new Set(savedJobs.map((s) => s.job_id)), [savedJobs]);
  const appliedJobIds = useMemo(() => new Set(applications.map((a) => a.job_id)), [applications]);
  const appByJobId = useMemo(() => {
    const map = {};
    for (const a of applications) { map[a.job_id] = a; }
    return map;
  }, [applications]);

  const sourceTypes = useMemo(() => [...new Set(jobs.map((j) => j.source_type).filter(Boolean))], [jobs]);

  const lastSyncTime = useMemo(() => {
    const times = sources.map((s) => s.last_sync_at).filter(Boolean);
    if (times.length === 0) return null;
    return times.sort((a, b) => new Date(b) - new(a))[0];
  }, [sources]);

  const filtered = useMemo(() => {
    let result = jobs.filter((j) => {
      if (fLevel && j.executive_level !== fLevel) return false;
      if (fModel && j.work_model !== fModel) return false;
      if (fSource && j.source_type !== fSource) return false;
      if (fSaved && !savedJobIds.has(j.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        return j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.industry?.toLowerCase().includes(q);
      }
      return true;
    });

    if (sortBy === "match") {
      result = result.sort((a, b) => {
        const sa = calculateHeuristicMatch(a, profile, resumeData) || 0;
        const sb = calculateHeuristicMatch(b, profile, resumeData) || 0;
        return sb - sa;
      });
    }
    // default: date (already sorted from query)

    return result;
  }, [jobs, fLevel, fModel, fSource, fSaved, search, sortBy, profile, resumeData, savedJobIds]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke("syncJobs", {});
      const data = response.data || response;
      if (data.success) {
        toast({
          title: "Job sync complete",
          description: `${data.totalNew || 0} new • ${data.totalUpdated || 0} updated • ${data.expiredDeactivated || 0} expired`,
        });
        await loadData();
      } else {
        toast({ title: "Sync failed", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Sync failed", description: err?.message, variant: "destructive" });
    }
    setSyncing(false);
  };

  const handleSave = async (job) => {
    if (!user) return;
    if (savedJobIds.has(job.id)) {
      const saved = savedJobs.find((s) => s.job_id === job.id);
      if (saved) {
        await base44.entities.SavedJob.delete(saved.id);
        setSavedJobs((prev) => prev.filter((s) => s.job_id !== job.id));
      }
    } else {
      const record = await base44.entities.SavedJob.create({
        user_id: user.id,
        job_id: job.id,
        job_title: job.title,
        company_name: job.company,
        company_logo: job.company_logo,
        saved_at: new Date().toISOString(),
      });
      setSavedJobs((prev) => [...prev, record]);
    }
  };

  const handleApply = async (job, method) => {
    if (!user) return;
    const existing = applications.find((a) => a.job_id === job.id);
    if (existing && existing.status === "applied") return;

    if (existing) {
      const updated = await base44.entities.JobApplication.update(existing.id, {
        status: "applied",
        application_method: method,
        applied_at: new Date().toISOString(),
      });
      setApplications((prev) => prev.map((a) => (a.id === existing.id ? updated : a)));
    } else {
      const created = await base44.entities.JobApplication.create({
        user_id: user.id,
        job_id: job.id,
        job_title: job.title,
        company_name: job.company,
        company_logo: job.company_logo,
        status: "applied",
        application_method: method,
        applied_at: new Date().toISOString(),
      });
      setApplications((prev) => [...prev, created]);
    }

    try { await base44.entities.CareerOpportunity.update(job.id, { application_count: (job.application_count || 0) + 1 }); } catch (e) {}

    toast({ title: "Application tracked", description: `${job.title} at ${job.company} — status: Applied` });
  };

  const handleApplicationUpdate = async (appId, field, value) => {
    if (!appId || !field) return;
    try {
      const updated = await base44.entities.JobApplication.update(appId, { [field]: value });
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (field === "status") toast({ title: "Status updated", description: `Application: ${updated.status}` });
    } catch (e) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Briefcase size={12} className="text-indigo-400" /> Talent Marketplace
          </div>
          <h1 className="text-xl font-bold text-white">Executive Talent Marketplace</h1>
          <p className="text-white/40 text-sm mt-1">
            Real-time executive positions from {sourceTypes.length} sources — C-Level, VP, Director, and Board roles.
          </p>
        </div>
        {canAccessDeveloper && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
          >
            {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Sync Now
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-white/50">
          <Database size={11} className="text-indigo-400" /> {jobs.length} Active Jobs
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-white/50">
          <TrendingUp size={11} className="text-emerald-400" /> {sourceTypes.length} Sources
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-white/50">
          <Bookmark size={11} className="text-amber-400" /> {savedJobs.length} Saved
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-white/50">
          <Send size={11} className="text-blue-400" /> {applications.length} Applied
        </span>
        {lastSyncTime && (
          <span className="text-white/25">Last sync: {formatSyncTime(lastSyncTime)}</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, or industry..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select value={fLevel} onChange={(e) => setFLevel(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none">
          <option value="">All Levels</option>
          {Object.entries(EXEC_LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={fModel} onChange={(e) => setFModel(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none">
          <option value="">All Models</option>
          {Object.entries(WORK_MODELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={fSource} onChange={(e) => setFSource(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none">
          <option value="">All Sources</option>
          {sourceTypes.map((s) => <option key={s} value={s}>{(SOURCE_META[s] || {}).label || s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none">
          <option value="date">Newest</option>
          <option value="match">Best Match</option>
        </select>
      </div>

      {/* Saved Filter Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFSaved(!fSaved)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${fSaved ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40 hover:text-white/60"}`}
        >
          <Bookmark size={11} fill={fSaved ? "currentColor" : "none"} /> Saved Only
        </button>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase size={32} className="mx-auto text-white/10 mb-2" />
          <p className="text-white/30 text-sm mb-1">{fSaved ? "No saved jobs found." : "No executive positions found."}</p>
          {canAccessDeveloper && !fSaved && (
            <button onClick={handleSync} className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
              Sync job sources to fetch listings
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              heuristicScore={calculateHeuristicMatch(job, profile, resumeData)}
              isSaved={savedJobIds.has(job.id)}
              isApplied={appliedJobIds.has(job.id)}
              onSave={handleSave}
              onClick={() => setSelectedJob(job)}
            />
          ))}
        </div>
      )}

      {/* Job Detail Drawer */}
      {selectedJob && (
        <JobDetailDrawer
          job={selectedJob}
          heuristicScore={calculateHeuristicMatch(selectedJob, profile, resumeData)}
          isSaved={savedJobIds.has(selectedJob.id)}
          isApplied={appliedJobIds.has(selectedJob.id)}
          application={appByJobId[selectedJob.id]}
          onClose={() => setSelectedJob(null)}
          onSave={handleSave}
          onApply={handleApply}
          onApplicationUpdate={handleApplicationUpdate}
        />
      )}
    </div>
  );
}