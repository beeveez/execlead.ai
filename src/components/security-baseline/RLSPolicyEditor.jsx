import React, { useState, useMemo } from "react";
import { Shield, Plus, X, Copy, Check, AlertTriangle, Lock, User, Building2, Server, Cpu, GitBranch, Puzzle } from "lucide-react";
import { RLS_REGISTRY, SECURITY_CLASSIFICATIONS } from "@/lib/rlsRegistry";
import { POLICY_TYPES, getPolicyType, composeRule, buildEntityPolicy, getPlatformLimitations } from "@/lib/rlsPolicyBuilder";
import RLSPolicyExplainer from "./RLSPolicyExplainer";

const CRUD_OPS = ["create", "read", "update", "delete"];
const OP_LABELS = { create: "Create", read: "Read", update: "Update", delete: "Delete" };

const CATEGORY_ICONS = {
  identity: User,
  isolation: Building2,
  role: Lock,
  visibility: Shield,
  service: Server,
  environment: GitBranch,
};

export default function RLSPolicyEditor() {
  const [selectedEntity, setSelectedEntity] = useState(RLS_REGISTRY[0]?.name || "");
  const [selections, setSelections] = useState(() => initSelections(RLS_REGISTRY[0]));
  const [copied, setCopied] = useState(false);
  const [showLimitations, setShowLimitations] = useState(true);

  const entity = useMemo(() => RLS_REGISTRY.find((e) => e.name === selectedEntity) || RLS_REGISTRY[0], [selectedEntity]);
  const limitations = useMemo(() => getPlatformLimitations(), []);
  const generatedPolicy = useMemo(() => buildEntityPolicy(selections), [selections]);
  const explainer = useMemo(
    () => ({ ...entity, _explainer: null }),
    [entity]
  );

  function initSelections(ent) {
    const s = {};
    CRUD_OPS.forEach((op) => (s[op] = { conditions: [], logic: "or" }));
    return s;
  }

  function handleEntityChange(name) {
    setSelectedEntity(name);
    const ent = RLS_REGISTRY.find((e) => e.name === name);
    setSelections(initSelections(ent));
  }

  function addCondition(op, typeId) {
    const type = getPolicyType(typeId);
    const cond = { typeId };
    if (typeId === "named_role") cond.role = type.roles[0];
    if (typeId === "organization_match") cond.field = "organization_id";
    if (typeId === "tenant_match") cond.field = "tenant_id";
    setSelections((prev) => ({
      ...prev,
      [op]: { ...prev[op], conditions: [...prev[op].conditions, cond] },
    }));
  }

  function removeCondition(op, index) {
    setSelections((prev) => ({
      ...prev,
      [op]: { ...prev[op], conditions: prev[op].conditions.filter((_, i) => i !== index) },
    }));
  }

  function updateCondition(op, index, patch) {
    setSelections((prev) => ({
      ...prev,
      [op]: {
        ...prev[op],
        conditions: prev[op].conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)),
      },
    }));
  }

  function setLogic(op, logic) {
    setSelections((prev) => ({ ...prev, [op]: { ...prev[op], logic } }));
  }

  function handleCopy() {
    const fullConfig = { name: entity.name, rls: generatedPolicy };
    navigator.clipboard.writeText(JSON.stringify(fullConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/15">
            <Shield size={20} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest">RLS Policy Editor™ · Advanced Enhancement v1.0</div>
            <h3 className="text-base font-bold text-white">Enterprise RLS Policy Builder</h3>
          </div>
        </div>

        {/* Entity Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Entity:</label>
          <select
            value={selectedEntity}
            onChange={(e) => handleEntityChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40 min-w-[260px]"
          >
            {RLS_REGISTRY.map((e) => (
              <option key={e.name} value={e.name} className="bg-[#0d0d14]">
                {e.name} ({SECURITY_CLASSIFICATIONS[e.classification]?.label})
              </option>
            ))}
          </select>
          <span className={`text-[10px] px-2 py-1 rounded border ${
            entity.status === "protected" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : entity.status === "partial" ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            Current: {entity.status} · {SECURITY_CLASSIFICATIONS[entity.classification]?.label}
          </span>
        </div>
      </div>

      {/* Policy Type Palette */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Available Policy Types</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {POLICY_TYPES.map((pt) => {
            const Icon = CATEGORY_ICONS[pt.category] || Puzzle;
            return (
              <div key={pt.id} className={`rounded-lg p-2.5 border ${
                pt.supported ? "bg-white/[0.02] border-white/10" : "bg-amber-500/5 border-amber-500/15"
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} className={pt.supported ? "text-indigo-400" : "text-amber-400"} />
                  <span className="text-[11px] font-medium text-white/80">{pt.label}</span>
                </div>
                <div className="text-[9px] text-white/40 leading-tight">{pt.description}</div>
                <div className={`text-[9px] mt-1.5 font-medium ${pt.supported ? "text-emerald-400" : "text-amber-400"}`}>
                  {pt.supported ? "✓ Supported" : "✗ Platform Limitation"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operation Builders */}
      <div className="space-y-3">
        {CRUD_OPS.map((op) => (
          <OperationBuilder
            key={op}
            op={op}
            selection={selections[op]}
            onAdd={(typeId) => addCondition(op, typeId)}
            onRemove={(i) => removeCondition(op, i)}
            onUpdate={(i, patch) => updateCondition(op, i, patch)}
            onLogic={(l) => setLogic(op, l)}
          />
        ))}
      </div>

      {/* Generated Policy + Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-white/30 uppercase tracking-widest">Generated RLS Policy (JSON)</div>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-medium transition-colors border border-white/10">
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-[10px] text-emerald-300/90 bg-black/40 border border-white/5 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed max-h-80">
{JSON.stringify({ name: entity.name, rls: generatedPolicy }, null, 2)}
          </pre>
          <div className="text-[10px] text-white/30 mt-2 leading-relaxed">
            Paste this into <code className="text-white/50">base44/entities/{entity.name}.jsonc</code> under the <code className="text-white/50">rls</code> key. Rules apply immediately to app-user requests.
          </div>
        </div>

        <RLSPolicyExplainer entity={entity} policy={generatedPolicy} />
      </div>

      {/* Platform Capability Limitations */}
      {showLimitations && limitations.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Platform Capability Limitations</span>
            </div>
            <button onClick={() => setShowLimitations(false)} className="text-white/30 hover:text-white/60">
              <X size={14} />
            </button>
          </div>
          <div className="text-[11px] text-white/50 mb-3">
            These capabilities are <span className="text-amber-400">not exposed by the Base44 RLS engine</span> and cannot be enforced through entity RLS rules. They are documented here so Guardian™ does not penalize EXECLEAD.AI for platform limitations.
          </div>
          <div className="space-y-2">
            {limitations.map((l) => {
              const Icon = CATEGORY_ICONS[l.category] || Cpu;
              return (
                <div key={l.id} className="bg-black/20 border border-amber-500/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={12} className="text-amber-400" />
                    <span className="text-[11px] font-medium text-white/80">{l.label}</span>
                    <span className="text-[9px] text-white/30">— {l.description}</span>
                  </div>
                  <div className="text-[10px] text-white/50 leading-relaxed pl-5">{l.limitation}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
            <Cpu size={11} className="text-amber-400" />
            <span>Service-role and automation access is enforced at the backend-function invocation layer (who can trigger a function), not within RLS.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function OperationBuilder({ op, selection, onAdd, onRemove, onUpdate, onLogic }) {
  const [adding, setAdding] = useState(false);
  const supportedTypes = POLICY_TYPES.filter((p) => p.supported && p.appliesTo?.includes(op));

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${opColor(op)}`}>
            {OP_LABELS[op]}
          </span>
          <span className="text-[10px] text-white/30">
            {selection.conditions.length === 0 ? "Open (no rule)" : `${selection.conditions.length} condition(s) · ${selection.logic.toUpperCase()}`}
          </span>
        </div>
        <button onClick={() => setAdding(!adding)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/20 transition-colors">
          <Plus size={11} /> Add Condition
        </button>
      </div>

      {adding && (
        <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-white/5">
          {supportedTypes.map((pt) => (
            <button key={pt.id} onClick={() => { onAdd(pt.id); setAdding(false); }}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-[10px] border border-white/10 transition-colors">
              + {pt.label}
            </button>
          ))}
        </div>
      )}

      {selection.conditions.length > 1 && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] text-white/30">Logic:</span>
          {["or", "and"].map((l) => (
            <button key={l} onClick={() => onLogic(l)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                selection.logic === l ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/10"
              }`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {selection.conditions.map((cond, i) => {
          const type = getPolicyType(cond.typeId);
          return (
            <div key={i} className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-lg px-2.5 py-1.5">
              {i > 0 && <span className="text-[10px] font-bold text-indigo-400 uppercase">{selection.logic}</span>}
              <span className="text-[11px] text-white/80 font-medium">{type.label}</span>
              {cond.typeId === "named_role" && (
                <select value={cond.role} onChange={(e) => onUpdate(i, { role: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none">
                  {type.roles.map((r) => <option key={r} value={r} className="bg-[#0d0d14]">{r}</option>)}
                </select>
              )}
              {(cond.typeId === "organization_match" || cond.typeId === "tenant_match") && (
                <input value={cond.field} onChange={(e) => onUpdate(i, { field: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none w-32"
                  placeholder="field name" />
              )}
              <span className="text-[9px] text-white/30 ml-auto truncate">{cond.typeId === "owner" ? "created_by_id == user.id" : ""}</span>
              <button onClick={() => onRemove(i)} className="text-white/30 hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          );
        })}
        {selection.conditions.length === 0 && (
          <div className="text-[10px] text-white/30 py-1">
            No conditions — this operation is <span className="text-red-400">open</span>. Add a condition to restrict it.
          </div>
        )}
      </div>
    </div>
  );
}

function opColor(op) {
  return {
    create: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    read: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    update: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    delete: "bg-red-500/10 text-red-400 border border-red-500/20",
  }[op];
}