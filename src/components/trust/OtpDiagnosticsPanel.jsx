import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Activity, Server, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function OtpDiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [diagRes, logsRes] = await Promise.all([
        base44.functions.invoke('managePhoneOtp', { action: 'diagnostics' }),
        base44.functions.invoke('managePhoneOtp', { action: 'get_logs' }),
      ]);
      setDiagnostics(diagRes.data);
      setLogs(logsRes.data.logs || []);
    } catch {
      /* not admin or error */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!diagnostics) return null;

  const statusColor = (status) => {
    if (status === 'configured' || status === 'sent' || status === 'verified' || status === 'normal') return '#10b981';
    if (status === 'not_configured' || status === 'failed' || status === 'expired' || status === 'throttled') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">OTP Developer Diagnostics</span>
        <button onClick={load} className="ml-auto text-[10px] text-white/30 hover:text-white/60">Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <DiagItem icon={Server} label="SMS Provider" value={diagnostics.sms_provider || 'None'} color={diagnostics.sms_configured ? '#10b981' : '#ef4444'} />
        <DiagItem icon={CheckCircle2} label="API Status" value={diagnostics.api_status} color={statusColor(diagnostics.api_status)} />
        <DiagItem icon={Zap} label="Environment" value={diagnostics.environment} color="#3b82f6" />
        <DiagItem icon={Clock} label="Last Attempt" value={diagnostics.last_otp_attempt ? new Date(diagnostics.last_otp_attempt.time).toLocaleString() : 'None'} color="#a855f7" />
        <DiagItem icon={AlertCircle} label="Last Error" value={diagnostics.last_error || 'None'} color={diagnostics.last_error ? '#ef4444' : '#10b981'} />
        <DiagItem icon={Activity} label="Rate Limit" value={diagnostics.rate_limit_status} color={statusColor(diagnostics.rate_limit_status)} />
      </div>

      {diagnostics.last_otp_attempt && (
        <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Last OTP Attempt</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-white/30">Status:</span> <span style={{ color: statusColor(diagnostics.last_otp_attempt.status) }}>{diagnostics.last_otp_attempt.status}</span></div>
            <div><span className="text-white/30">Provider:</span> <span className="text-white/60">{diagnostics.last_otp_attempt.provider}</span></div>
            <div><span className="text-white/30">Method:</span> <span className="text-white/60">{diagnostics.last_otp_attempt.method}</span></div>
            <div><span className="text-white/30">Time:</span> <span className="text-white/60">{new Date(diagnostics.last_otp_attempt.time).toLocaleTimeString()}</span></div>
            {diagnostics.last_otp_attempt.failure_reason && (
              <div className="col-span-2"><span className="text-white/30">Failure:</span> <span className="text-red-400">{diagnostics.last_otp_attempt.failure_reason}</span></div>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">OTP Activity Log ({logs.length})</div>
        {logs.length === 0 ? (
          <p className="text-xs text-white/30 py-3 text-center">No OTP attempts recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-white/30 border-b border-white/5">
                  <th className="pb-2 pr-3 font-medium">Time</th>
                  <th className="pb-2 pr-3 font-medium">Phone</th>
                  <th className="pb-2 pr-3 font-medium">Provider</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium">Reason</th>
                  <th className="pb-2 font-medium">Retries</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-3 text-white/40">{new Date(log.created_date).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-white/50">{log.phone_number_masked}</td>
                    <td className="py-2 pr-3 text-white/50">{log.provider}</td>
                    <td className="py-2 pr-3" style={{ color: statusColor(log.delivery_status) }}>{log.delivery_status}</td>
                    <td className="py-2 pr-3 text-white/40 max-w-[200px] truncate">{log.failure_reason || '—'}</td>
                    <td className="py-2 text-white/40">{log.retry_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DiagItem({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-xs font-medium text-white/70 capitalize truncate" style={{ color }}>{value}</div>
    </div>
  );
}