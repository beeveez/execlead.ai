import React, { useRef, useState } from "react";
import { FileText, Loader2, FileUp } from "lucide-react";

export default function ResumeUpload({ onUpload, uploading, versions, selectedId, onSelect }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.name.match(/\.(pdf|docx?|PDF|DOCX?)$/)) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p className="text-white/60 text-sm">Uploading resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FileUp size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium">Upload your resume</p>
              <p className="text-white/30 text-sm mt-1">PDF or DOCX · Drag & drop or click to browse</p>
            </div>
          </div>
        )}
      </div>

      {versions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Resume Versions</h3>
          <div className="space-y-2">
            {versions.map((v, i) => (
              <button key={v.id} onClick={() => onSelect(v)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedId === v.id ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"}`}>
                <FileText size={18} className={selectedId === v.id ? "text-indigo-400" : "text-white/30"} />
                <div className="flex-1 text-left">
                  <p className="text-sm text-white/70 font-medium">Version {versions.length - i}</p>
                  <p className="text-xs text-white/30">{v.file_name}</p>
                </div>
                <p className="text-xs text-white/30">{new Date(v.created_date).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}