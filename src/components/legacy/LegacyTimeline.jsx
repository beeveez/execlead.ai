import React from "react";
import LegacySection from "@/components/legacy/LegacySection";
import { LEGACY_SECTIONS, SECTION_COLORS } from "@/lib/legacyData";

export default function LegacyTimeline({ legacy, onUpdate }) {
  return (
    <div className="relative">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/30 via-white/5 to-transparent" />
      <div className="space-y-4">
        {LEGACY_SECTIONS.map((section) => (
          <LegacySection
            key={section.id}
            section={section}
            value={legacy?.[section.id]}
            colorClass={SECTION_COLORS[section.color]}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}