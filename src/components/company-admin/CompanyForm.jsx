import React, { useState } from "react";
import { COMPANY_FORM_TABS, calculateQualityScore, defaultCompany } from "@/lib/companyAdmin";
import { X, Save, Loader2 } from "lucide-react";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

function FieldRenderer({ field, value, onChange }) {
  switch (field.type) {
    case "textarea":
      return <textarea value={value || ""} onChange={e => onChange(field.name, e.target.value)} rows={3} className={inputClass} />;
    case "array":
      return <textarea value={Array.isArray(value) ? value.join("\n") : (typeof value === "string" ? value : "")} onChange={e => onChange(field.name, e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} rows={4} className={inputClass} placeholder="One item per line" />;
    case "boolean":
      return <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!value} onChange={e => onChange(field.name, e.target.checked)} className="w-4 h-4 rounded bg-white/5 border-white/20 text-indigo-500" /><span className="text-sm text-white/50">{value ? "Yes" : "No"}</span></label>;
    case "select":
      return <select value={value || ""} onChange={e => onChange(field.name, e.target.value)} className={inputClass}><option value="">Select...</option>{field.options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
    case "number":
      return <input type="number" value={value || 0} onChange={e => onChange(field.name, Number(e.target.value))} className={inputClass} />;
    case "date":
      return <input type="date" value={value || ""} onChange={e => onChange(field.name, e.target.value)} className={inputClass} />;
    default:
      return <input type="text" value={value || ""} onChange={e => onChange(field.name, e.target.value)} className={inputClass} />;
  }
}

export default function CompanyForm({ company, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(company ? { ...company } : defaultCompany());
  const [saving, setSaving] = useState(false);

  const updateField = (name, value) => setData(d => ({ ...d, [name]: value }));

  const handleSave = async () => {
    if (!data.name?.trim()) return;
    setSaving(true);
    try {
      await onSave({ ...data, quality_score: calculateQualityScore(data) });
    } catch (e) {}
    setSaving(false);
  };

  const currentTab = COMPANY_FORM_TABS.find(t => t.id === activeTab);
  const score = calculateQualityScore(data);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">{company ? "Edit Company" : "New Company"}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${score >= 90 ? "bg-emerald-500/10 text-emerald-400" : score >= 80 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>Quality: {score}%</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
        </div>

        <div className="flex border-b border-white/5 overflow-x-auto">
          {COMPANY_FORM_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "text-indigo-400 border-b-2 border-indigo-400" : "text-white/40 hover:text-white/70"}`}>{tab.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentTab.fields.map(field => (
              <div key={field.name} className={field.type === "textarea" || field.type === "array" ? "sm:col-span-2" : ""}>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">{field.label}{field.required && <span className="text-red-400 ml-1">*</span>}</label>
                <FieldRenderer field={field} value={data[field.name]} onChange={updateField} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 text-white/40 hover:text-white/70 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving || !data.name?.trim()} className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Company
          </button>
        </div>
      </div>
    </div>
  );
}