import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { canShowLogo } from "@/lib/legalCompliance";
import { getCachedAvatar } from "@/lib/companyLogo";

const SIZES = {
  xs: { box: "w-6 h-6", rounded: "rounded-md", text: "text-[10px]", img: "p-0.5", icon: 12 },
  sm: { box: "w-8 h-8", rounded: "rounded-lg", text: "text-xs", img: "p-1", icon: 14 },
  md: { box: "w-12 h-12", rounded: "rounded-xl", text: "text-base", img: "p-1.5", icon: 18 },
  lg: { box: "w-16 h-16", rounded: "rounded-2xl", text: "text-xl", img: "p-2", icon: 24 },
  xl: { box: "w-32 h-32", rounded: "rounded-3xl", text: "text-4xl", img: "p-4", icon: 40 },
};

const SHADOW = "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)";

/**
 * Intelligent Company Avatar v2.0
 * Display priority: 1) Official logo  2) Generated avatar  3) Default org icon
 * Broken images are never visible — the avatar renders instantly as the base layer.
 */
export default function CompanyLogo({ company, size = "md", className = "", showSkeleton }) {
  const s = SIZES[size] || SIZES.md;
  const logoUrl = company?.logo_url;
  const logoAllowed = canShowLogo(company);
  const [imgLoaded, setImgLoaded] = useState(false);

  const name = company?.name || "";
  const avatar = getCachedAvatar(name);

  useEffect(() => {
    if (!logoUrl || !logoAllowed) { setImgLoaded(false); return; }
    setImgLoaded(false);
    const img = new Image();
    img.onload = () => setImgLoaded(true);
    img.onerror = () => setImgLoaded(false);
    img.src = logoUrl;
    return () => { img.onload = null; img.onerror = null; };
  }, [logoUrl, logoAllowed]);

  // Priority 3: Default organization icon (no company name at all)
  if (!name.trim()) {
    return (
      <div className={`${s.box} ${s.rounded} flex items-center justify-center bg-white/5 ring-1 ring-white/10 shrink-0 ${className}`} style={{ boxShadow: SHADOW }}>
        <Building2 size={s.icon} className="text-white/25" />
      </div>
    );
  }

  // Premium initials badge as base layer (always rendered, never broken).
  // Official logo overlaid on top only after successful load — badge shows through on failure.
  return (
    <div
      className={`${s.box} ${s.rounded} relative shrink-0 overflow-hidden ring-1 ring-white/10 ${className}`}
      style={{ boxShadow: SHADOW }}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center font-bold tracking-tight text-white ${s.text}`}
        style={{ background: avatar.colors.gradient }}
      >
        <span className="drop-shadow-sm">{avatar.initials}</span>
      </div>
      {imgLoaded && logoUrl && logoAllowed && (
        <img
          src={logoUrl}
          alt={name}
          className={`absolute inset-0 w-full h-full object-contain bg-white ${s.img}`}
          onError={() => setImgLoaded(false)}
        />
      )}
    </div>
  );
}