import React from "react";
import CanonicalBrandLockup from "@/components/brand/CanonicalBrandLockup";

export default function ExecutiveMark({ size = 32, className = "" }) {
  const canonicalSize = size <= 20 ? "sm" : size >= 48 ? "hero" : "md";
  return <CanonicalBrandLockup variant="icon" size={canonicalSize} className={className} />;
}