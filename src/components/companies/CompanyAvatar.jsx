import React from "react";
import { canShowLogo } from "@/lib/legalCompliance";

const SIZES = {
  sm: { box: "w-8 h-8 rounded-lg", text: "text-xs", img: "p-1" },
  md: { box: "w-11 h-11 rounded-lg", text: "text-sm", img: "p-1.5" },
  lg: { box: "w-16 h-16 rounded-xl", text: "text-xl", img: "p-2" },
};

export default function CompanyAvatar({ company, size = "md", className = "" }) {
  const s = SIZES[size] || SIZES.md;
  const initials = (company?.name || "?").slice(0, 2).toUpperCase();
  const showLogo = canShowLogo(company);

  if (showLogo) {
    return (
      <img
        src={company.logo_url}
        alt={company.name}
        className={`${s.box} object-contain bg-white/5 ${s.img} ${className}`}
      />
    );
  }

  return (
    <div className={`${s.box} bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold ${s.text} shrink-0 ${className}`}>
      {initials}
    </div>
  );
}