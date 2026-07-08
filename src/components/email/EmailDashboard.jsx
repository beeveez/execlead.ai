import React from "react";
import {
  Mail, Globe, KeyRound, BarChart3, CheckCircle, XCircle,
  Inbox, Clock, TrendingUp, TrendingDown, Activity, Send,
} from "lucide-react";
import { EMAIL_PROVIDERS } from "@/lib/emailProvider";

function StatCard({ icon: Icon, label, value, sub, color, bg, border }) {
  return (
    <div className={`rounded-xl border ${border || "border-white/5"} ${bg || "bg-white/[0.02]"} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${bg || "bg-white/5"} flex items-center justify-center`}>
          <Icon size={16} className={color || "text-white/50"} />
        </div>
        {sub && <span className="text-[10px] text-white/30 uppercase tracking-wider">{sub}</span>}
      </div>
      <div className={`text-2xl font-bold ${color || "text-white"}`}>{value}</div>
      <div className="text-white/40 text-xs mt-1">{label}</div>
    </div>
  );
}

export default function EmailDashboard({ settings, events }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = events.filter(e => new Date(e.created_date) >= today);
  const delivered = events.filter(e => ["delivered", "sent"].includes(e.delivery_status));
  const failed = events.filter(e => ["failed", "bounced", "spam"].includes(e.delivery_status));
  const queued = events.filter(e => ["queued", "sending", "retry"].includes(e.delivery_status));
  const todayDelivered = todayEvents.filter(e => ["delivered", "sent"].includes(e.delivery_status));

  const deliveryRate = events.length > 0 ? ((delivered.length / events.length) * 100).toFixed(1) : "0.0";
  const failureRate = events.length > 0 ? ((failed.length / events.length) * 100).toFixed(1) : "0.0";

  const lastSuccessful = delivered
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  const provider = EMAIL_PROVIDERS[settings?.provider] || EMAIL_PROVIDERS.resend;
  const isConnected = settings?.connection_status === "connected";
  const hasApiKey = !!settings?.api_key;
  const domainVerified = settings?.domain_verification_status === "verified";

  const healthColor = isConnected ? "text-emerald-400" : settings?.connection_status === "untested" ? "text-amber-400" : "text-red-400";
  const healthBg = isConnected ? "bg-emerald-500/10 border-emerald-500/20" : settings?.connection_status === "untested" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Mail} label="Connected Provider" value={provider.name} sub={settings?.is_active ? "Active" : "Inactive"} color={settings?.is_active ? "text-emerald-400" : "text-white/40"} />
        <StatCard icon={Activity} label="Provider Health" value={isConnected ? "Healthy" : settings?.connection_status || "Untested"} color={healthColor} bg={healthBg} border={healthBg.split(" ")[1]} />
        <StatCard icon={Globe} label="Domain Verification" value={domainVerified ? "Verified" : (settings?.domain_verification_status || "Not Started").replace("_", " ")} color={domainVerified ? "text-emerald-400" : "text-amber-400"} />
        <StatCard icon={KeyRound} label="API Status" value={hasApiKey ? "Configured" : "Missing"} color={hasApiKey ? "text-emerald-400" : "text-red-400"} />
      </div>

      {/* Email Statistics */}
      <div>
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Email Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BarChart3} label="Emails Today" value={todayEvents.length} sub={`${todayDelivered.length} delivered`} />
          <StatCard icon={TrendingUp} label="Delivery Rate" value={`${deliveryRate}%`} sub={`${delivered.length} total`} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" border="border-emerald-500/20" />
          <StatCard icon={TrendingDown} label="Failure Rate" value={`${failureRate}%`} sub={`${failed.length} total`} color={parseFloat(failureRate) > 10 ? "text-red-400" : "text-amber-400"} bg="bg-red-500/10 border-red-500/20" border="border-red-500/20" />
          <StatCard icon={Inbox} label="Queue Size" value={queued.length} sub="pending + retry" color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" border="border-blue-500/20" />
        </div>
      </div>

      {/* Last Successful Send */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Last Successful Send</h3>
        </div>
        {lastSuccessful ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Recipient</div>
              <div className="text-sm text-white/70">{lastSuccessful.recipient}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Subject</div>
              <div className="text-sm text-white/70 truncate">{lastSuccessful.subject}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Sent At</div>
              <div className="text-sm text-white/70">{new Date(lastSuccessful.created_date).toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <p className="text-white/30 text-sm">No successful sends yet.</p>
        )}
      </div>
    </div>
  );
}