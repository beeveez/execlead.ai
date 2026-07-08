import React from "react";
import {
  ShieldCheck, Globe, KeyRound, Webhook, Wifi, CheckCircle,
  XCircle, AlertTriangle, Shield, Mail,
} from "lucide-react";

function DiagnosticRow({ icon: Icon, label, status, detail }) {
  const config = {
    pass: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle, label: "Pass" },
    fail: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle, label: "Fail" },
    pending: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle, label: "Pending" },
    unknown: { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", icon: AlertTriangle, label: "Unknown" },
  }[status] || { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", icon: AlertTriangle, label: "Unknown" };

  const StatusIcon = config.icon;

  return (
    <div className={`flex items-center gap-4 rounded-lg ${config.bg} border ${config.border} p-4`}>
      <div className={`w-9 h-9 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/80 font-medium">{label}</div>
        {detail && <div className="text-white/40 text-xs mt-0.5 truncate">{detail}</div>}
      </div>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} border ${config.border} shrink-0`}>
        <StatusIcon size={12} className={config.color} />
        <span className={config.color}>{config.label}</span>
      </div>
    </div>
  );
}

export default function DiagnosticsPanel({ settings }) {
  const hasApiKey = !!settings?.api_key;
  const hasWebhook = !!settings?.webhook_secret;
  const domainVerified = settings?.domain_verification_status === "verified";
  const isConnected = settings?.connection_status === "connected";

  // SPF/DKIM/DMARC are inferred from domain verification status.
  // In production, these would be checked via DNS lookups in a backend function.
  const dnsStatus = domainVerified ? "pass" : "pending";

  return (
    <div className="space-y-5">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Email Authentication & Delivery Diagnostics</h3>
        </div>
        <p className="text-white/30 text-xs mb-5">
          DNS records (SPF, DKIM, DMARC) are inferred from your domain verification status. For a full DNS audit, use your provider's dashboard.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DiagnosticRow icon={ShieldCheck} label="SPF Record" status={dnsStatus} detail={domainVerified ? "Sender Policy Framework verified" : "Awaiting domain verification"} />
          <DiagnosticRow icon={ShieldCheck} label="DKIM Signature" status={dnsStatus} detail={domainVerified ? "DomainKeys identified" : "Awaiting domain verification"} />
          <DiagnosticRow icon={ShieldCheck} label="DMARC Policy" status={dnsStatus} detail={domainVerified ? "Policy enforced" : "Awaiting domain verification"} />
          <DiagnosticRow icon={Globe} label="Domain Verification" status={domainVerified ? "pass" : settings?.domain_verification_status === "failed" ? "fail" : "pending"} detail={settings?.from_email || "No from email configured"} />
          <DiagnosticRow icon={KeyRound} label="API Key Status" status={hasApiKey ? "pass" : "fail"} detail={hasApiKey ? "Key configured and stored" : "No API key set"} />
          <DiagnosticRow icon={Webhook} label="Webhook Status" status={hasWebhook ? "pass" : "pending"} detail={hasWebhook ? "Webhook secret configured" : "No webhook secret set"} />
          <DiagnosticRow icon={Wifi} label="Provider Connectivity" status={isConnected ? "pass" : settings?.connection_status === "error" ? "fail" : "pending"} detail={settings?.connection_status ? `Status: ${settings.connection_status}` : "Not tested"} />
          <DiagnosticRow icon={Mail} label="From Email" status={settings?.from_email ? "pass" : "fail"} detail={settings?.from_email || "Not configured"} />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Diagnostic Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {[dnsStatus, dnsStatus, dnsStatus, domainVerified ? "pass" : "pending", hasApiKey ? "pass" : "fail", hasWebhook ? "pass" : "pending", isConnected ? "pass" : "pending", settings?.from_email ? "pass" : "fail"].filter(s => s === "pass").length}
            </div>
            <div className="text-white/40 text-xs mt-1">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {[dnsStatus, dnsStatus, dnsStatus, domainVerified ? "pass" : "pending", hasApiKey ? "pass" : "fail", hasWebhook ? "pass" : "pending", isConnected ? "pass" : "pending", settings?.from_email ? "pass" : "fail"].filter(s => s === "pending").length}
            </div>
            <div className="text-white/40 text-xs mt-1">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {[dnsStatus, dnsStatus, dnsStatus, domainVerified ? "pass" : "pending", hasApiKey ? "pass" : "fail", hasWebhook ? "pass" : "pending", isConnected ? "pass" : "pending", settings?.from_email ? "pass" : "fail"].filter(s => s === "fail").length}
            </div>
            <div className="text-white/40 text-xs mt-1">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}