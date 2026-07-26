import React from "react";
import DomainCard from "./DomainCard";

export default function DomainGrid({ domains }) {
  const passedCount = domains.filter((d) => d.passedGate).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Certification Domains</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {passedCount} of {domains.length} domains passed — click any domain to view checks
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  );
}