import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/layout/Logo";
import { prefetchRoute } from "@/lib/routePrefetch";
import { buildSignInUrl } from "@/lib/sessionRestore";
import { getCurrentPlatformMode } from "@/lib/launchMode";
import { Menu, X } from "lucide-react";

// Marketing Navigation System™ — two-layer enterprise header.
// Layer 1: Announcement Bar™ (platform status). Layer 2: Primary Navigation™.
const NAV_ITEMS = [
  { label: "Overview", route: "/", hash: "overview" },
  { label: "Platform", route: "/", hash: "platform" },
  { label: "Executive Journey", route: "/", hash: "journey" },
  { label: "Enterprise", route: "/", hash: "enterprise" },
  { label: "Trust", route: "/", hash: "trust" },
  { label: "Founder", route: "/", hash: "founder" },
];

function trackNav(label) {
  try { base44.analytics.track({ eventName: "marketing_nav_click", properties: { destination: label } }); } catch (e) {}
}

export default function MarketingNav() {
  const location = useLocation();
  const [authed, setAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mode = getCurrentPlatformMode();

  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent over the Landing hero at the top; solid everywhere else so
  // inner-page content always stays readable under the fixed header.
  const isHome = location.pathname === "/";
  const solid = scrolled || !isHome;

  const isActive = (item) => {
    if (item.hash) return location.pathname === item.route && location.hash === `#${item.hash}`;
    if (item.route === "/pricing") return location.pathname === "/pricing" && !location.hash;
    return !!item.route && location.pathname === item.route;
  };

  const handleNavClick = (item) => { setMobileOpen(false); trackNav(item.label); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── Layer 1: Announcement Bar™ — platform status only ── */}
      <div className="bg-[#0a0a0f] border-b border-white/5">
        <Link
          to="/beta"
          onClick={() => trackNav("Announcement")}
          aria-label={`${mode.label} — invitation only. Apply for beta.`}
          className="block h-8 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center gap-2 text-[11px] text-white/50 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          <span className="text-xs leading-none">{mode.icon}</span>
          <span className="font-medium text-white/80">{mode.label}</span>
          <span className="hidden sm:inline text-white/15">•</span>
          <span className="hidden sm:inline">v{mode.version}</span>
          <span className="hidden sm:inline text-white/15">•</span>
          <span className="hidden sm:inline">Invitation Only</span>
          {mode.buildLabel && (
            <>
              <span className="hidden md:inline text-white/15">•</span>
              <span className="hidden md:inline">{mode.buildLabel}</span>
            </>
          )}
        </Link>
      </div>

      {/* ── Layer 2: Primary Navigation™ ── */}
      <nav
        aria-label="Primary"
        className={`transition-all duration-300 border-b ${
          solid
            ? "bg-[#08080d]/90 backdrop-blur-xl border-white/5 shadow-lg shadow-black/20"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between gap-6 md:gap-10">
          {/* Logo — strongest visual element */}
          <div onClick={() => trackNav("Logo")} className="flex items-center pl-1 md:pl-2">
            <Logo size="xl" aiTagClass="ml-2" />
          </div>

          {/* Navigation — min 28px (gap-7) between items */}
          <div className="hidden lg:flex items-center gap-7 text-[13px]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.hash ? `${item.route}#${item.hash}` : item.route}
                onMouseEnter={() => prefetchRoute(item.route)}
                onClick={() => trackNav(item.label)}
                aria-current={isActive(item) ? "page" : undefined}
                className={`relative py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded ${
                  isActive(item) ? "text-accent-orange font-semibold" : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
                {isActive(item) && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-accent-orange rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA group — right aligned */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {authed ? (
              <>
                <Link
                  to="/home"
                  onClick={() => trackNav("Open Workspace")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  Open Workspace
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={buildSignInUrl(location.pathname + location.search)}
                  className="hidden md:inline text-[13px] text-white/55 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/beta"
                  onClick={() => trackNav("Apply for Beta")}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                >
                  Apply for Beta
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              className="lg:hidden text-white/70 p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#08080d]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.hash ? `${item.route}#${item.hash}` : item.route}
                onClick={() => handleNavClick(item)}
                aria-current={isActive(item) ? "page" : undefined}
                className={`block py-2.5 text-sm transition-colors ${
                  isActive(item) ? "text-accent-orange font-semibold" : "text-white/55 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-white/5 flex flex-col gap-2">
              {authed ? (
                <Link to="/home" onClick={() => handleNavClick({ label: "Open Workspace" })} className="block py-2.5 text-center text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">Open Workspace</Link>
              ) : (
                <>
                  <Link to={buildSignInUrl(location.pathname + location.search)} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white">Sign In</Link>
                  <Link to="/beta" onClick={() => handleNavClick({ label: "Apply for Beta" })} className="block py-2.5 text-center text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg">Apply for Beta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}