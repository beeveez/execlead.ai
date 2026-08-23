import React from "react";
import { Link } from "react-router-dom";
import CanonicalBrandLockup from "@/components/brand/CanonicalBrandLockup";

const LEGACY_SIZE_MAP = { sm: "sm", lg: "md", xl: "lg" };

export default function Logo({ size = "lg", theme = "dark", className = "" }) {
  return (
    <Link
      to="/"
      aria-label="EXECLEAD.AI — Go to home"
      className={`inline-flex items-center cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ai-blue/50 rounded ${className}`}
    >
      <CanonicalBrandLockup variant="horizontal" size={LEGACY_SIZE_MAP[size] || size} theme={theme} />
    </Link>
  );
}