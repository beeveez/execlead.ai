import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/layout/Logo";
import ShareButton from "@/components/social/ShareButton";
import { prefetchRoute } from "@/lib/routePrefetch";
import { buildSignInUrl } from "@/lib/sessionRestore";
import { Menu, X } from "lucide-react";

// Marketing Navigation System™ — one shared header across every public page.
const NAV_ITEMS = [
  { label: "Home", route: "/" },
  { label: "About", route: "/about" },
  { label: "Features", route: "/platform" },
  { label: "Pricing", route: "/pricing" },
  { label: "Success Stories", route: "/success-stories" },
  { label: "FAQ", route: "/pricing", hash: "faq" },
  { label: "Trust Center", route: "/trust-center" },
  { label: "Contact", route: "/contact" },
];

function trackNav(label) {
  try { base44.analytics.track({ eventName: "marketing_nav_click", properties: { destination: label } }); } catch (e) {}
}

export default function MarketingNav() {
  const location = useLocation();
  const [authed, setAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

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

  const handleNavClick = (item) => {
    setMobileOpen(false);
    trackNav(item.label);
  };

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-[#08080d]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          onClick={() => trackNav("Logo")}
          aria-label="EXECLEAD.AI — Home"
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg"
        >
          <Logo aiTagClass="ml-1" />
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-[13px]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.hash ? `${item.route}#${item.hash}` : item.route}
              onMouseEnter={() => prefetchRoute(item.route)}
              onClick={() => trackNav(item.label)}
              aria-current={isActive(item) ? "page" : undefined}
              className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded px-1 ${
                isActive(item) ? "text-white font-semibold" : "text-white/55 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden sm:block">
            <ShareButton variant="icon" shareType="landing" iconSize={15} />
          </div>
          {authed ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => trackNav("Dashboard")}
                className="hidden md:inline text-[13px] text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-lg px-2 py-1"
              >
                Dashboard
              </Link>
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
                to="/platform"
                onClick={() => trackNav("Watch Demo")}
                className="hidden md:inline-flex items-center text-[13px] text-white/65 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                Watch Demo
              </Link>
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
                  isActive(item) ? "text-white font-semibold" : "text-white/55 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-white/5 flex flex-col gap-2">
              {authed ? (
                <>
                  <Link to="/dashboard" onClick={() => handleNavClick({ label: "Dashboard" })} className="block py-2 text-sm text-white/60 hover:text-white">Dashboard</Link>
                  <Link to="/home" onClick={() => handleNavClick({ label: "Open Workspace" })} className="block py-2.5 text-center text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">Open Workspace</Link>
                </>
              ) : (
                <>
                  <Link to="/platform" onClick={() => handleNavClick({ label: "Watch Demo" })} className="block py-2.5 text-center text-sm border border-white/10 text-white/70 rounded-lg">Watch Demo</Link>
                  <Link to={buildSignInUrl(location.pathname + location.search)} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white">Sign In</Link>
                  <Link to="/beta" onClick={() => handleNavClick({ label: "Apply for Beta" })} className="block py-2.5 text-center text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg">Apply for Beta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}