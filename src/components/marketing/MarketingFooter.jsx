import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import { LEGAL_STATUS } from "@/lib/legalCompliance";
import { buildSignInUrl } from "@/lib/sessionRestore";
import { Mail, Globe } from "lucide-react";
import { BrandRegistry } from "@/lib/brandRegistry";
import { SITE_URL } from "@/lib/publicMetadata";

// Standard enterprise footer — utility links only. No page directory.
const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Platform", to: "/platform" },
      { label: "Executive Simulator", to: "/simulator" },
      { label: "Leadership Academy", to: "/academy" },
      { label: "Readiness Assessment", to: "/executive-readiness" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Founding Beta", to: "/beta" },
      { label: "Founders Wall", to: "/founders" },
      { label: "Knowledge Center", to: "/knowledge" },
      { label: "Trust Center", to: "/trust-center" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/legal#privacy-policy" },
      { label: "Terms of Service", to: "/legal#terms-of-service" },
      { label: "Responsible AI", to: "/trust-center#ai" },
      { label: "AI Transparency", to: "/trust-center#ai" },
      { label: "Data Handling", to: "/trust-center#data" },
      { label: "Security", to: "/trust-center#security" },
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
            <Logo />
            <p className="text-white/50 text-sm font-medium mt-3">AI Executive Leadership Operating System™</p>
            <a href={`mailto:${BrandRegistry.supportEmail}`} className="flex items-center gap-1.5 text-white/45 hover:text-white/80 text-xs mt-3 transition-colors">
              <Mail size={13} className="text-indigo-400" /> {BrandRegistry.supportEmail}
            </a>
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/45 hover:text-white/80 text-xs mt-1.5 transition-colors">
              <Globe size={13} className="text-cyan-400" /> {SITE_URL.replace('https://', '')}
            </a>
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
            <Link to="/trust-center#ai" className="hover:text-white/55 transition-colors">Responsible AI</Link>
            <Link to="/trust-center#data" className="hover:text-white/55 transition-colors">Data Handling</Link>
            <Link to="/trust-center#security" className="hover:text-white/55 transition-colors">Security</Link>
            <Link to={buildSignInUrl(location.pathname + location.search)} className="hover:text-white/55 transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-white/25">{LEGAL_STATUS.copyright}</p>
        </div>
      </div>
    </footer>
  );
}