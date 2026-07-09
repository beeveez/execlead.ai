import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, X, Loader2, FileJson, CheckCircle2 } from "lucide-react";

const DATA_ITEMS = [
  "Resume & Career Documents", "Certificates", "Leadership DNA",
  "Journal Entries", "Analytics & Usage", "Achievements",
  "Public Profile", "Wallet History", "Referral History", "Learning Progress",
];

export default function DownloadDataDialog({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("accountDeletion", { action: "export_data" });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `execlead-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to export data.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-white/60" />
            <h2 className="text-white font-semibold">Download My Data</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-medium">Download Started</h3>
              <p className="text-white/40 text-sm">Your data export has been downloaded. Keep it safe — this data will be permanently deleted when your account is deleted.</p>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          ) : (
            <>
              <p className="text-white/50 text-sm">Export a complete copy of your data before deleting your account. This includes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {DATA_ITEMS.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/60">
                    <FileJson size={14} className="text-indigo-400 flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button onClick={handleDownload} disabled={loading} className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {loading ? "Preparing export…" : "Download My Data"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}