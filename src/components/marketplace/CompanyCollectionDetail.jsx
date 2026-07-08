import React from "react";
import { useNavigate } from "react-router-dom";
import ModalShell from "@/components/ui/ModalShell";
import { RESOURCE_TYPES } from "@/lib/companyMarketplace";
import { Building2, ExternalLink, Check, Circle, ArrowRight, Link2 } from "lucide-react";

const MODULE_LINKS = [
  { label: "Executive Coach", icon: "🤖", desc: "AI mentor with company context", route: (c) => `/coach?company=${encodeURIComponent(c.name)}` },
  { label: "Executive Simulator", icon: "🎮", desc: "Company-specific scenarios", route: (c) => `/simulator?company=${encodeURIComponent(c.name)}` },
  { label: "Executive Council", icon: "🏛️", desc: "Board deliberation with company context", route: (c) => `/council?company=${encodeURIComponent(c.name)}` },
  { label: "Resume Intelligence", icon: "📄", desc: "Tailored resume insights", route: (c) => `/resume?company=${encodeURIComponent(c.name)}` },
  { label: "Company Intelligence", icon: "🏢", desc: "Full intelligence profile", route: (c) => `/companies/${c.id}` },
];

export default function CompanyCollectionDetail({ collection, onClose, onFilterMarketplace }) {
  const navigate = useNavigate();
  if (!collection) return null;

  const c = collection;
  const color = c._brandColor || "#6366f1";
  const totalResources = c._resourceCount || 0;
  const availableResources = RESOURCE_TYPES.filter((rt) => (rt.countFrom(c) || 0) > 0).length;

  const handleResourceClick = (rt) => {
    const count = rt.countFrom(c) || 0;
    if (count === 0) return;
    if (rt.key === "marketplace_bundles") {
      onFilterMarketplace?.(c.name);
      onClose();
      return;
    }
    const route = rt.route(c);
    if (route) navigate(route);
  };

  const handleModuleClick = (mod) => navigate(mod.route(c));

  return (
    <ModalShell
      open={!!collection}
      onClose={onClose}
      title={c.name}
      subtitle={`${c.industry || c._category}${c.country ? " • " + c.country : ""} • ${totalResources} resources`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => { onFilterMarketplace?.(c.name); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
          >
            <Building2 size={14} /> Browse Marketplace Items
          </button>
          <button
            onClick={() => navigate(`/companies/${c.id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
          >
            View Full Intelligence <ArrowRight size={14} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Company Header */}
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: color + "20" }}>
            <span className="text-2xl font-bold" style={{ color }}>{(c.name || "?").charAt(0)}</span>
            {c.logo_url && (
              <img
                src={c.logo_url}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold">{c.name}</h3>
              {c._owned && <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium"><Check size={9} /> Owned</span>}
              {c._featured && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">FEATURED</span>}
              {c._pricing.enterpriseIncluded && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium">Enterprise</span>}
            </div>
            {c.description && <p className="text-white/40 text-sm mt-1 line-clamp-2">{c.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
              <span>{availableResources}/{RESOURCE_TYPES.length} resource types</span>
              {c.ceo && <span>• CEO: {c.ceo}</span>}
              {c.company_size && <span>• {c.company_size}</span>}
            </div>
          </div>
        </div>

        {/* Resource Types Grid */}
        <div>
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Executive Learning Ecosystem</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RESOURCE_TYPES.map((rt) => {
              const count = rt.countFrom(c) || 0;
              const available = count > 0;
              return (
                <button
                  key={rt.key}
                  onClick={() => handleResourceClick(rt)}
                  disabled={!available}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    available
                      ? "bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-cyan-500/20 cursor-pointer"
                      : "bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-xl shrink-0">{rt.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 text-sm font-medium truncate">{rt.label}</span>
                      {available ? (
                        <span className="text-[10px] text-cyan-400 font-medium shrink-0">{count} {count === 1 ? "item" : "items"}</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-white/30 shrink-0"><Circle size={7} /> Soon</span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{rt.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-white/20 mt-1">
                      <Link2 size={8} /> {rt.module}
                    </div>
                  </div>
                  {available && <ExternalLink size={12} className="text-white/20 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linked Modules */}
        <div>
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Linked Platform Modules</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MODULE_LINKS.map((mod) => (
              <button
                key={mod.label}
                onClick={() => handleModuleClick(mod)}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 transition-all text-left"
              >
                <span className="text-lg shrink-0">{mod.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-white/80 text-xs font-medium truncate">{mod.label}</div>
                  <div className="text-white/30 text-[10px] truncate">{mod.desc}</div>
                </div>
                <ExternalLink size={11} className="text-white/20 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}