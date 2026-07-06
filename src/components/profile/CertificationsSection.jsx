import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionCard } from "./FormFields";
import { Award, Plus, Trash2, Upload, Loader2, FileText } from "lucide-react";

const CERT_TYPES = ["Microsoft", "AWS", "Google", "Cisco", "ServiceNow", "ITIL", "CompTIA", "Other"];

export default function CertificationsSection({ items, onChange }) {
  const [uploading, setUploading] = useState(null);
  const fileRefs = useRef({});

  const addCert = () => onChange([...items, { type: "", name: "", file_url: "" }]);
  const updateCert = (idx, field, value) => onChange(items.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  const removeCert = (idx) => onChange(items.filter((_, i) => i !== idx));

  const handleUpload = async (idx, file) => {
    if (!file) return;
    setUploading(idx);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateCert(idx, "file_url", file_url);
    } catch (e) {}
    setUploading(null);
  };

  return (
    <SectionCard title="Certifications" description="Showcase your professional certifications." icon={Award} action={
      <button onClick={addCert} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"><Plus size={12} /> Add</button>
    }>
      {items.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No certifications added yet. Click "Add" to get started.</div>
      ) : (
        <div className="space-y-3">
          {items.map((cert, idx) => (
            <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs font-medium">Certification #{idx + 1}</span>
                <button onClick={() => removeCert(idx)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={cert.type} onChange={e => updateCert(idx, "type", e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="" className="bg-[#0d0d14]">Select type...</option>
                  {CERT_TYPES.map(t => <option key={t} value={t} className="bg-[#0d0d14]">{t}</option>)}
                </select>
                <input value={cert.name} onChange={e => updateCert(idx, "name", e.target.value)} placeholder="Certification name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              {cert.file_url ? (
                <div className="flex items-center gap-2">
                  <a href={cert.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"><FileText size={12} /> View certificate</a>
                  <button onClick={() => fileRefs.current[idx]?.click()} className="text-xs text-white/40 hover:text-white/60">Replace</button>
                </div>
              ) : (
                <button onClick={() => fileRefs.current[idx]?.click()} disabled={uploading === idx} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors disabled:opacity-30">
                  {uploading === idx ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload certificate
                </button>
              )}
              <input ref={el => fileRefs.current[idx] = el} type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => handleUpload(idx, e.target.files[0])} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}