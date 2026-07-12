import React from "react";
import SectionCard from "./SectionCard";
import { Boxes } from "lucide-react";

const STATUS_META = {
  healthy: { label: "Healthy", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  attention: { label: "Attention Needed", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400" },
  blocked: { label: "Blocked", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400" },
};

export default function ProductStatus({ products }) {
  const counts = products.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
  return (
    <SectionCard
      title="Product Status"
      subtitle={`${counts.healthy || 0} healthy · ${counts.attention || 0} attention · ${counts.blocked || 0} blocked`}
      icon={Boxes}
      accent="amber"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {products.map((mod) => {
          const meta = STATUS_META[mod.status] || STATUS_META.blocked;
          return (
            <div key={mod.id} className={`rounded-lg border p-3 ${meta.bg} border-white/5`}>
              <div className="text-xs font-medium text-white mb-1">{mod.name}</div>
              <div className={`text-[10px] ${meta.text}`}>{meta.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{mod.detail}</div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}