import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Loader2, Plus, BrainCircuit, Search, Sparkles, ArrowLeft,
  Code, Crown, Briefcase, Brain, SlidersHorizontal, Download,
} from "lucide-react";
import SkillsDashboard from "@/components/skills/SkillsDashboard";
import SkillCard from "@/components/skills/SkillCard";
import SkillForm from "@/components/skills/SkillForm";
import SkillGapAnalysis from "@/components/skills/SkillGapAnalysis";

const CATEGORIES = [
  { id: "technical", label: "Technical Skills", icon: Code, iconClass: "text-indigo-400" },
  { id: "leadership", label: "Leadership Skills", icon: Crown, iconClass: "text-amber-400" },
  { id: "business", label: "Business Skills", icon: Briefcase, iconClass: "text-emerald-400" },
  { id: "ai_digital", label: "AI & Digital Skills", icon: Brain, iconClass: "text-purple-400" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Alphabetical" },
  { value: "proficiency", label: "By Proficiency" },
  { value: "years", label: "By Years of Experience" },
];

export default function Skills() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterProficiency, setFilterProficiency] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [sortBy, setSortBy] = useState("name");
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
        await base44.entities.Skill.update(editingSkill.id, formData);
        toast({ title: "Skill Updated", description: `${formData.skill_name} has been updated.` });
      } else {
        await base44.entities.Skill.create({ ...formData, user_id: user.id });
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
      await base44.entities.Skill.create({ ...skillData, user_id: user.id, proficiency: skillData.proficiency || "intermediate" });
      toast({ title: "Skill Added", description: `${skillData.skill_name} added from AI analysis.` });
      await loadSkills();
    } catch (err) {
      toast({ title: "Error", description: "Could not add skill.", variant: "destructive" });
    }
  };

  const handleAnalyzeWithAI = async () => {
    setAnalyzing(true);
    try {
      const resumeUrl = profile?.resume_url;
      const experience = profile?.experience_json ? JSON.parse(profile.experience_json) : [];
      const prompt = `You are an executive skills analyst. Analyze this executive's profile and extract a comprehensive skills list.

Target Role: ${targetRole}
Current Role: ${profile?.current_role || "Unknown"}
Industry: ${profile?.preferred_industry || profile?.industry || "Unknown"}
Years of Experience: ${profile?.years_experience || "Unknown"}

Work Experience:
${experience?.map(e => `- ${e.role || e.title || "Role"} at ${e.company || "Company"}: ${e.description || ""}`).join("\n") || "Not provided"}

Existing Skills: ${skills.map(s => s.skill_name).join(", ") || "None"}

Extract skills from the work experience. Return a JSON object with:
- extracted_skills: array of { skill_name, category (technical/leadership/business/ai_digital), proficiency (beginner/intermediate/advanced/expert), years_of_experience (number), last_used (string), why_detected (string) }
- missing_skills: array of skill names that are commonly expected for this role but not found
- suggestions: array of { skill_name, category, reason } for skills to develop`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            extracted_skills: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" }, category: { type: "string" },
              proficiency: { type: "string" }, years_of_experience: { type: "number" },
              last_used: { type: "string" }, why_detected: { type: "string" },
            }}},
            missing_skills: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" }, category: { type: "string" }, reason: { type: "string" },
            }}},
          },
        },
      });

      // Auto-add extracted skills that don't already exist
      const existingNames = new Set(skills.map(s => s.skill_name.toLowerCase()));
      const newSkills = (res.extracted_skills || []).filter(s => !existingNames.has(s.skill_name.toLowerCase()));

      if (newSkills.length > 0) {
        await base44.entities.Skill.bulkCreate(newSkills.map(s => ({
          ...s, user_id: user.id, source: "resume",
        })));
        toast({ title: "AI Analysis Complete", description: `${newSkills.length} new skills extracted and added from your profile.` });
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
      Skill: s.skill_name, Category: s.category, Proficiency: s.proficiency,
      Years: s.years_of_experience, "Last Used": s.last_used,
      Verified: s.verified, Source: s.source,
    }));
    const csv = [Object.keys(data[0] || {}).join(","), ...data.map(d => Object.values(d).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "skills-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Filter & sort
  const filtered = skills
    .filter(s => !search || s.skill_name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterCategory === "all" || s.category === filterCategory)
    .filter(s => filterProficiency === "all" || s.proficiency === filterProficiency)
    .filter(s => filterVerified === "all" || (filterVerified === "verified" ? s.verified : !s.verified))
    .sort((a, b) => {
      if (sortBy === "name") return a.skill_name.localeCompare(b.skill_name);
      if (sortBy === "proficiency") { const order = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 }; return (order[b.proficiency] || 0) - (order[a.proficiency] || 0); }
      if (sortBy === "years") return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      return 0;
    });

  const skillsByCategory = CATEGORIES.map(cat => ({ ...cat, skills: filtered.filter(s => s.category === cat.id) }));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link to="/profile" className="inline-flex items-center gap-1 text-white/30 text-xs hover:text-white/60 transition-colors mb-2">
            <ArrowLeft size={12} /> Back to Profile
          </Link>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <BrainCircuit size={12} className="text-indigo-400" /> Qualifications
          </div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">Manage your professional, technical, leadership, and business skills to strengthen your executive profile and improve AI-powered recommendations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAnalyzeWithAI} disabled={analyzing} variant="outline" className="border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10">
            {analyzing ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Analyzing...</> : <><Sparkles size={14} className="mr-1.5" /> Analyze Skills with AI</>}
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
      <SkillsDashboard skills={skills} />

      {/* Skill Gap Analysis */}
      <SkillGapAnalysis skills={skills} targetRole={targetRole} onAddSkill={handleAddFromAI} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={filterProficiency} onChange={e => setFilterProficiency(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Proficiency</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <select value={filterVerified} onChange={e => setFilterVerified(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Status</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={12} className="text-white/30" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Skills by Category */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BrainCircuit size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-1">{search || filterCategory !== "all" || filterProficiency !== "all" ? "No skills match your filters." : "No skills added yet."}</p>
          <p className="text-white/30 text-xs">{search ? "Try a different search term." : "Click \"Add Skill\" or \"Analyze Skills with AI\" to get started."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {skillsByCategory.map(cat => cat.skills.length > 0 && (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <cat.icon size={16} className={cat.iconClass} />
                <h3 className="text-white/70 text-sm font-semibold">{cat.label}</h3>
                <span className="text-white/20 text-xs">{cat.skills.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.skills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} onEdit={(s) => { setEditingSkill(s); setShowForm(true); }} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <SkillForm skill={editingSkill} onSave={handleSave} onClose={() => { setShowForm(false); setEditingSkill(null); }} />
      )}
    </div>
  );
}