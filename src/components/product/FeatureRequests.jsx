import React, { useState } from "react";
import { Lightbulb, ChevronRight, Filter, ThumbsUp } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";
import { getBusinessValue, getEffort, formatRelative, resolveCustomer } from "@/lib/productManagement";

const selectCls = "bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-indigo-500/50";

export default function FeatureRequests({ pm, onSelect }) {
  const [valueFilter, setValueFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const features = pm.feedback.filter(f => f.type === "feature");
  const filtered = features.filter(f => {
    if (valueFilter && f.business_value !== valueFilter) return false;
    if (stageFilter && f.roadmap_stage !== stageFilter) return false;
    return true;
  });

  return (
    <div>
      <SectionHeader icon={Lightbulb} title="Feature Requests" description={`${filtered.length} features — demand-driven product backlog.`} />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="flex items-center gap-1 text-xs text-white/30"><Filter size={11} /></span>
        <select value={valueFilter} onChange={e => setValueFilter(e.target.value)} className={selectCls}>
          <option value="" className="bg-[#0d0d14]">All Business Values</option>
          {[{ id: "critical", label: "Critical" }, { id: "high", label: "High" }, { id: "medium", label: "Medium" }, { id: "low", label: "Low" }].map(v => <option key={v.id} value={v.id} className="bg-[#0d0d14]">{v.label}</option>)}
        </select>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className={selectCls}>
          <option value="" className="bg-[#0d0d14]">All Stages</option>
          {["backlog", "research", "planned", "in_development", "testing", "ready_for_release", "released", "archived"].map(s => <option key={s} value={s} className="bg-[#0d0d14]">{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Lightbulb size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No feature requests found. Convert feedback to features from the inbox.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(feat => {
            const bv = getBusinessValue(feat.business_value);
            const effort = getEffort(feat.effort_estimate);
            const customer = resolveCustomer(feat);
            return (
              <div key={feat.id} onClick={() => onSelect(feat.id)}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Lightbulb size={15} className="text-amber-400 shrink-0" />
                    <span className="text-sm text-white/80 truncate">{feat.title}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-indigo-400 shrink-0"><ThumbsUp size={11} /> {feat.votes || 0}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px] text-white/30">
                  <code>{feat.feedback_id}</code>
                  <span>· {customer.organization !== "—" ? customer.organization : customer.name}</span>
                  {feat.owner && <span>· @{feat.owner}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ color: bv.color, background: `${bv.color}15` }}>Value: {bv.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 text-white/50">Effort: {effort.label} ({effort.hint})</span>
                  {feat.target_release && <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-400">→ {feat.target_release}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}