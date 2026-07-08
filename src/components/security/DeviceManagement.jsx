import React, { useState, useEffect } from "react";
import {
  Smartphone, Monitor, Fingerprint, Globe, Clock, Loader2,
  CheckCircle2, Ban, Trash2, Edit2, Plus, ShieldCheck,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { detectDeviceInfo, getStatusColor } from "@/lib/zeroTrustEngine";

function DeviceRow({ device, onAction, onRename }) {
  const statusColor = getStatusColor(device.status);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(device.device_name || "");
  const isMobile = device.operating_system?.includes("iOS") || device.operating_system?.includes("Android");

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            {isMobile ? <Smartphone size={18} className="text-white/40" /> : <Monitor size={18} className="text-white/40" />}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white/80 w-full max-w-xs"
                  autoFocus
                />
                <button onClick={() => onRename(device, name)} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 rounded bg-white/5 text-white/40">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80 font-medium truncate">{device.device_name || "Unknown Device"}</span>
                <button onClick={() => { setName(device.device_name || ""); setEditing(true); }} className="text-white/20 hover:text-white/50">
                  <Edit2 size={11} />
                </button>
              </div>
            )}
            <div className="text-xs text-white/40 mt-0.5">{device.browser} · {device.operating_system}</div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-white/30">
              <span className="flex items-center gap-1"><Fingerprint size={10} /> {device.device_fingerprint?.slice(0, 12)}…</span>
              <span className="flex items-center gap-1"><Globe size={10} /> {device.ip_address || "—"}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> First: {device.first_seen ? new Date(device.first_seen).toLocaleDateString() : "—"}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> Last: {device.last_used ? new Date(device.last_used).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded border flex-shrink-0 capitalize" style={{ color: statusColor, borderColor: `${statusColor}30`, background: `${statusColor}10` }}>
          {device.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
        {device.status === "pending" && (
          <button onClick={() => onAction(device, "trusted")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={13} /> Approve
          </button>
        )}
        {device.status !== "blocked" && (
          <button onClick={() => onAction(device, "blocked")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium">
            <Ban size={13} /> Block
          </button>
        )}
        <button onClick={() => onAction(device, "remove")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-xs font-medium">
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </div>
  );
}

export default function DeviceManagement() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const deviceInfo = detectDeviceInfo();

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const records = await base44.entities.TrustedDevice.filter({ user_id: user.id }, "-last_used", 50);
      setDevices(records);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleAction = async (device, action) => {
    setActionLoading(true);
    try {
      if (action === "remove") {
        await base44.entities.TrustedDevice.delete(device.id);
        await base44.entities.SecurityEvent.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          event_type: "device_blocked",
          severity: "medium",
          description: `Device removed: ${device.device_name}`,
          action_taken: "logged",
        });
      } else {
        await base44.entities.TrustedDevice.update(device.id, {
          status: action,
          approved_by_id: user.id,
          approved_by_name: user.full_name,
          last_used: new Date().toISOString(),
        });
        await base44.entities.SecurityEvent.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          event_type: action === "trusted" ? "device_registered" : "device_blocked",
          severity: action === "trusted" ? "info" : "high",
          description: `Device ${action}: ${device.device_name}`,
          action_taken: action === "blocked" ? "blocked" : "logged",
        });
      }
      load();
    } catch {}
    setActionLoading(false);
  };

  const handleRename = async (device, newName) => {
    try {
      await base44.entities.TrustedDevice.update(device.id, { device_name: newName });
      load();
    } catch {}
  };

  const handleRegisterCurrent = async () => {
    setActionLoading(true);
    try {
      const existing = await base44.entities.TrustedDevice.filter({
        user_id: user.id,
        device_fingerprint: deviceInfo.fingerprint,
      });
      if (existing.length === 0) {
        await base44.entities.TrustedDevice.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          device_name: deviceInfo.deviceName,
          device_fingerprint: deviceInfo.fingerprint,
          operating_system: deviceInfo.os,
          browser: deviceInfo.browser,
          ip_address: "Detected at network layer",
          first_seen: new Date().toISOString(),
          last_used: new Date().toISOString(),
          status: "trusted",
          approved_by_id: user.id,
          approved_by_name: user.full_name,
        });
        await base44.entities.SecurityEvent.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          event_type: "device_registered",
          severity: "info",
          description: `Device registered: ${deviceInfo.deviceName}`,
          action_taken: "logged",
        });
      }
      load();
    } catch {}
    setActionLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  const pending = devices.filter(d => d.status === "pending");
  const trusted = devices.filter(d => d.status === "trusted");
  const blocked = devices.filter(d => d.status === "blocked");

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <ShieldCheck size={18} className="text-violet-400" />
          </div>
          <div>
            <div className="text-sm text-white/80 font-medium">Register This Device</div>
            <div className="text-xs text-white/40">{deviceInfo.deviceName} · {deviceInfo.browser} · {deviceInfo.os}</div>
          </div>
        </div>
        <button onClick={handleRegisterCurrent} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-medium disabled:opacity-40">
          <Plus size={14} /> Register Device
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{trusted.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Trusted</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{pending.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Pending</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{blocked.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Blocked</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium uppercase tracking-wider mb-4">
            <Fingerprint size={14} /> Pending Approval
          </div>
          <div className="space-y-3">
            {pending.map(d => <DeviceRow key={d.id} device={d} onAction={handleAction} onRename={handleRename} />)}
          </div>
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-4">
          <Monitor size={14} /> All Registered Devices
        </div>
        <div className="space-y-3">
          {devices.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-6">No registered devices. Click "Register Device" above to add this device.</p>
          ) : (
            devices.map(d => <DeviceRow key={d.id} device={d} onAction={handleAction} onRename={handleRename} />)
          )}
        </div>
      </div>
    </div>
  );
}