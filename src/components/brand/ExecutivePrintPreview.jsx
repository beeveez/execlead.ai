import React, { useEffect, useRef, useState } from "react";
import { X, Download, FileText, Loader2 } from "lucide-react";
import { buildExecutivePdf } from "@/lib/executivePdf";
import { getExecutiveSlug } from "@/lib/socialShare";

export default function ExecutivePrintPreview({ profile, onClose }) {
  const [format, setFormat] = useState("a4");
  const [orientation, setOrientation] = useState("auto");
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const docRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    (async () => {
      try {
        const doc = await buildExecutivePdf(profile, { format, orientation });
        if (cancelled) return;
        docRef.current = doc;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const blobUrl = doc.output("bloburl");
        urlRef.current = blobUrl;
        setUrl(blobUrl);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to generate preview");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile, format, orientation]);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const slug = profile?.public_username || getExecutiveSlug(profile);
  const download = () => {
    if (docRef.current) docRef.current.save(`execlead-identity-${slug || "profile"}.pdf`);
  };

  const selectCls = "bg-white/5 border border-white/10 text-white/80 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500/50";

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#0d0d14] flex-wrap">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-indigo-400" />
          <div>
            <div className="text-sm font-semibold text-white">Executive Identity — Print Preview</div>
            <div className="text-[10px] text-white/40">Vector text • embedded fonts • print-ready • exact match to download</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectCls}>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
          <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className={selectCls}>
            <option value="auto">Auto</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
          <button onClick={download} disabled={loading || !!error} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-medium transition-colors">
            <Download size={13} /> Download PDF
          </button>
          <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-[#1a1a22] overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white/50">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-sm">Rendering print layout…</span>
          </div>
        )}
        {error && (
          <div className="text-center max-w-sm">
            <p className="text-sm text-red-400 mb-1">Could not generate preview</p>
            <p className="text-xs text-white/40">{error}</p>
          </div>
        )}
        {!loading && !error && url && (
          <iframe src={url} title="Executive Identity PDF Preview" className="w-full h-full bg-white rounded-lg shadow-2xl" style={{ minHeight: "70vh" }} />
        )}
      </div>
    </div>
  );
}