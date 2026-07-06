import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_DNA_SCORES } from "@/lib/legacyData";
import LegacyTimeline from "@/components/legacy/LegacyTimeline";
import ExecutiveDna from "@/components/legacy/ExecutiveDna";
import CaseStudyCard from "@/components/legacy/CaseStudyCard";
import CaseStudyModal from "@/components/legacy/CaseStudyModal";
import { Award, Plus, Loader2, Filter, BookOpen } from "lucide-react";

export default function ExecutiveLegacy() {
  const [legacy, setLegacy] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const legacies = await base44.entities.ExecutiveLegacy.list("-updated_date", 1);
        if (legacies.length > 0) {
          setLegacy(legacies[0]);
        } else {
          const created = await base44.entities.ExecutiveLegacy.create({
            title: "Executive Legacy",
            years_experience: 35,
            competency_scores_json: JSON.stringify(DEFAULT_DNA_SCORES),
          });
          setLegacy(created);
        }
        const studies = await base44.entities.LegacyCaseStudy.list("-created_date", 100);
        setCaseStudies(studies);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const updateSection = async (sectionId, content) => {
    if (!legacy) return;
    const updated = { ...legacy, [sectionId]: content };
    setLegacy(updated);
    try { await base44.entities.ExecutiveLegacy.update(legacy.id, { [sectionId]: content }); } catch (e) {}
  };

  const updateDna = async (scores) => {
    if (!legacy) return;
    const updated = { ...legacy, competency_scores_json: JSON.stringify(scores) };
    setLegacy(updated);
    try { await base44.entities.ExecutiveLegacy.update(legacy.id, { competency_scores_json: JSON.stringify(scores) }); } catch (e) {}
  };

  const saveCaseStudy = async (data) => {
    try {
      if (editingStudy) {
        await base44.entities.LegacyCaseStudy.update(editingStudy.id, data);
        setCaseStudies(prev => prev.map(c => c.id === editingStudy.id ? { ...editingStudy, ...data } : c));
      } else {
        const created = await base44.entities.LegacyCaseStudy.create(data);
        setCaseStudies(prev => [created, ...prev]);
      }
      setShowModal(false);
      setEditingStudy(null);
    } catch (e) {}
  };

  const deleteCaseStudy = async (study) => {
    try {
      await base44.entities.LegacyCaseStudy.delete(study.id);
      setCaseStudies(prev => prev.filter(c => c.id !== study.id));
    } catch (e) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  const dnaScores = (() => {
    try { return JSON.parse(legacy?.competency_scores_json || "[]"); } catch { return DEFAULT_DNA_SCORES; }
  })();

  const industries = [...new Set(caseStudies.map(c => c.industry).filter(Boolean))];
  const filteredStudies = filterIndustry ? caseStudies.filter(c => c.industry === filterIndustry) : caseStudies;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Award size={12} className="text-amber-400" /> Executive Legacy
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{legacy?.title || "Executive Legacy"}</h1>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">{legacy?.years_experience || 35} Years</span>
        </div>
        <p className="text-white/40 text-sm mt-2">Your living career legacy — decisions, lessons, philosophy, case studies, and executive DNA.</p>
      </div>

      {/* Legacy Timeline */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Legacy Timeline</h2>
        <LegacyTimeline legacy={legacy} onUpdate={updateSection} />
      </div>

      {/* Case Studies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Case Studies</h2>
          <button onClick={() => { setEditingStudy(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors">
            <Plus size={14} /> Add Case Study
          </button>
        </div>

        {industries.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter size={14} className="text-white/20" />
            <button onClick={() => setFilterIndustry("")} className={`px-2.5 py-1 rounded-full text-xs transition-colors ${!filterIndustry ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/60"}`}>All</button>
            {industries.map(ind => (
              <button key={ind} onClick={() => setFilterIndustry(ind)} className={`px-2.5 py-1 rounded-full text-xs transition-colors ${filterIndustry === ind ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/60"}`}>{ind}</button>
            ))}
          </div>
        )}

        {filteredStudies.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <BookOpen size={24} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No case studies yet. Document your pivotal decisions and outcomes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudies.map(study => (
              <CaseStudyCard key={study.id} study={study} onEdit={(s) => { setEditingStudy(s); setShowModal(true); }} onDelete={deleteCaseStudy} />
            ))}
          </div>
        )}
      </div>

      {/* Executive DNA */}
      <ExecutiveDna scores={dnaScores} onUpdate={updateDna} />

      {showModal && <CaseStudyModal study={editingStudy} onSave={saveCaseStudy} onClose={() => { setShowModal(false); setEditingStudy(null); }} />}
    </div>
  );
}