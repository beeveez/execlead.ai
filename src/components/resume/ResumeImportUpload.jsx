import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function ResumeImportUpload({ onFileSelect, loading, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!/\.(pdf|docx?|PDF|DOCX?)$/.test(file.name)) return;
    onFileSelect(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-indigo-500/20 rounded-2xl bg-indigo-500/[0.02]">
        <Loader2 size={32} className="text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-white">Analyzing your resume with AI...</p>
        <p className="text-xs text-white/40 mt-1">Extracting structured data from every section</p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragOver ? 'border-indigo-500/50 bg-indigo-500/[0.05]' : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.02]'}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
        <UploadCloud size={24} className="text-indigo-400" />
      </div>
      <p className="text-sm font-medium text-white">Upload your resume</p>
      <p className="text-xs text-white/40 mt-1">PDF or DOCX — AI will extract and populate your profile</p>
      <div className="flex items-center gap-2 mt-4">
        <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium">Choose File</span>
        <span className="text-[10px] text-white/30">or drag & drop</span>
      </div>
      {error && <p className="text-xs text-red-400 mt-4 text-center px-4">{error}</p>}
    </div>
  );
}