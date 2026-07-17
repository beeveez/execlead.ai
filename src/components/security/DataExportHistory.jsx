import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Loader2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DataExportHistory() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SecurityEvent.filter(
        { event_type: "data_export" },
        "-created_date",
        20
      );
      setExports(data || []);
    } catch {
      setExports([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/80">Data Export History</h3>
        </div>
        <button onClick={loadExports} className="text-white/30 hover:text-white/60">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : exports.length === 0 ? (
        <div className="text-center py-8 text-xs text-white/30">
          <FileText size={24} className="mx-auto mb-2 text-white/10" />
          No data exports recorded
        </div>
      ) : (
        <div className="space-y-1.5">
          {exports.map(exp => (
            <div key={exp.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Download size={14} className="text-white/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 truncate">{exp.description || "Data export"}</p>
                <p className="text-[10px] text-white/30">
                  {exp.ip_address !== "unknown" && exp.ip_address ? `${exp.ip_address} · ` : ""}
                  {exp.created_date ? new Date(exp.created_date).toLocaleString() : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}