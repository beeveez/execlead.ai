import React from "react";
import { Database } from "lucide-react";

const SOURCES = [
  { name: 'Executive Profiles', type: 'Document', indexed: true, embeddings: 1240 },
  { name: 'Company Intelligence', type: 'Company Knowledge', indexed: true, embeddings: 3500 },
  { name: 'Leadership DNA Data', type: 'Document', indexed: true, embeddings: 890 },
  { name: 'Course Content', type: 'Document', indexed: true, embeddings: 2100 },
  { name: 'Career Market Data', type: 'External API', indexed: false, embeddings: 0 },
];

export default function KnowledgeSources() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Knowledge Sources</h2>
      <div className="space-y-2">
        {SOURCES.map(s => (
          <div key={s.name} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <Database size={16} className="text-white/30" />
            <div className="flex-1">
              <span className="text-white text-sm font-medium">{s.name}</span>
              <span className="text-white/30 text-xs ml-2">{s.type}</span>
            </div>
            <div className="text-right">
              <div className={`text-xs ${s.indexed ? 'text-emerald-400' : 'text-white/30'}`}>{s.indexed ? 'Indexed' : 'Not indexed'}</div>
              <div className="text-white/30 text-[10px]">{s.embeddings.toLocaleString()} embeddings</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}