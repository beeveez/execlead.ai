import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { EVIDENCE_TYPES } from "@/lib/execVerifiedCatalog";
import { ArrowLeft, Upload, FileText, Check, Loader2, Plus } from "lucide-react";

export default function VerificationEvidence() {
  const { enabled, loading: flagLoading } = useExecVerified();
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!enabled || !user?.id) { setLoading(false); return; }
    base44.entities.ExecVerification.filter({ user_id: user.id })
      .then((records) => {
        const v = records?.[0] || null;
        setVerification(v);
        if (v?.evidence_json) {
          try { setEvidenceItems(JSON.parse(v.evidence_json)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled, user?.id]);

  if (!flagLoading && !enabled) return <Navigate to="/security" replace />;
  if (loading || flagLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;

  const handleAddEvidence = async (typeId) => {
    setUploading(true);
    try {
      const newItems = [...evidenceItems, { type: typeId, submitted_date: new Date().toISOString(), status: "pending" }];
      setEvidenceItems(newItems);
      if (verification?.id) {
        await base44.entities.ExecVerification.update(verification.id, {
          evidence_json: JSON.stringify(newItems),
          evidence_count: newItems.length,
        });
      }
      setShowAdd(false);
    } catch {}
    setUploading(false);
  };

  const getEvidenceMeta = (typeId) => EVIDENCE_TYPES.find(t => t.id === typeId) || { name: typeId, desc: "", icon: "FileText" };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/verification" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Verification Center
        </Link>
        <h1 className="text-2xl font-bold text-white">Evidence Management</h1>
        <p className="text-white/40 text-sm mt-1">Submit and manage evidence for your verification application.</p>
      </div>

      {/* Evidence List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Submitted Evidence ({evidenceItems.length})</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"
          >
            <Plus size={12} /> Add Evidence
          </button>
        </div>

        {evidenceItems.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <FileText size={24} className="text-white/30 mx-auto mb-2" />
            <p className="text-white/50 text-sm">No evidence submitted yet.</p>
          </div>
        )}

        {evidenceItems.length > 0 && (
          <div className="space-y-2">
            {evidenceItems.map((item, i) => {
              const meta = getEvidenceMeta(item.type);
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 font-medium">{meta.name}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">{item.submitted_date ? new Date(item.submitted_date).toLocaleDateString() : "—"}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    item.status === "verified" ? "text-emerald-400 bg-emerald-500/10" :
                    item.status === "rejected" ? "text-red-400 bg-red-500/10" :
                    "text-amber-400 bg-amber-500/10"
                  }`}>
                    {item.status || "pending"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Evidence Form */}
        {showAdd && (
          <div className="mt-4 space-y-2 p-4 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Select Evidence Type</div>
            {EVIDENCE_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => handleAddEvidence(type.id)}
                disabled={uploading}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 font-medium">{type.name}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">{type.desc}</div>
                </div>
              </button>
            ))}
            {uploading && <div className="flex items-center justify-center gap-2 pt-2"><Loader2 size={14} className="animate-spin text-indigo-400" /><span className="text-xs text-white/40">Adding...</span></div>}
          </div>
        )}
      </div>
    </div>
  );
}