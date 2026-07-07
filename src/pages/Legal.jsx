import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { LEGAL_SECTIONS, FOOTER_LINKS, LEGAL_META } from "@/lib/legalCompliance";
import Logo from "@/components/layout/Logo";

export default function Legal() {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.replace("#", "") || "legal-notice";
  const [active, setActive] = useState(hash);

  useEffect(() => {
    setActive(location.hash.replace("#", "") || "legal-notice");
  }, [location.hash]);

  const section = LEGAL_SECTIONS[active] || LEGAL_SECTIONS["legal-notice"];

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 sticky top-0 z-40 bg-[#08080d]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={14} /> Back to Platform
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-2">{LEGAL_META.title} · v{LEGAL_META.version}</div>
          <h1 className="text-2xl font-bold text-white">Legal & Compliance</h1>
          <p className="text-white/40 text-sm mt-2 max-w-3xl leading-relaxed">{LEGAL_META.mission}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <div className="md:sticky md:top-20 md:self-start">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
              {FOOTER_LINKS.map(link => (
                <button
                  key={link.section}
                  onClick={() => {
                    navigate(`/legal#${link.section}`);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    active === link.section ? "bg-violet-500/10 text-violet-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {active === link.section && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
              <div className="prose prose-invert max-w-none">
                {section.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-white/60 text-sm leading-relaxed mb-4 whitespace-pre-line">{para}</p>
                ))}
              </div>
            </div>

            {/* Quick links for report/claim */}
            {(active === "report" || active === "claim") && (
              <div className="mt-4 bg-violet-500/[0.05] border border-violet-500/20 rounded-xl p-5">
                <p className="text-white/70 text-sm">
                  {active === "claim"
                    ? "To claim a company profile, navigate to the company's profile page and click \"Claim Company Profile.\""
                    : "To report incorrect information, navigate to the company's profile page and click \"Report / Request Update.\""}
                </p>
                <Link to="/companies" className="inline-flex items-center gap-1.5 mt-3 text-violet-400 text-sm hover:text-violet-300">
                  Browse Company Library <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}