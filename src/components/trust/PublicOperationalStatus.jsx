import React from "react";
import { Clock3 } from "lucide-react";

export default function PublicOperationalStatus() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
      <div className="flex items-start gap-3">
        <Clock3 size={18} className="mt-0.5 shrink-0 text-amber-300" />
        <div>
          <h3 className="text-sm font-semibold text-white">Public status reporting is in progress</h3>
          <p className="mt-2 text-xs leading-6 text-white/55">A customer-facing service status view is being prepared. This page does not claim independently verified uptime or current service availability until that reporting is connected.</p>
        </div>
      </div>
    </div>
  );
}