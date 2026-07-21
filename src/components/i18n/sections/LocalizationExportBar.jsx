import React from 'react';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';

export default function LocalizationExportBar({ onExport }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-white/30 uppercase tracking-wider mr-1">Exports:</span>
      <button onClick={() => onExport('csv')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 transition-colors">
        <Download size={12} /> CSV
      </button>
      <button onClick={() => onExport('excel')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 transition-colors">
        <FileSpreadsheet size={12} /> Excel
      </button>
      <button onClick={() => onExport('json')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 transition-colors">
        <FileJson size={12} /> JSON
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button onClick={() => onExport('audit')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-xs text-indigo-300 transition-colors">
        <FileText size={12} /> Audit Report™
      </button>
      <button onClick={() => onExport('gap')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 transition-colors">
        <FileText size={12} /> Gap Report™
      </button>
      <button onClick={() => onExport('executive')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-300 transition-colors">
        <FileText size={12} /> Executive Report™
      </button>
    </div>
  );
}