import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { User, ChevronDown, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AccountMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Account";
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
          {initials}
        </div>
        <span className="text-xs font-medium text-white/70 max-w-[120px] truncate">{displayName}</span>
        <ChevronDown size={12} className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                {user?.email && <p className="text-xs text-white/40 truncate">{user.email}</p>}
              </div>
            </div>
          </div>
          <div className="py-1">
            <button onClick={() => { navigate("/dashboard"); setOpen(false); }} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <LayoutDashboard size={14} className="text-white/30" /> Dashboard
            </button>
            <button onClick={() => { navigate("/profile"); setOpen(false); }} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <UserCircle size={14} className="text-white/30" /> Profile & Credentials
            </button>
          </div>
          <div className="border-t border-white/5 py-1">
            <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-red-400 hover:bg-red-500/5 transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}