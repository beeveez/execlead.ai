import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, GraduationCap, Users, UserCircle } from "lucide-react";

const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/academy", label: "Academy", icon: GraduationCap },
  { path: "/network", label: "Network", icon: Users },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

export default function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav
      className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d14]/95 backdrop-blur-xl border-t border-white/5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 min-h-[44px] rounded-lg transition-colors ${
                active ? "text-indigo-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-indigo-400" />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}