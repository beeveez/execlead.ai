import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { SectionCard } from "@/components/profile/FormFields";
import CompetencyBadge from "./CompetencyBadge";
import CompetencyPicker from "./CompetencyPicker";
import CompetencyEditModal from "./CompetencyEditModal";
import GapAnalysisCard from "./GapAnalysisCard";
import { getCategoryById, addRecentlyUsed, computeGapAnalysis } from "@/lib/competencyCatalog";
import { Fingerprint, Plus, Loader2, TrendingUp, Target } from "lucide-react";

export default function CompetenciesSection({ userId, targetRole, onSkillsChange }) {
  const { user } = useAuth();
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showGap, setShowGap] = useState(false);
  const onSkillsChangeRef = useRef(onSkillsChange);
  onSkillsChangeRef.current = onSkillsChange;

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const records = await base44.entities.ExecutiveCompetency.filter({ user_id: userId }, "display_order", 200);
      setCompetencies(records);
      onSkillsChangeRef.current?.(records.map((r) => r.competency_name));
    } catch (e) {}
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (comp) => {
    try {
      const record = await base44.entities.ExecutiveCompetency.create({
        user_id: userId,
        user_name: user?.full_name,
        competency_name: comp.name,
        category: comp.category,
        subcategory: comp.subcategory,
        proficiency: "working",
        competency_score: 0,
        confidence_score: 0,
        years_experience: 0,
        verified: false,
        verification_source: "manual",
        evidence_count: 0,
        growth_trend: "stable",
        display_order: competencies.length,
        last_updated: new Date().toISOString().split("T")[0],
      });
      setCompetencies((prev) => [...prev, record]);
      onSkillsChange?.([...competencies, record].map((r) => r.competency_name));
      addRecentlyUsed(userId, comp.name);
      toast({ title: "Competency Added", description: `${comp.name} added to your executive profile.` });
    } catch (e) {
      toast({ title: "Failed", description: "Could not add competency.", variant: "destructive" });
    }
    setPickerOpen(false);
  };

  const handleUpdate = async (id, data) => {
    try {
      const record = await base44.entities.ExecutiveCompetency.update(id, {
        ...data,
        last_updated: new Date().toISOString().split("T")[0],
      });
      setCompetencies((prev) => prev.map((c) => (c.id === id ? record : c)));
      toast({ title: "Updated", description: "Competency updated successfully." });
    } catch (e) {
      toast({ title: "Failed", description: "Could not update competency.", variant: "destructive" });
    }
    setEditing(null);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.ExecutiveCompetency.delete(id);
      const updated = competencies.filter((c) => c.id !== id);
      setCompetencies(updated);
      onSkillsChange?.(updated.map((r) => r.competency_name));
      toast({ title: "Removed", description: "Competency removed from your profile." });
    } catch (e) {
      toast({ title: "Failed", description: "Could not remove competency.", variant: "destructive" });
    }
    setEditing(null);
  };

  const total = competencies.length;
  const verifiedCount = competencies.filter((c) => c.verified).length;
  const avgScore = total > 0 ? Math.round(competencies.reduce((s, c) => s + (c.competency_score || 0), 0) / total) : 0;
  const growingCount = competencies.filter((c) => c.growth_trend === "up").length;
  const categoryCounts = {};
  competencies.forEach((c) => { categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1; });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const gap = computeGapAnalysis(competencies, targetRole);

  return (
    <SectionCard
      title="Executive Competencies™"
      description="Build your executive capability profile through verified competencies, experience, certifications, and continuous learning."
      icon={Fingerprint}
      action={
        <div className="flex items-center gap-1.5">
          {gap && (
            <button
              onClick={() => setShowGap((s) => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showGap ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              <Target size={14} /> Gap Analysis
            </button>
          )}
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      }
    >
      {showGap && gap && <GapAnalysisCard gap={gap} />}

      {total > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white/90">{total}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{verifiedCount}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Verified</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">{avgScore}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Avg Score</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400 flex items-center justify-center gap-1">
              {growingCount}
              {growingCount > 0 && <TrendingUp size={14} className="text-emerald-400" />}
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Growing</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-white/30" />
        </div>
      ) : total > 0 ? (
        <div className="flex flex-wrap gap-2">
          {competencies.map((c) => (
            <CompetencyBadge key={c.id} competency={c} onClick={() => setEditing(c)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Fingerprint size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm mb-1">No competencies added yet.</p>
          <p className="text-white/20 text-xs">Click "Add" to build your executive capability profile.</p>
        </div>
      )}

      {topCategories.length > 0 && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-white/20 uppercase tracking-wider">Top Domains:</span>
          {topCategories.map(([catId, count]) => {
            const cat = getCategoryById(catId);
            return (
              <span key={catId} className="flex items-center gap-1 text-[10px] text-white/40">
                {cat?.icon && <cat.icon size={10} style={{ color: cat?.color }} />}
                {cat?.label} ({count})
              </span>
            );
          })}
        </div>
      )}

      <CompetencyPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAdd}
        existingNames={competencies.map((c) => c.competency_name)}
        targetRole={targetRole}
        userId={userId}
      />

      {editing && (
        <CompetencyEditModal
          competency={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </SectionCard>
  );
}