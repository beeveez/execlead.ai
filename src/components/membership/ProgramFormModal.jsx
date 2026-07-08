import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Save, Percent } from "lucide-react";
import { PROGRAM_TYPES, BENEFIT_FIELDS, createDefaultProgram } from "@/lib/membershipEngine";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all";
const labelClass = "text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block";

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all w-full ${
        checked ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"
      }`}
    >
      <div className={`w-9 h-5 rounded-full flex items-center shrink-0 mt-0.5 transition-colors ${checked ? "bg-indigo-500" : "bg-white/10"}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <div>
        <div className={`text-sm font-medium ${checked ? "text-indigo-400" : "text-white/70"}`}>{label}</div>
        {description && <div className="text-white/30 text-xs mt-0.5">{description}</div>}
      </div>
    </button>
  );
}

export default function ProgramFormModal({ program, onSave, onClose }) {
  const [form, setForm] = useState(() => program ? { ...createDefaultProgram(program.program_type), ...program } : createDefaultProgram("custom"));
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.membership_number_prefix.trim()) return;
    setSaving(true);
    // Convert date inputs to ISO strings
    const payload = { ...form };
    if (payload.campaign_start_date && typeof payload.campaign_start_date === "string" && !payload.campaign_start_date.includes("T")) {
      payload.campaign_start_date = new Date(payload.campaign_start_date).toISOString();
    }
    if (payload.campaign_end_date && typeof payload.campaign_end_date === "string" && !payload.campaign_end_date.includes("T")) {
      payload.campaign_end_date = new Date(payload.campaign_end_date).toISOString();
    }
    // Strip built-in fields
    const { id, created_date, updated_date, created_by_id, ...cleanPayload } = payload;
    await onSave(cleanPayload);
    setSaving(false);
  };

  // Convert ISO dates to yyyy-MM-dd for date inputs
  const toDateInput = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toISOString().split("T")[0]; } catch { return ""; }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
            <h3 className="text-lg font-bold text-white">{program ? "Edit Program" : "Create Membership Program"}</h3>
            <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium">Basic Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Program Name *</label>
                  <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Founding Member Program" required />
                </div>
                <div>
                  <label className={labelClass}>Program Type</label>
                  <select className={inputClass} value={form.program_type} onChange={(e) => {
                    const meta = PROGRAM_TYPES[e.target.value];
                    if (meta) {
                      setForm((prev) => ({ ...prev, program_type: e.target.value, icon: prev.icon || meta.icon, color: prev.color || meta.color, badge_color: prev.badge_color || meta.color, membership_number_prefix: prev.membership_number_prefix || meta.prefix }));
                    } else {
                      update("program_type", e.target.value);
                    }
                  }}>
                    {Object.entries(PROGRAM_TYPES).map(([key, val]) => (
                      <option key={key} value={key} className="bg-[#0d0d14]">{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Number Prefix *</label>
                  <input className={inputClass} value={form.membership_number_prefix} onChange={(e) => update("membership_number_prefix", e.target.value.toUpperCase().slice(0, 4))} placeholder="FM" required />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea className={`${inputClass} h-auto py-2 resize-none`} rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What is this program about?" />
                </div>
                <div>
                  <label className={labelClass}>Icon (emoji)</label>
                  <input className={inputClass} value={form.icon} onChange={(e) => update("icon", e.target.value)} placeholder="🏆" />
                </div>
                <div>
                  <label className={labelClass}>Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer" value={form.color} onChange={(e) => update("color", e.target.value)} />
                    <input className={inputClass} value={form.color} onChange={(e) => update("color", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign */}
            <div className="space-y-3">
              <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium">Campaign & Capacity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Campaign Start</label>
                  <input type="date" className={inputClass} value={toDateInput(form.campaign_start_date)} onChange={(e) => update("campaign_start_date", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Campaign End</label>
                  <input type="date" className={inputClass} value={toDateInput(form.campaign_end_date)} onChange={(e) => update("campaign_end_date", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Max Participants (0 = unlimited)</label>
                  <input type="number" min="0" className={inputClass} value={form.max_participants} onChange={(e) => update("max_participants", Number(e.target.value))} />
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input type="number" min="0" className={inputClass} value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} />
                </div>
              </div>
              <Toggle checked={form.is_active} onChange={(v) => update("is_active", v)} label="Program Active" description="Inactive programs are hidden and cannot accept new enrollments" />
            </div>

            {/* Pricing & Duration */}
            <div className="space-y-3">
              <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium">Pricing & Benefits Duration</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Discount Percentage</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" className={inputClass} value={form.discount_percentage} onChange={(e) => update("discount_percentage", Number(e.target.value))} />
                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Benefit Duration</label>
                  <select className={inputClass} value={form.benefit_duration_type} onChange={(e) => update("benefit_duration_type", e.target.value)}>
                    <option value="lifetime" className="bg-[#0d0d14]">Lifetime</option>
                    <option value="time_limited" className="bg-[#0d0d14]">Time-Limited</option>
                  </select>
                </div>
                {form.benefit_duration_type === "time_limited" && (
                  <div>
                    <label className={labelClass}>Duration (days)</label>
                    <input type="number" min="1" className={inputClass} value={form.benefit_duration_days} onChange={(e) => update("benefit_duration_days", Number(e.target.value))} />
                  </div>
                )}
              </div>
              <Toggle checked={form.lifetime_pricing_protection} onChange={(v) => update("lifetime_pricing_protection", v)} label="Lifetime Pricing Protection" description="Locked-in pricing even if subscription prices increase in the future" />
            </div>

            {/* Perks & Benefits */}
            <div className="space-y-3">
              <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium">Exclusive Perks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BENEFIT_FIELDS.map((b) => (
                  <Toggle key={b.key} checked={form[b.key]} onChange={(v) => update(b.key, v)} label={b.label} description={b.description} />
                ))}
              </div>
              {form.referral_bonus_enabled && (
                <div>
                  <label className={labelClass}>Referral Bonus Amount ($)</label>
                  <input type="number" min="0" className={inputClass} value={form.referral_bonus_amount} onChange={(e) => update("referral_bonus_amount", Number(e.target.value))} />
                </div>
              )}
            </div>

            {/* Badge & Identity */}
            <div className="space-y-3">
              <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium">Badge & Identity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Exclusive Badge Name</label>
                  <input className={inputClass} value={form.exclusive_badge} onChange={(e) => update("exclusive_badge", e.target.value)} placeholder="e.g. Founding Member" />
                </div>
                <div>
                  <label className={labelClass}>Badge Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer" value={form.badge_color} onChange={(e) => update("badge_color", e.target.value)} />
                    <input className={inputClass} value={form.badge_color} onChange={(e) => update("badge_color", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${form.badge_color}20`, border: `1px solid ${form.badge_color}40` }}>
                  {form.icon}
                </div>
                <div>
                  <div className="text-white/80 text-sm font-medium">{form.exclusive_badge || form.name || "Badge Preview"}</div>
                  <div className="text-white/30 text-xs font-mono">{form.membership_number_prefix}-000001</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5 sticky bottom-0 bg-[#0d0d14]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white/40 hover:text-white/70 text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving || !form.name.trim() || !form.membership_number_prefix.trim()} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {program ? "Save Changes" : "Create Program"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}