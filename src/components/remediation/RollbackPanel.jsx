import React, { useState } from 'react';
import { RotateCcw, History, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function RollbackPanel({ snapshot, blocker }) {
  const [rolledBack, setRolledBack] = useState(false);
  const [history, setHistory] = useState([]);

  const handleRollback = () => {
    if (!snapshot) return;
    setRolledBack(true);
    setHistory((prev) => [...prev, {
      snapshotId: snapshot.snapshotId,
      timestamp: new Date().toISOString(),
      reason: 'Manual rollback initiated by developer',
      status: 'success',
    }]);
  };

  return (
    <div className="space-y-4">
      {snapshot ? (
        <>
          {/* Rollback Snapshot */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <History size={14} className="text-white/40" />
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Rollback Snapshot™</h4>
              {rolledBack && <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">Restored</span>}
            </div>
            <div className="space-y-2 text-xs">
              <Row label="Snapshot ID" value={snapshot.snapshotId} mono />
              <Row label="Created At" value={new Date(snapshot.createdAt).toLocaleString()} />
              <Row label="Previous State" value={snapshot.previousState} />
              <Row label="Config Snapshot" value={snapshot.configSnapshot} />
              <div>
                <div className="text-[10px] uppercase font-semibold text-white/40 mb-1">Files Snapshot</div>
                <div className="flex flex-wrap gap-1">
                  {snapshot.filesSnapshot?.map((f, i) => (
                    <span key={i} className="text-[10px] text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rollback Actions */}
          {!rolledBack ? (
            <button onClick={handleRollback} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-sm font-medium transition-colors">
              <RotateCcw size={14} /> Undo Patch — Restore Previous Version
            </button>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">Rollback successful. Previous configuration has been restored.</p>
            </div>
          )}

          {/* Rollback History */}
          {history.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Rollback History</h4>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    <span className="text-white/50">{h.snapshotId}</span>
                    <span className="text-white/30 ml-auto">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <RotateCcw className="mx-auto text-white/20 mb-3" size={32} />
          <p className="text-white/40 text-sm">No rollback snapshot available. Execute a patch to create one.</p>
          <p className="text-white/30 text-xs mt-1">Every patch execution automatically creates a Rollback Snapshot™ before applying changes.</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase font-semibold text-white/40 w-28 shrink-0">{label}</span>
      <span className={`text-white/60 ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
    </div>
  );
}