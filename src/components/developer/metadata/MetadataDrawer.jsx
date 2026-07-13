import React from "react";
import { X } from "lucide-react";

/**
 * Shared slide-out drawer shell for the Metadata Governance Center™.
 * Every drill-down (registry, missing entries, orphans, scores) uses this.
 */
export default function MetadataDrawer({ title, subtitle, icon: Icon, onClose, children, footer, maxWidth = "max-w-3xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-[#0a0a0f] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden`}>
        <div className="shrink-0 border-b border-white/10 px-5 py-4 flex items-center gap-3">
          {Icon && <Icon size={18} className="text-indigo-400 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base truncate">{title}</h2>
            {subtitle && <p className="text-white/40 text-xs mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-white/10 px-5 py-3 bg-white/[0.02]">{footer}</div>}
      </div>
    </div>
  );
}