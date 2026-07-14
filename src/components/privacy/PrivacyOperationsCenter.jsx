import React from "react";
import {
  Clock, AlertTriangle, FileCheck, ShieldCheck, Trash2,
  Download, Bell, Mail, UserCog, Activity,
} from "lucide-react";
import { PRIVACY_OPS_QUEUE } from "@/lib/privacyEngine";

const ICON_MAP = { Clock, AlertTriangle, FileCheck, ShieldCheck, Trash2, Download, Bell, Mail, UserCog, Activity };

export default function PrivacyOperationsCenter() {
  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Privacy Operations Center™</h3>
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            All Systems Operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRIVACY_OPS_QUEUE.map((item) => {
            const Icon = ICON_MAP[item.icon] || Activity;
            const color = item.value === 0 ? 'text-emerald-400' : item.value > 5 ? 'text-amber-400' : 'text-white';
            return (
              <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                <Icon size={16} className="text-white/30 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${color}`}>{item.value}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Queues Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-indigo-400" />
            <h4 className="text-white font-semibold text-sm">Identity Verification Queue</h4>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
                <span className="text-white/50">Verification Request #{1000 + n}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400">Pending Review</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserCog size={16} className="text-purple-400" />
            <h4 className="text-white font-semibold text-sm">DPO Tasks</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
              <span className="text-white/50">Review PIA — Executive Memory™</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400">Due Aug 15</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
              <span className="text-white/50">Quarterly Compliance Review Prep</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400">Due Sep 30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retention Jobs */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-amber-400" />
          <h4 className="text-white font-semibold text-sm">Active Retention Jobs</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {['Session cleanup (90-day)', 'Notification archive (180-day)', 'Assessment retention (2-year)', 'Identity document purge (90-day post-verify)', 'Report retention (3-year)'].map((job) => (
            <div key={job} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
              <span className="text-white/50">{job}</span>
              <span className="text-emerald-400 text-[10px]">✓ Scheduled</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}