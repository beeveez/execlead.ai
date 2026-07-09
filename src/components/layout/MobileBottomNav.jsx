import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/coach", label: "Coach", icon: Sparkles },
  { path: "/network", label: "Network", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d14]/95 backdrop-blur-xl border-t border-white/5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                active ? "text-indigo-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}