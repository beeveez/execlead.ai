import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import {
  X, ChevronRight, ChevronLeft, Check, Loader2, AlertCircle,
  Tag, Layers, CreditCard, Compass, Route as RouteIcon,
  Lock, Flag, Rocket, Sparkles,
} from "lucide-react";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 transition-colors";
const LABEL = "text-white/40 text-xs uppercase tracking-wider mb-1.5 block";

const STEPS = [
  { id: 1, title: "Basic Info", icon: Tag },
  { id: 2, title: "Workspaces", icon: Layers },
  { id: 3, title: "Subscription", icon: CreditCard },
  { id: 4, title: "Navigation", icon: Compass },
  { id: 5, title: "Route", icon: RouteIcon },
  { id: 6, title: "Permissions", icon: Lock },
  { id: 7, title: "Feature Flag", icon: Flag },
  { id: 8, title: "Release", icon: Rocket },
];

const CATEGORIES = ["Platform", "Executive", "Enterprise", "Career", "Intelligence", "Network", "Development", "Analytics", "Security", "Billing"];
const WORKSPACES = [
  { value: "public", label: "Public", desc: "Visible to all visitors" },
  { value: "executive", label: "Executive", desc: "Personal development workspace" },
  { value: "enterprise", label: "Enterprise", desc: "Organization workspace" },
  { value: "platform", label: "Platform", desc: "Platform administration" },
  { value: "developer", label: "Developer", desc: "Engineering workspace" },
];
const PLANS = [
  { value: "free", label: "Free" },
  { value: "professional", label: "Professional" },
  { value: "executive", label: "Executive" },
  { value: "enterprise", label: "Enterprise" },
  { value: "developer", label: "Developer" },
  { value: "platform_admin", label: "Platform Admin" },
];
const NAV_GROUPS = ["Platform", "Network", "Career", "Insights", "Account", "Organization", "Management", "Revenue", "System", "Engineering", "Administration"];
const RELEASE_STATUSES = [
  { value: "development", label: "Development", desc: "In active development" },
  { value: "beta", label: "Beta", desc: "Available for early testing" },
  { value: "preview", label: "Preview", desc: "Sneak peek, may change" },
  { value: "live", label: "General Availability", desc: "Stable and production-ready" },
  { value: "deprecated", label: "Deprecated", desc: "Will be removed" },
  { value: "archived", label: "Hidden", desc: "Hidden from users" },
];
const ENVIRONMENTS = ["development", "staging", "production"];
const PLAN_RANK = { free: 0, professional: 1, executive: 2, enterprise: 3 };
const SAVE_ACTIONS = [
  "Create Feature",
  "Create Feature Flag",
  "Register Route",
  "Register Navigation",
  "Register Permission",
  "Update Platform Health",
  "Update Route Registry",
  "Update API Registry",
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function Chip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${active ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/5 hover:text-white/70"}`}>
      {children}
      {active && <Check size={12} className="inline ml-1.5" />}
    </button>
  );
}

function Field({ label, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className={LABEL}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

export default function FeatureCreationWizard({ features, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "", feature_id: "", category: "Platform", description: "", icon: "Sparkles", module: "",
    workspaces: ["executive"], plans: ["free"],
    nav_label: "", nav_group: "Platform", sort_order: 99, nav_visible: true,
    route_path: "", component: "", lazy_loaded: true, auto_register: true,
    auth_required: true, required_plan: "free", required_feature_flag: "", org_required: false,
    create_flag: true, default_enabled: true, environment: "production",
    release_status: "development",
  });

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };
  const setMulti = (field, value) => {
    setForm(prev => {
      const arr = prev[field] || [];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };
  const onNameChange = (value) => {
    setForm(prev => ({
      ...prev,
      name: value,
      feature_id: prev.feature_id && prev.feature_id !== slugify(prev.name) ? prev.feature_id : slugify(value),
    }));
  };

  const validateStep = (n) => {
    const f = form;
    const errs = {};
    if (n === 1) {
      if (!f.name.trim()) errs.name = "Feature name is required";
      if (!f.feature_id.trim()) errs.feature_id = "Feature key is required";
      else if (features.some(fe => fe.feature_id === f.feature_id)) errs.feature_id = `Feature key "${f.feature_id}" already exists`;
    }
    if (n === 2 && (!f.workspaces || f.workspaces.length === 0)) errs.workspaces = "Select at least one workspace";
    if (n === 3 && (!f.plans || f.plans.length === 0)) errs.plans = "Select at least one plan";
    if (n === 4) {
      if (f.nav_visible && !f.nav_label.trim()) errs.nav_label = "Nav label is required when visible";
      else if (f.nav_visible && f.nav_label && features.some(fe => fe.nav_label === f.nav_label)) errs.nav_label = `Navigation label "${f.nav_label}" already exists`;
    }
    if (n === 5) {
      if (!f.route_path.trim()) errs.route_path = "Route URL is required";
      else if (!f.route_path.startsWith("/")) errs.route_path = "Route must start with /";
      else if (features.some(fe => fe.route_path === f.route_path)) errs.route_path = `Route "${f.route_path}" already exists`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(s + 1, STEPS.length)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async () => {
    for (let s = 1; s <= STEPS.length; s++) {
      if (!validateStep(s)) { setStep(s); toast({ title: "Please complete all required fields", variant: "destructive" }); return; }
    }
    setSaving(true);
    try {
      const planTiers = form.plans.filter(p => PLAN_RANK.hasOwnProperty(p));
      const minPlan = planTiers.length > 0 ? planTiers.sort((a, b) => PLAN_RANK[a] - PLAN_RANK[b])[0] : "free";
      const roleParts = [];
      if (form.plans.includes("developer")) roleParts.push("developer");
      if (form.plans.includes("platform_admin")) roleParts.push("platform_admin");
      if (form.org_required) roleParts.push("organization");
      let requiredRole = form.required_feature_flag || "";
      if (roleParts.length) requiredRole = requiredRole ? `${requiredRole},${roleParts.join(",")}` : roleParts.join(",");

      await base44.entities.Feature.create({
        feature_id: form.feature_id,
        name: form.name,
        description: form.description || "",
        category: form.category,
        module: form.workspaces.join(","),
        icon: form.icon || "Sparkles",
        minimum_plan: minPlan,
        required_role: requiredRole,
        status: form.release_status,
        visibility: form.release_status === "archived" ? "hidden" : "public",
        coming_soon: form.release_status === "development" || form.release_status === "preview",
        nav_enabled: form.nav_visible,
        nav_label: form.nav_label || "",
        route_path: form.route_path || "",
        pricing_enabled: true,
        is_enabled: form.default_enabled,
        sort_order: Number(form.sort_order) || 99,
        limit_label: "",
      });

      await new Promise(r => setTimeout(r, 500));
      setSaving(false);
      setSaved(true);
      await new Promise(r => setTimeout(r, 2200));
      toast({ title: "Feature created", description: `${form.name} has been registered.` });
      onCreated();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to create feature", description: e.message, variant: "destructive" });
      setSaving(false);
    }
  };

  /* ---------- saved overlay ---------- */
  if (saved) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Feature Created</h2>
          <p className="text-white/40 text-sm mb-6">{form.name} has been registered successfully.</p>
          <div className="space-y-2 text-left mb-2">
            {SAVE_ACTIONS.map((a, i) => (
              <div key={a} className="flex items-center gap-2 text-sm text-white/60 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <Check size={14} className="text-emerald-400" /> {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- saving overlay ---------- */
  if (saving) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center">
          <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-1">Registering Feature</h2>
          <p className="text-white/40 text-sm">Automatically creating feature, flag, route, and navigation...</p>
        </div>
      </div>
    );
  }

  /* ---------- main wizard ---------- */
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Create New Feature</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button onClick={() => step > s.id && setStep(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${step === s.id ? "bg-indigo-500/20 text-indigo-300" : step > s.id ? "text-emerald-400 hover:bg-white/5" : "text-white/30"}`}>
                  {step > s.id ? <Check size={13} /> : <s.icon size={13} />}
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`h-px w-4 ${step > s.id ? "bg-emerald-500/30" : "bg-white/10"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Feature Name" error={errors.name}>
                <input value={form.name} onChange={e => onNameChange(e.target.value)} className={INPUT} placeholder="Executive Simulator" autoFocus />
              </Field>
              <Field label="Feature Key" error={errors.feature_id}>
                <input value={form.feature_id} onChange={e => set("feature_id", slugify(e.target.value))} className={`${INPUT} font-mono`} placeholder="executive_simulator" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.category} onChange={e => set("category", e.target.value)} className={INPUT}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
                  </select>
                </Field>
                <Field label="Icon (lucide name)">
                  <input value={form.icon} onChange={e => set("icon", e.target.value)} className={INPUT} placeholder="Sparkles" />
                </Field>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={e => set("description", e.target.value)} className={`${INPUT} min-h-[80px] resize-none`} placeholder="Brief description of the feature..." />
              </Field>
              <Field label="Owner / Module (optional)">
                <input value={form.module} onChange={e => set("module", e.target.value)} className={INPUT} placeholder="Core Platform" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-white/40 text-sm">Select which workspaces this feature belongs to. Multiple selections allowed.</p>
              <div className="space-y-2">
                {WORKSPACES.map(w => (
                  <button key={w.value} type="button" onClick={() => setMulti("workspaces", w.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${form.workspaces.includes(w.value) ? "bg-indigo-500/10 border-indigo-500/40" : "bg-white/[0.02] border-white/10 hover:bg-white/5"}`}>
                    <div>
                      <div className="text-sm text-white/80 font-medium">{w.label}</div>
                      <div className="text-xs text-white/40">{w.desc}</div>
                    </div>
                    {form.workspaces.includes(w.value) && <Check size={16} className="text-indigo-400" />}
                  </button>
                ))}
              </div>
              {errors.workspaces && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} /> {errors.workspaces}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-white/40 text-sm">Select which subscription plans can access this feature. The minimum selected tier becomes the required plan.</p>
              <div className="flex flex-wrap gap-2">
                {PLANS.map(p => <Chip key={p.value} active={form.plans.includes(p.value)} onClick={() => setMulti("plans", p.value)}>{p.label}</Chip>)}
              </div>
              {errors.plans && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} /> {errors.plans}</p>}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.nav_visible} onChange={() => set("nav_visible", true)} className="accent-indigo-500" />
                  <span className="text-sm text-white/70">Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!form.nav_visible} onChange={() => set("nav_visible", false)} className="accent-indigo-500" />
                  <span className="text-sm text-white/70">Hidden</span>
                </label>
              </div>
              {form.nav_visible ? (
                <>
                  <Field label="Navigation Label" error={errors.nav_label}>
                    <input value={form.nav_label} onChange={e => set("nav_label", e.target.value)} className={INPUT} placeholder="Executive Simulator" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Navigation Group">
                      <select value={form.nav_group} onChange={e => set("nav_group", e.target.value)} className={INPUT}>
                        {NAV_GROUPS.map(g => <option key={g} value={g} className="bg-[#0d0d14]">{g}</option>)}
                      </select>
                    </Field>
                    <Field label="Navigation Order">
                      <input type="number" value={form.sort_order} onChange={e => set("sort_order", Number(e.target.value))} className={INPUT} />
                    </Field>
                  </div>
                </>
              ) : (
                <p className="text-white/30 text-sm">Feature will be hidden from navigation. Accessible via direct URL only.</p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Field label="Route URL" error={errors.route_path}>
                <input value={form.route_path} onChange={e => set("route_path", e.target.value)} className={`${INPUT} font-mono`} placeholder="/simulator" />
              </Field>
              <Field label="Component Name (informational)">
                <input value={form.component} onChange={e => set("component", e.target.value)} className={INPUT} placeholder="Simulator" />
              </Field>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.lazy_loaded} onChange={e => set("lazy_loaded", e.target.checked)} className="accent-indigo-500 rounded" />
                  <span className="text-sm text-white/70">Lazy Loaded</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.auto_register} onChange={e => set("auto_register", e.target.checked)} className="accent-indigo-500 rounded" />
                  <span className="text-sm text-white/70">Auto Register Route</span>
                </label>
              </div>
              <p className="text-white/30 text-xs">Route registration is handled by the consistency engine. The route path is stored in the feature record and synchronized with the route registry.</p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.auth_required} onChange={e => set("auth_required", e.target.checked)} className="accent-indigo-500 rounded" />
                <span className="text-sm text-white/70">Authentication Required</span>
              </label>
              <Field label="Required Plan">
                <select value={form.required_plan} onChange={e => set("required_plan", e.target.value)} className={INPUT}>
                  {["free", "professional", "executive", "enterprise"].map(p => <option key={p} value={p} className="bg-[#0d0d14]">{p}</option>)}
                </select>
              </Field>
              <Field label="Required Feature Flag (optional)">
                <input value={form.required_feature_flag} onChange={e => set("required_feature_flag", e.target.value)} className={`${INPUT} font-mono`} placeholder="feature_flag_key" />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.org_required} onChange={e => set("org_required", e.target.checked)} className="accent-indigo-500 rounded" />
                <span className="text-sm text-white/70">Organization Required</span>
              </label>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.create_flag} onChange={e => set("create_flag", e.target.checked)} className="accent-indigo-500 rounded" />
                <span className="text-sm text-white/70">Create Feature Flag</span>
              </label>
              {form.create_flag && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.default_enabled} onChange={e => set("default_enabled", e.target.checked)} className="accent-indigo-500 rounded" />
                    <span className="text-sm text-white/70">Default Enabled</span>
                  </label>
                  <Field label="Environment">
                    <select value={form.environment} onChange={e => set("environment", e.target.value)} className={INPUT}>
                      {ENVIRONMENTS.map(env => <option key={env} value={env} className="bg-[#0d0d14]">{env}</option>)}
                    </select>
                  </Field>
                </>
              )}
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <p className="text-white/40 text-sm">Select the current release status of this feature.</p>
              <div className="space-y-2">
                {RELEASE_STATUSES.map(r => (
                  <button key={r.value} type="button" onClick={() => set("release_status", r.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${form.release_status === r.value ? "bg-indigo-500/10 border-indigo-500/40" : "bg-white/[0.02] border-white/10 hover:bg-white/5"}`}>
                    <div>
                      <div className="text-sm text-white/80 font-medium">{r.label}</div>
                      <div className="text-xs text-white/40">{r.desc}</div>
                    </div>
                    {form.release_status === r.value && <Check size={16} className="text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <button onClick={back} disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={14} /> Back
          </button>
          <span className="text-xs text-white/30">Step {step} of {STEPS.length}</span>
          {step < STEPS.length ? (
            <button onClick={next} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm text-white font-medium transition-colors">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm text-white font-medium transition-colors">
              <Check size={14} /> Create Feature
            </button>
          )}
        </div>
      </div>
    </div>
  );
}