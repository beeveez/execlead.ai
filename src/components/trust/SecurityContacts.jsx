import React from "react";
import { Mail, Clock, ArrowUp, ShieldAlert } from "lucide-react";
import { SECURITY_CONTACTS_VALIDATED } from "@/lib/trustCenterExtendedData";

export default function SecurityContacts() {
  const { responseTime, escalationPath, contacts } = SECURITY_CONTACTS_VALIDATED;
  return (
    <div className="space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          Contact addresses below are <strong>Coming Soon</strong> — they are not yet provisioned as functional mailboxes.
          We do not publish non-functional contact addresses. Once validated, they will display as active.
        </p>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Response Commitments</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Response Time</div>
            <p className="text-xs text-white/60">{responseTime}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Escalation Path</div>
            <p className="text-xs text-white/60">{escalationPath}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contacts.map((c) => (
          <div key={c.email} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} className="text-white/40" />
              <span className="text-sm font-medium text-white/70">{c.email}</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 font-medium">Coming Soon</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">{c.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}