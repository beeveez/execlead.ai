import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import { LEGAL_STATUS } from "@/lib/legalCompliance";
import { buildSignInUrl } from "@/lib/sessionRestore";
import { BrandRegistry } from "@/lib/brandRegistry";

// Standard enterprise footer — utility links only. No page directory.
const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Beta Program", to: "/beta" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Articles", to: "/articles" },
      { label: "Trust Center", to: "/trust-center" },
      { label: "Platform", to: "/platform" },
    ],
  },
  {
    title: "Enterprise",
    links: [
      { label: "Request Demo", to: "/contact" },
      { label: "System Status", to: "/system-status" },
      { label: "Responsible AI", to: "/responsible-ai" },
    ],
  },
];

export default function MarketingFooter() {
  const location = useLocation();
  return (
    <footer className="border-t border-white/5 pt-14 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Link to="/"><Logo aiTagClass="ml-1" /></Link>
            <p className="text-white/50 text-sm font-medium mt-3">{BrandRegistry.tagline}</p>
            <p className="text-white/25 text-xs mt-1.5 max-w-xs leading-relaxed">{BrandRegistry.descriptionShort}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[13px] text-white/45 hover:text-white/80 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/30">
            <Link to="/legal#privacy-policy" className="hover:text-white/55 transition-colors">Privacy Policy</Link>
            <Link to="/legal#terms-of-service" className="hover:text-white/55 transition-colors">Terms</Link>
            <Link to="/responsible-ai" className="hover:text-white/55 transition-colors">Responsible AI</Link>
            <Link to="/trust-center" className="hover:text-white/55 transition-colors">Security</Link>
            <Link to={buildSignInUrl(location.pathname + location.search)} className="hover:text-white/55 transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-white/25">{LEGAL_STATUS.copyright}</p>
        </div>
      </div>
    </footer>
  );
}