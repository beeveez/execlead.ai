import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Loader2, Plus, BrainCircuit, Search, Sparkles, ArrowLeft,
  Code, Crown, Target, Settings, Shield, DollarSign, MessageSquare,
  Users, RefreshCw, Lightbulb, AlertTriangle, Heart, Download,
  SlidersHorizontal, Network,
} from "lucide-react";
import SkillIntelligenceDashboard from "@/components/skills/SkillIntelligenceDashboard";
import ExecutiveSkillScorecard from "@/components/skills/ExecutiveSkillScorecard";
import ExecutiveSkillScoreCard from "@/components/skills/ExecutiveSkillScoreCard";
import ExecutiveSkillInsights from "@/components/skills/ExecutiveSkillInsights";
import CompanyBenchmarkPanel from "@/components/skills/CompanyBenchmarkPanel";
import RoleBenchmarkPanel from "@/components/skills/RoleBenchmarkPanel";
import SkillTimeline from "@/components/skills/SkillTimeline";
import SkillRecommendations from "@/components/skills/SkillRecommendations";
import SkillCard from "@/components/skills/SkillCard";
import SkillForm from "@/components/skills/SkillForm";
import SkillDetailDrawer from "@/components/skills/SkillDetailDrawer";
import { EXECUTIVE_DOMAINS, calculateConfidenceScore, getConfidenceLevel, appendChangeHistory, mapCategoryToDomain, parseJSON } from "@/lib/skillsIntelligenceEngine";

const DOMAIN_ICON_MAP = { Code, Crown, Target, Settings, Shield, DollarSign, MessageSquare, Users, RefreshCw, Lightbulb, AlertTriangle, Heart };

const DOMAIN_TEXT_COLORS = {
  indigo: "text-indigo-400", amber: "text-amber-400", purple: "text-purple-400",
  blue: "text-blue-400", emerald: "text-emerald-400", green: "text-green-400",
  cyan: "text-cyan-400", rose: "text-rose-400", orange: "text-orange-400",
  yellow: "text-yellow-400", red: "text-red-400", pink: "text-pink-400",
};

const SORT_OPTIONS = [
  { value: "confidence", label: "By Confidence Score" },
  { value: "name", label: "Alphabetical" },
  { value: "proficiency", label: "By Proficiency" },
  { value: "years", label: "By Experience" },
  { value: "demand", label: "By Market Demand" },
];

export default function Skills() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterVerification, setFilterVerification] = useState("all");
  const [filterDemand, setFilterDemand] = useState("all");
  const [sortBy, setSortBy] = useState("confidence");
  const [analyzing, setAnalyzing] = useState(false);

  const targetRole = profile?.target_role || profile?.current_role || "Executive";

  const loadSkills = useCallback(async () => {
    if (!user) return;
    try {
      const data = await base44.entities.Skill.filter({ user_id: user.id }, "-created_date", 200);
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  const handleSave = async (formData) => {
    try {
      if (editingSkill) {
        const existingHistory = editingSkill.change_history_json || "[]";
        const updatedHistory = appendChangeHistory(existingHistory, "skill_updated", `Updated via form`);
        await base44.entities.Skill.update(editingSkill.id, { ...formData, change_history_json: updatedHistory });
        toast({ title: "Skill Updated", description: `${formData.skill_name} has been updated.` });
      } else {
        const history = appendChangeHistory("[]", "skill_created", `Created via form`);
        await base44.entities.Skill.create({ ...formData, change_history_json: history, user_id: user.id });
        toast({ title: "Skill Added", description: `${formData.skill_name} has been added to your profile.` });
      }
      setShowForm(false);
      setEditingSkill(null);
      await loadSkills();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not save skill.", variant: "destructive" });
    }
  };

  const handleDelete = async (skill) => {
    try {
      await base44.entities.Skill.delete(skill.id);
      setSkills(prev => prev.filter(s => s.id !== skill.id));
      toast({ title: "Skill Removed", description: `${skill.skill_name} has been removed.` });
    } catch (err) {
      toast({ title: "Error", description: "Could not delete skill.", variant: "destructive" });
    }
  };

  const handleAddFromAI = async (skillData) => {
    try {
      const confidence = calculateConfidenceScore(skillData);
      const level = getConfidenceLevel(confidence);
      const history = appendChangeHistory("[]", "skill_created", `Added from AI recommendation`);
      await base44.entities.Skill.create({
        ...skillData,
        confidence_score: confidence,
        confidence_level: level,
        change_history_json: history,
        user_id: user.id,
      });
      toast({ title: "Skill Added", description: `${skillData.skill_name} added from AI recommendation.` });
      await loadSkills();
    } catch (err) {
      toast({ title: "Error", description: "Could not add skill.", variant: "destructive" });
    }
  };

  const handleAnalyzeWithAI = async () => {
    setAnalyzing(true);
    try {
      const experience = profile?.experience_json ? parseJSON(profile.experience_json, []) : [];
      const prompt = `You are an executive skills intelligence analyst. Analyze this executive's profile and extract a comprehensive skills list with evidence, verification state, and market demand.

Target Role: ${targetRole}
Current Role: ${profile?.current_role || "Unknown"}
Industry: ${profile?.preferred_industry || profile?.industry || "Unknown"}
Years of Experience: ${profile?.years_experience || "Unknown"}

Work Experience:
${Array.isArray(experience) ? experience.map(e => `- ${e.role || e.title || "Role"} at ${e.company || "Company"}: ${e.description || ""}`).join("\n") : "Not provided"}

Existing Skills: ${skills.map(s => s.skill_name).join(", ") || "None"}

Extract skills from the work experience. For each skill, provide:
- skill_name: the skill name
- capability_domain: one of technology, leadership, strategy, operations, governance, finance, communication, people_leadership, transformation, innovation, risk, customer_success
- proficiency: beginner, intermediate, advanced, or expert
- years_of_experience: estimated number
- acquired_year: estimated year first acquired (based on career timeline)
- verification_state: resume_verified, experience_verified, or ai_detected
- market_demand: high_demand, growing, emerging, stable, or legacy
- evidence: array of { source, type, description } — what evidence supports this skill
- related_skills: array of skill names that connect to this in the Executive Skill Graph™

Return JSON: { "extracted_skills": [...], "market_insights": [{ skill_name, demand_level, insight }] }

Do NOT include skills the user already has. Extract 5-15 skills.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            extracted_skills: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" },
              capability_domain: { type: "string" },
              proficiency: { type: "string" },
              years_of_experience: { type: "number" },
              acquired_year: { type: "number" },
              verification_state: { type: "string" },
              market_demand: { type: "string" },
              evidence: { type: "array", items: { type: "object", properties: {
                source: { type: "string" }, type: { type: "string" }, description: { type: "string" },
              }}},
              related_skills: { type: "array", items: { type: "string" } },
            }}},
            market_insights: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" }, demand_level: { type: "string" }, insight: { type: "string" },
            }}},
          },
        },
      });

      const existingNames = new Set(skills.map(s => s.skill_name.toLowerCase()));
      const newSkills = (res.extracted_skills || []).filter(s => !existingNames.has(s.skill_name.toLowerCase()));

      if (newSkills.length > 0) {
        const records = newSkills.map(s => {
          const confidence = calculateConfidenceScore({ ...s, evidence_json: JSON.stringify(s.evidence || []) });
          const level = getConfidenceLevel(confidence);
          return {
            skill_name: s.skill_name,
            capability_domain: s.capability_domain || "technology",
            proficiency: s.proficiency || "intermediate",
            years_of_experience: s.years_of_experience || 0,
            acquired_year: s.acquired_year,
            verification_state: s.verification_state || "ai_detected",
            confidence_score: confidence,
            confidence_level: level,
            market_demand: s.market_demand || "stable",
            source: "resume",
            evidence_json: JSON.stringify(s.evidence || []),
            related_skills_json: JSON.stringify(s.related_skills || []),
            change_history_json: appendChangeHistory("[]", "skill_created", "Extracted from resume via AI Skill Import Engine™"),
            user_id: user.id,
          };
        });
        await base44.entities.Skill.bulkCreate(records);
        toast({ title: "AI Import Complete", description: `${newSkills.length} skills extracted with evidence and confidence scores.` });
        await loadSkills();
      } else {
        toast({ title: "AI Analysis Complete", description: "No new skills found. Your skills profile is up to date." });
      }
    } catch (err) {
      toast({ title: "Analysis Failed", description: err.message || "Could not analyze skills.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = () => {
    const data = skills.map(s => ({
      Skill: s.skill_name,
      Domain: EXECUTIVE_DOMAINS.find(d => d.id === s.capability_domain)?.label || s.capability_domain,
      Proficiency: s.proficiency,
      Years: s.years_of_experience,
      Confidence: s.confidence_score,
      Level: s.confidence_level,
      Verification: s.verification_state,
      Market: s.market_demand,
      Evidence: parseJSON(s.evidence_json, []).length,
    }));
    const csv = [Object.keys(data[0] || {}).join(","), ...data.map(d => Object.values(d).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "skills-intelligence-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Filter & sort
  const demandPriority = { high_demand: 5, growing: 4, emerging: 3, stable: 2, legacy: 1 };
  const profOrder = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };

  const filtered = skills
    .filter(s => !search || s.skill_name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterDomain === "all" || s.capability_domain === filterDomain)
    .filter(s => filterVerification === "all" || (filterVerification === "verified" ? s.verification_state !== "self_reported" : s.verification_state === filterVerification))
    .filter(s => filterDemand === "all" || s.market_demand === filterDemand)
    .sort((a, b) => {
      if (sortBy === "confidence") return (b.confidence_score || 0) - (a.confidence_score || 0);
      if (sortBy === "name") return a.skill_name.localeCompare(b.skill_name);
      if (sortBy === "proficiency") return (profOrder[b.proficiency] || 0) - (profOrder[a.proficiency] || 0);
      if (sortBy === "years") return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      if (sortBy === "demand") return (demandPriority[b.market_demand] || 0) - (demandPriority[a.market_demand] || 0);
      return 0;
    });

  const skillsByDomain = EXECUTIVE_DOMAINS.map(d => ({ ...d, skills: filtered.filter(s => s.capability_domain === d.id) }));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link to="/profile" className="inline-flex items-center gap-1 text-white/30 text-xs hover:text-white/60 transition-colors mb-2">
            <ArrowLeft size={12} /> Back to Profile
          </Link>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Network size={12} className="text-indigo-400" /> Skills Intelligence™ v2.0
          </div>
          <h1 className="text-2xl font-bold text-white">Skills Intelligence™</h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">Evidence-driven, verified, and continuously improving representation of your professional capabilities across 12 executive domains.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAnalyzeWithAI} disabled={analyzing} variant="outline" className="border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10">
            {analyzing ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Importing...</> : <><Sparkles size={14} className="mr-1.5" /> AI Skill Import™</>}
          </Button>
          <Button onClick={handleExport} variant="outline" className="text-white/60">
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          <Button onClick={() => { setEditingSkill(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-500">
            <Plus size={14} className="mr-1.5" /> Add Skill
          </Button>
        </div>
      </div>

      {/* Dashboard */}
      <SkillIntelligenceDashboard skills={skills} />

      {/* Scorecard */}
      <ExecutiveSkillScorecard skills={skills} />

      {/* Executive Skill Score™ */}
      <ExecutiveSkillScoreCard skills={skills} />

      {/* Benchmark Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompanyBenchmarkPanel skills={skills} />
        <RoleBenchmarkPanel skills={skills} targetRole={targetRole} />
      </div>

      {/* AI Insights */}
      <ExecutiveSkillInsights skills={skills} targetRole={targetRole} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        </div>
        <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Domains</option>
          {EXECUTIVE_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select value={filterVerification} onChange={e => setFilterVerification(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Verification</option>
          <option value="verified">Verified Only</option>
          <option value="self_reported">Self Reported</option>
          <option value="resume_verified">Resume Verified</option>
          <option value="experience_verified">Experience Verified</option>
          <option value="certification_verified">Certification Verified</option>
          <option value="ai_detected">AI Detected</option>
        </select>
        <select value={filterDemand} onChange={e => setFilterDemand(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Market Demand</option>
          <option value="high_demand">High Demand</option>
          <option value="growing">Growing</option>
          <option value="emerging">Emerging</option>
          <option value="stable">Stable</option>
          <option value="legacy">Legacy</option>
        </select>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={12} className="text-white/30" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Skills by Domain */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BrainCircuit size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-1">{search || filterDomain !== "all" || filterVerification !== "all" || filterDemand !== "all" ? "No skills match your filters." : "No skills added yet."}</p>
          <p className="text-white/30 text-xs">{search ? "Try a different search term." : "Click \"Add Skill\" or \"AI Skill Import™\" to get started."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {skillsByDomain.map(domain => domain.skills.length > 0 && (
            <div key={domain.id}>
              <div className="flex items-center gap-2 mb-3">
                {React.createElement(DOMAIN_ICON_MAP[domain.icon] || Code, { size: 16, className: DOMAIN_TEXT_COLORS[domain.color] || "text-indigo-400" })}
                <h3 className="text-white/70 text-sm font-semibold">{domain.label}</h3>
                <span className="text-white/20 text-xs">{domain.skills.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {domain.skills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} onEdit={(s) => { setEditingSkill(s); setShowForm(true); }} onDelete={handleDelete} onClick={setSelectedSkill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillTimeline skills={skills} />
        <SkillRecommendations skills={skills} targetRole={targetRole} onAddSkill={handleAddFromAI} />
      </div>

      {/* Form Modal */}
      {showForm && (
        <SkillForm skill={editingSkill} onSave={handleSave} onClose={() => { setShowForm(false); setEditingSkill(null); }} />
      )}

      {/* Detail Drawer */}
      {selectedSkill && (
        <SkillDetailDrawer skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}