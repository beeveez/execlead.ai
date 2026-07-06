import React, { useState, useEffect } from "react";
import { listVersions, deleteVersion, duplicateVersion, parseSnapshot } from "@/lib/identityVersioning";
import VersionCompareModal from "./VersionCompareModal";
import { History, RotateCcw, Copy, Trash2, GitCompare, Loader2, FileText, Sparkles } from "lucide-react";

function ConfidencePill({ score }) {
  if (!score) return null;
  const cls = score >= 95 ? "bg-emerald-500/15 text-emerald-400" : score >= 80 ? "bg-indigo-500/15 text-indigo-400" : "bg-amber-500/15 text-amber-400";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${cls}`}>
      {score}%
    </span>
  );
}

export default function VersionHistory({ currentForm, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState(null);
  const [busy, setBusy] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setVersions(await listVersions());
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleRestore = async (version) => {
    setBusy(version.id);
    const snapshot = parseSnapshot(version);
    await onRestore({ ...currentForm, ...snapshot }, `Restored ${version.label || "previous version"}`);
    setBusy(null);
  };

  const handleDuplicate = async (version) => {
    setBusy(version.id);
    await duplicateVersion(version);
    await refresh();
    setBusy(null);
  };

  const handleDelete = async (version) => {
    setBusy(version.id);
    await deleteVersion(version.id);
    await refresh();
    setBusy(null);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <History size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">Version History</h2>
      </div>
      <p className="text-white/30 text-xs mb-4">Snapshots saved before each resume import. Restore to recover from incorrect AI data.</p>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-white/30" /></div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No versions saved yet. Importing a resume creates a snapshot automatically.</div>
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <div key={v.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-400 text-xs font-bold">V{v.version_number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium truncate">{v.label || `Version ${v.version_number}`}</span>
                  <ConfidencePill score={v.confidence_score} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/30 mt-0.5">
                  {v.import_source === "resume_parser" ? <><FileText size={9} /> Resume Import</> : v.import_source === "duplicate" ? <><Copy size={9} /> Duplicated</> : <><Sparkles size={9} /> {v.import_source}</>}
                  {v.source_resume_name && <span className="truncate">· {v.source_resume_name}</span>}
                  {v.completeness_score > 0 && <span>· {v.completeness_score}% complete</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setCompare(v)} title="Compare" className="p-1.5 rounded-lg text-white/30 hover:text-indigo-400 hover:bg-white/5 transition-colors">
                  {busy === v.id ? <Loader2 size={14} className="animate-spin" /> : <GitCompare size={14} />}
                </button>
                <button onClick={() => handleRestore(v)} title="Restore" className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-white/5 transition-colors">
                  <RotateCcw size={14} />
                </button>
                <button onClick={() => handleDuplicate(v)} title="Duplicate" className="p-1.5 rounded-lg text-white/30 hover:text-indigo-400 hover:bg-white/5 transition-colors">
                  <Copy size={14} />
                </button>
                <button onClick={() => handleDelete(v)} title="Delete" className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {compare && (
        <VersionCompareModal version={compare} currentForm={currentForm} onClose={() => setCompare(null)} />
      )}
    </div>
  );
}