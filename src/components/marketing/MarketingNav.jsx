import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/layout/Logo";
import ShareButton from "@/components/social/ShareButton";
import { prefetchRoute } from "@/lib/routePrefetch";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Features", href: "/#features" },
  { label: "Journey", href: "/#journey" },
  { label: "Learning", href: "/#paths" },
  { label: "Pricing", href: "/pricing", route: "/pricing" },
  { label: "Leaderboard", href: "/leaderboard", route: "/leaderboard" },
];

export default function MarketingNav() {
  const location = useLocation();
  const [authed, setAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  const isActive = (item) => item.route && location.pathname === item.route;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08080d]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/"><Logo aiTagClass="ml-1" /></Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_ITEMS.map((item) =>
            item.route ? (
              <Link
                key={item.label}
                to={item.route}
                onMouseEnter={() => prefetchRoute(item.route)}
                className={`transition-colors ${isActive(item) ? "text-white font-medium" : "text-white/50 hover:text-white"}`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={`transition-colors ${isActive(item) ? "text-white font-medium" : "text-white/50 hover:text-white"}`}
              >
                {item.label}
              </a>
            )
          )}
        </div>
        <div className="flex items-center gap-3">
          <ShareButton variant="icon" shareType="landing" iconSize={15} />
          {authed ? (
            <Link to="/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-sm text-white/50 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Start Free</Link>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/60 p-1">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#08080d]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.route ? (
                <Link
                  key={item.label}
                  to={item.route}
                  onClick={() => setMobileOpen(false)}
                  onMouseEnter={() => prefetchRoute(item.route)}
                  className={`block py-2 text-sm transition-colors ${isActive(item) ? "text-white font-medium" : "text-white/50 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 text-sm transition-colors ${isActive(item) ? "text-white font-medium" : "text-white/50 hover:text-white"}`}
                >
                  {item.label}
                </a>
              )
            )}
            {!authed && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-white/50 hover:text-white">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}