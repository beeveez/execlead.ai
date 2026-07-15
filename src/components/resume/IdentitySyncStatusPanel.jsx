import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Clock, Database, Activity, Loader2 } from 'lucide-react';

export default function IdentitySyncStatusPanel() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && ['admin', 'super_admin', 'platform_admin', 'developer'].includes(user.role);

  const load = useCallback(async () => {
    try {
      const response = await base44.functions.invoke('syncExecutiveIdentity', { action: 'get_status' });
      setStatus(response.data?.statuses?.[0] || null);
    } catch { /* not logged in or error */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleResync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('syncExecutiveIdentity', { action: 'resync' });
      await load();
    } catch { /* error */ }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    );
  }

  const healthColor = status?.sync_health === 'healthy' ? '#10b981' : status?.sync_health === 'warnings' ? '#f59e0b' : '#ef4444';
  const HealthIcon = status?.sync_health === 'healthy' ? CheckCircle2 : status?.sync_health === 'warnings' ? AlertTriangle : AlertCircle;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Identity Synchronization Status™</span>
        {isAdmin && (
          <button
            onClick={handleResync}
            disabled={syncing}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 disabled:opacity-40 transition-colors"
          >
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Resynchronize Executive Identity
          </button>
        )}
      </div>

      {!status ? (
        <div className="text-center py-6">
          <Database size={32} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No synchronization has been performed yet. Import and approve a resume to trigger automatic sync.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <SyncMetric icon={Clock} label="Last Sync" value={status.created_date ? new Date(status.created_date).toLocaleString() : '—'} color="#a855f7" />
            <SyncMetric icon={HealthIcon} label="Sync Health" value={status.sync_health || '—'} color={healthColor} />
            <SyncMetric icon={Database} label="Sync Type" value={status.sync_type === 'manual_resync' ? 'Manual Resync' : 'Resume Import'} color="#3b82f6" />
            <SyncMetric icon={Clock} label="Duration" value={status.duration_ms ? (status.duration_ms / 1000).toFixed(1) + 's' : '—'} color="#6366f1" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SyncMetric icon={CheckCircle2} label="Imported" value={status.records_imported || 0} color="#10b981" />
            <SyncMetric icon={RefreshCw} label="Updated" value={status.records_updated || 0} color="#3b82f6" />
            <SyncMetric icon={AlertCircle} label="Skipped" value={status.records_skipped || 0} color="#a855f7" />
            <SyncMetric icon={Database} label="Duplicates Merged" value={status.duplicates_merged || 0} color="#f59e0b" />
            <SyncMetric icon={AlertTriangle} label="Errors" value={status.sync_errors || 0} color={status.sync_errors > 0 ? '#ef4444' : '#10b981'} />
          </div>

          {status.sync_errors > 0 && status.error_details_json && (
            <div className="mt-4 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-xs font-medium text-red-400">Sync Errors ({status.sync_errors})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {(() => {
                  try {
                    const details = JSON.parse(status.error_details_json);
                    return details.slice(0, 5).map((d, i) => (
                      <div key={i} className="text-[11px] text-red-300/70">
                        <span className="text-red-400 font-medium">{d.entity}:</span> {d.error}
                      </div>
                    ));
                  } catch { return null; }
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SyncMetric({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-sm font-medium capitalize truncate" style={{ color }}>{String(value)}</div>
    </div>
  );
}