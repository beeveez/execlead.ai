import React from "react";
import { Link } from "react-router-dom";
import { FOOTER_LINKS } from "@/lib/legalCompliance";

export default function LegalFooter({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/25 ${className}`}>
      {FOOTER_LINKS.map((link, i) => (
        <Link key={i} to={`/legal#${link.section}`} className="hover:text-white/50 transition-colors">
          {link.label}
        </Link>
      ))}
    </div>
  );
}