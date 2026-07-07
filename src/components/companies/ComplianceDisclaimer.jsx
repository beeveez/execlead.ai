import React from "react";
import { Info, AlertCircle } from "lucide-react";
import { GLOBAL_DISCLAIMER, EXPORT_DISCLAIMER } from "@/lib/legalCompliance";

const VARIANTS = {
  full: { icon: Info, cls: "bg-blue-500/[0.04] border-blue-500/15", iconCls: "text-blue-400", textCls: "text-white/50" },
  compact: { icon: Info, cls: "bg-white/[0.02] border-white/5", iconCls: "text-blue-400/60", textCls: "text-white/40" },
  inline: { icon: AlertCircle, cls: "bg-white/[0.02] border-white/5", iconCls: "text-white/30", textCls: "text-white/30" },
  export: { icon: Info, cls: "bg-blue-500/[0.04] border-blue-500/15", iconCls: "text-blue-400", textCls: "text-white/50" },
};

export default function ComplianceDisclaimer({ variant = "compact", className = "" }) {
  const config = VARIANTS[variant] || VARIANTS.compact;
  const Icon = config.icon;

  if (variant === "export") {
    return (
      <div className={`border rounded-lg p-3 ${config.cls} ${className}`}>
        <div className="flex items-start gap-2">
          <Icon size={14} className={`${config.iconCls} mt-0.5 shrink-0`} />
          <div className="space-y-1">
            {EXPORT_DISCLAIMER.map((line, i) => (
              <p key={i} className={`text-xs leading-relaxed ${config.textCls}`}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Icon size={11} className={config.iconCls} />
        <p className={`text-[11px] leading-tight ${config.textCls}`}>{GLOBAL_DISCLAIMER.compact}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`border rounded-lg p-3 ${config.cls} ${className}`}>
        <div className="flex items-start gap-2">
          <Icon size={14} className={`${config.iconCls} mt-0.5 shrink-0`} />
          <p className={`text-xs leading-relaxed ${config.textCls}`}>{GLOBAL_DISCLAIMER.compact}</p>
        </div>
      </div>
    );
  }

  // full
  return (
    <div className={`border rounded-xl p-4 ${config.cls} ${className}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={16} className={`${config.iconCls} mt-0.5 shrink-0`} />
        <div className="space-y-1.5">
          {GLOBAL_DISCLAIMER.full.map((line, i) => (
            <p key={i} className={`text-xs leading-relaxed ${config.textCls}`}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}