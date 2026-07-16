import React from "react";
import { Link } from "react-router-dom";
import { SectionCard } from "./FormFields";
import { KeyRound, Link2, ChevronRight, Lock, Mail } from "lucide-react";
import DangerZone from "@/components/account/DangerZone";

export default function AccountSection({ user }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Account" description="Manage your account security and connections." icon={KeyRound}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><Mail size={16} className="text-white/40" /></div>
            <div className="flex-1">
              <div className="text-white/80 text-sm font-medium">Email Address</div>
              <div className="text-white/30 text-xs">{user?.email || "—"}</div>
            </div>
            <Lock size={14} className="text-white/20" />
          </div>
          <Link to="/forgot-password" className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><KeyRound size={16} className="text-white/40" /></div>
            <div className="flex-1">
              <div className="text-white/80 text-sm font-medium">Change Password</div>
              <div className="text-white/30 text-xs">Reset via email verification</div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
          </Link>
          <Link to="/connected-accounts" className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><Link2 size={16} className="text-white/40" /></div>
            <div className="flex-1">
              <div className="text-white/80 text-sm font-medium">Connected Accounts</div>
              <div className="text-white/30 text-xs">Google, Apple, LinkedIn, Microsoft</div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
          </Link>
        </div>
      </SectionCard>
      <DangerZone />
    </div>
  );
}