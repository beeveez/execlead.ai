import React, { useState, useEffect } from "react";
import { canShowLogo } from "@/lib/legalCompliance";
import { getBrandColors, getCompanyInitials } from "@/lib/companyLogo";

const SIZES = {
  xs: { box: "w-6 h-6 rounded-md", text: "text-[10px]", img: "p-0.5" },
  sm: { box: "w-8 h-8 rounded-lg", text: "text-xs", img: "p-1" },
  md: { box: "w-11 h-11 rounded-lg", text: "text-sm", img: "p-1.5" },
  lg: { box: "w-16 h-16 rounded-xl", text: "text-xl", img: "p-2" },
  xl: { box: "w-24 h-24 rounded-2xl", text: "text-3xl", img: "p-3" },
};

/**
 * Resilient company logo with skeleton loading and branded fallback avatar.
 * Workflow: skeleton → attempt load → logo (success) | fallback avatar (fail).
 */
export default function CompanyLogo({ company, size = "md", className = "", showSkeleton = true }) {
  const s = SIZES[size] || SIZES.md;
  const logoUrl = company?.logo_url;
  const logoAllowed = canShowLogo(company);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!logoUrl || !logoAllowed) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = logoUrl;
    return () => { img.onload = null; img.onerror = null; };
  }, [logoUrl, logoAllowed]);

  const colors = getBrandColors(company?.name || "");
  const initials = getCompanyInitials(company?.name || "");

  if (status === "loading" && showSkeleton) {
    return <div className={`${s.box} bg-white/5 animate-pulse shrink-0 ${className}`} />;
  }

  if (status === "loaded" && logoAllowed) {
    return (
      <img
        src={logoUrl}
        alt={company?.name || "Company logo"}
        className={`${s.box} object-contain bg-white/5 ${s.img} shrink-0 ${className}`}
        onError={() => setStatus("error")}
      />
    );
  }

  // Branded fallback avatar: initials + brand gradient + rounded square
  return (
    <div
      className={`${s.box} flex items-center justify-center font-bold text-white ${s.text} shrink-0 ${className}`}
      style={{ background: colors.gradient }}
    >
      {initials}
    </div>
  );
}