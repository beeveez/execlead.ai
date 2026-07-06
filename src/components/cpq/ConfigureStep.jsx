import React from "react";
import SeatSelector from "./SeatSelector";
import ModuleSelector from "./ModuleSelector";
import PackageSelector from "./PackageSelector";
import { Calendar, Tag, Globe, Shield } from "lucide-react";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Icon size={12} /> {title}
      </h3>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50";

export default function ConfigureStep({ config, updateConfig, catalog }) {
  const { modules, seatTiers, aiPackages, supportPackages, discountRules, currencies, taxRules } = catalog;

  const toggleModule = (id) => {
    const ids = config.moduleIds.includes(id) ? config.moduleIds.filter(x => x !== id) : [...config.moduleIds, id];
    updateConfig("moduleIds", ids);
  };

  const toggleService = (id) => {
    const ids = config.serviceIds.includes(id) ? config.serviceIds.filter(x => x !== id) : [...config.serviceIds, id];
    updateConfig("serviceIds", ids);
  };

  return (
    <div className="space-y-5">
      <Section title="Seats" icon={Calendar}>
        <SeatSelector seats={config.seats} onChange={(v) => updateConfig("seats", v)} seatTiers={seatTiers} />
      </Section>

      <Section title="Modules" icon={Tag}>
        <ModuleSelector modules={modules} selectedIds={config.moduleIds} onToggle={toggleModule} type="module" />
      </Section>

      <Section title="AI Package" icon={Tag}>
        <PackageSelector packages={aiPackages} selectedId={config.aiPackageId} onSelect={(id) => updateConfig("aiPackageId", id)} type="ai" />
      </Section>

      <Section title="Support Package" icon={Tag}>
        <PackageSelector packages={supportPackages} selectedId={config.supportPackageId} onSelect={(id) => updateConfig("supportPackageId", id)} type="support" />
      </Section>

      <Section title="Professional Services" icon={Tag}>
        <ModuleSelector modules={modules} selectedIds={config.serviceIds} onToggle={toggleService} type="service" />
      </Section>

      <Section title="Add-ons & Integrations" icon={Tag}>
        <ModuleSelector modules={modules} selectedIds={config.serviceIds} onToggle={toggleService} type="addon" />
      </Section>

      <Section title="Contract & Currency" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Contract Length</label>
            <div className="flex gap-2">
              {[1, 2, 3, 5].map(y => (
                <button key={y} onClick={() => updateConfig("contractLength", y)} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${config.contractLength === y ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "bg-white/5 border border-white/10 text-white/40 hover:text-white/70"}`}>
                  {y}yr
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Currency</label>
            <select value={config.currency} onChange={e => updateConfig("currency", e.target.value)} className={inputClass}>
              {(currencies || []).map(c => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.code} ({c.symbol})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Tax Region</label>
            <select value={config.country} onChange={e => updateConfig("country", e.target.value)} className={inputClass}>
              {(taxRules || []).map(t => <option key={t.country_code} value={t.country_code} className="bg-[#0d0d14]">{t.country_name} ({(t.rate * 100).toFixed(0)}%)</option>)}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input type="checkbox" checked={config.taxExempt} onChange={e => updateConfig("taxExempt", e.target.checked)} className="w-4 h-4 rounded accent-indigo-500" />
          <span className="text-white/60 text-sm">Tax-exempt organization</span>
        </label>
      </Section>

      <Section title="Discount" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Discount Type</label>
            <select value={config.discountRuleId || ""} onChange={e => updateConfig("discountRuleId", e.target.value || null)} className={inputClass}>
              <option value="" className="bg-[#0d0d14]">No discount</option>
              {(discountRules || []).filter(r => r.is_active).map(r => <option key={r.rule_id} value={r.rule_id} className="bg-[#0d0d14]">{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Custom Discount Value (%)</label>
            <input type="number" min="0" max="100" value={config.discountValue || ""} onChange={e => updateConfig("discountValue", parseFloat(e.target.value) || 0)} placeholder="0" className={inputClass} />
          </div>
        </div>
      </Section>
    </div>
  );
}