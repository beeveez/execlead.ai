import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, Globe, Clock, Loader2, Power, Ban, CheckCircle2, ShieldCheck, Fingerprint } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { detectDeviceInfo, RISK_LEVELS, getStatusColor } from "@/lib/zeroTrustEngine";

function SessionCard({ session, onTerminate, isCurrent }) {
  const riskColor = RISK_LEVELS[session.risk_level]?.color || "#64748b";

  return (
    <div className={`bg-white/[0.02] border rounded-xl p-4 ${isCurrent ? "border-emerald-500/20" : "border-white/5"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            {session.operating_system?.includes("iOS") || session.operating_system?.includes("Android")
              ? <Smartphone size={18} className="text-white/40" />
              : <Monitor size={18} className="text-white/40" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/80 font-medium truncate">{session.device_name || "Unknown Device"}</span>
              {isCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Current</span>}
            </div>
            <div className="text-xs text-white/40 mt-0.5">{session.browser} · {session.operating_system}</div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
              <span className="flex items-center gap-1"><Globe size={10} /> {session.city || "Unknown"}, {session.country || "—"}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {session.last_activity ? new Date(session.last_activity).toLocaleString() : "—"}</span>
            </div>
            <div className="text-[10px] text-white/20 mt-0.5">IP: {session.ip_address || "—"}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded border" style={{ color: riskColor, borderColor: `${riskColor}30`, background: `${riskColor}10` }}>
            {RISK_LEVELS[session.risk_level]?.label || "Low"} Risk
          </span>
          {session.mfa_used && <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><ShieldCheck size={9} /> MFA</span>}
        </div>
      </div>
      {!isCurrent && session.status === "active" && (
        <button onClick={() => onTerminate(session)} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors">
          <Power size={13} /> Terminate Session
        </button>
      )}
    </div>
  );
}

function DeviceCard({ device, onAction }) {
  const statusColor = getStatusColor(device.status);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Fingerprint size={18} className="text-white/40" />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-white/80 font-medium truncate">{device.device_name || "Unknown Device"}</div>
            <div className="text-xs text-white/40 mt-0.5">{device.browser} · {device.operating_system}</div>
            <div className="text-[10px] text-white/30 mt-1">
              First seen: {device.first_seen ? new Date(device.first_seen).toLocaleDateString() : "—"} · Last used: {device.last_used ? new Date(device.last_used).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded border flex-shrink-0" style={{ color: statusColor, borderColor: `${statusColor}30`, background: `${statusColor}10` }}>
          {device.status}
        </span>
      </div>
      {device.status === "pending" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          <button onClick={() => onAction(device, "trusted")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={13} /> Trust
          </button>
          <button onClick={() => onAction(device, "blocked")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium">
            <Ban size={13} /> Block
          </button>
        </div>
      )}
      {device.status === "trusted" && (
        <button onClick={() => onAction(device, "blocked")} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium">
          <Ban size={13} /> Remove & Block
        </button>
      )}
    </div>
  );
}

export default function SessionManager() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const deviceInfo = detectDeviceInfo();

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const sessRecords = await base44.entities.SecuritySession.filter({ user_id: user.id }, "-last_activity", 20);
      // If no sessions exist, create current session record
      if (sessRecords.length === 0) {
        const current = await base44.entities.SecuritySession.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          device_name: deviceInfo.deviceName,
          device_fingerprint: deviceInfo.fingerprint,
          browser: deviceInfo.browser,
          operating_system: deviceInfo.os,
          ip_address: "Detected at network layer",
          country: "—",
          city: "—",
          login_time: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          risk_level: "low",
          risk_score: 0,
          risk_factors: [],
          status: "active",
          auth_method: "email",
          mfa_used: false,
          is_current: true,
        });
        setSessions([current]);
      } else {
        setSessions(sessRecords);
      }

      const devRecords = await base44.entities.TrustedDevice.filter({ user_id: user.id }, "-last_used", 20);
      setDevices(devRecords);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleTerminate = async (session) => {
    setActionLoading(true);
    try {
      await base44.entities.SecuritySession.update(session.id, { status: "terminated" });
      await base44.entities.SecurityEvent.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        event_type: "session_terminated",
        severity: "medium",
        description: `Session terminated: ${session.device_name}`,
        action_taken: "logged",
      });
      load();
    } catch {}
    setActionLoading(false);
  };

  const handleDeviceAction = async (device, status) => {
    setActionLoading(true);
    try {
      await base44.entities.TrustedDevice.update(device.id, { status, approved_by_id: user.id, approved_by_name: user.full_name });
      await base44.entities.SecurityEvent.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        event_type: status === "trusted" ? "device_registered" : "device_blocked",
        severity: status === "trusted" ? "info" : "high",
        description: `Device ${status}: ${device.device_name}`,
        action_taken: status === "blocked" ? "blocked" : "logged",
      });
      load();
    } catch {}
    setActionLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  return (
    <div className="space-y-4">
      {/* Active Sessions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider">
            <Monitor size={14} /> Active Sessions
          </div>
          <button disabled={actionLoading} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 disabled:opacity-40">
            <Power size={12} /> Sign Out Everywhere
          </button>
        </div>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-6">No active sessions.</p>
          ) : (
            sessions.map(s => <SessionCard key={s.id} session={s} isCurrent={s.is_current} onTerminate={handleTerminate} />)
          )}
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-4">
          <Fingerprint size={14} /> Device Trust
        </div>
        <div className="space-y-3">
          {devices.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-6">No registered devices. New devices will appear here for approval.</p>
          ) : (
            devices.map(d => <DeviceCard key={d.id} device={d} onAction={handleDeviceAction} />)
          )}
        </div>
      </div>
    </div>
  );
}