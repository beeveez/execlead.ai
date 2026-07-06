import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, History, RotateCcw, Loader2, User, Clock } from "lucide-react";

export default function VersionHistory({ company, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.CompanyVersion.filter({ company_id: company.id }, "-version_number", 50);
        setVersions(list);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [company.id]);

  const handleRestore = async (v) => {
    setRestoring(v.id);
    try { await onRestore(v); } catch (e) {}
    setRestoring(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2"><History size={18} className="text-indigo-400" /><h3 className="text-lg font-bold text-white">Version History — {company.name}</h3></div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : versions.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-12">No version history yet. Versions are saved automatically when you edit a company.</p>
          ) : (
            <div className="space-y-3">
              {versions.map(v => (
                <div key={v.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400">v{v.version_number}</span>
                      <span className="text-white/70 text-sm font-medium">{v.change_summary || "Version saved"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span className="flex items-center gap-1"><User size={11} /> {v.created_by_name || "Unknown"}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(v.created_date).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRestore(v)} disabled={restoring === v.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-30">
                    {restoring === v.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}