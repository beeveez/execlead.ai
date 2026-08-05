import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  generateADRId,
  computeADRStats,
  filterADRs,
  deriveADRSuggestions,
  blankADRDraft,
  ADR_STATUS_META,
} from "@/lib/architectureDecisionEngine";
import ADRStats from "@/components/adr/ADRStats";
import ADRFilters from "@/components/adr/ADRFilters";
import ADRList from "@/components/adr/ADRList";
import ADRForm from "@/components/adr/ADRForm";
import ADRDetail from "@/components/adr/ADRDetail";
import ADRSuggestions from "@/components/adr/ADRSuggestions";
import { Plus, BookOpen, Loader2 } from "lucide-react";

export default function ArchitectureDecisionRecords() {
  const { user } = useAuth();
  const [adrs, setAdrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: "", status: "all", category: "all", workspace: "all", owner: "all" });
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ArchitectureDecision.list("-updated_date", 200);
      setAdrs(data);
      const sug = await deriveADRSuggestions(data);
      setSuggestions(sug);
    } catch (err) {
      console.error("Failed to load ADRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const owners = useMemo(() => {
    const set = new Set();
    for (const a of adrs) if (a.owner) set.add(a.owner);
    return Array.from(set).sort();
  }, [adrs]);

  const stats = useMemo(() => computeADRStats(adrs), [adrs]);
  const filtered = useMemo(() => filterADRs(adrs, filters), [adrs, filters]);

  const openCreate = () => {
    setDraft(blankADRDraft(generateADRId(adrs), user?.full_name || user?.email || ""));
    setShowForm(true);
  };

  const handleSubmit = async (form) => {
    try {
      const { _affected_services_text, _related_standards_text, _related_exception_ids_text, _related_releases_text, ...payload } = form;
      if (selected && selected.id && draft?.id) {
        await base44.entities.ArchitectureDecision.update(draft.id, payload);
      } else {
        await base44.entities.ArchitectureDecision.create(payload);
      }
      setShowForm(false);
      setDraft(null);
      setSelected(null);
      await load();
    } catch (err) {
      console.error("Failed to save ADR:", err);
    }
  };

  const handleEdit = (adr) => {
    setSelected(null);
    setDraft({ ...adr });
    setShowForm(true);
  };

  const handleSupersede = async (adr) => {
    try {
      await base44.entities.ArchitectureDecision.update(adr.id, { status: "superseded" });
      setSelected(null);
      await load();
    } catch (err) {
      console.error("Failed to supersede ADR:", err);
    }
  };

  const handleAcceptSuggestion = (sug) => {
    setDraft({
      ...blankADRDraft(generateADRId(adrs), user?.full_name || user?.email || ""),
      title: sug.suggested_title,
      category: sug.category,
      trigger_source: sug.trigger_source,
      source_ref_id: sug.source_ref_id,
      problem_statement: sug.problem_statement,
      rationale: sug.rationale,
      related_exception_ids: sug.related_exception_ids,
      affected_workspaces: sug.affected_workspaces,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-white/25" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Architecture Governance v1.0</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Architecture Decision Records™</h1>
          <p className="text-white/40 text-sm mt-1.5">
            Code explains how. Standards explain what. Exceptions explain deviations. ADRs explain <span className="text-white/60">why</span>.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New ADR
        </button>
      </div>

      <ADRStats stats={stats} />

      <ADRSuggestions suggestions={suggestions} onAccept={handleAcceptSuggestion} />

      <ADRFilters filters={filters} onChange={setFilters} owners={owners} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        <>
          {stats.recentlyChanged.length > 0 && filters.query === "" && filters.status === "all" && filters.category === "all" && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Recently Changed</div>
              <ADRList adrs={stats.recentlyChanged} onSelect={setSelected} emptyHint="" />
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              {filtered.length} record{filtered.length === 1 ? "" : "s"}
            </div>
            <ADRList
              adrs={filtered}
              onSelect={setSelected}
              emptyHint="No records match the current filters."
            />
          </div>
        </>
      )}

      {showForm && draft && (
        <ADRForm draft={draft} onClose={() => { setShowForm(false); setDraft(null); }} onSubmit={handleSubmit} />
      )}
      {selected && !showForm && (
        <ADRDetail
          adr={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onSupersede={handleSupersede}
        />
      )}
    </div>
  );
}