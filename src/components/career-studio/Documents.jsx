import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Trash2, Search, Loader2, Mail, Linkedin, User, FileText } from "lucide-react";

const TYPE_META = {
  cover_letter: { label: "Cover Letter", icon: Mail, color: "text-indigo-400" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-blue-400" },
  bio: { label: "Bio", icon: User, color: "text-violet-400" },
  portfolio: { label: "Portfolio", icon: FolderOpen, color: "text-emerald-400" },
  achievement: { label: "Achievement", icon: FileText, color: "text-amber-400" },
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try { const list = await base44.entities.CareerDocument.list("-created_date", 100); setDocs(list); } catch (e) {}
    setLoading(false);
  };

  const filtered = docs.filter(d => {
    if (filter !== "all" && d.type !== filter) return false;
    return (d.title + d.content).toLowerCase().includes(search.toLowerCase());
  });

  const types = ["all", ...Object.keys(TYPE_META)];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        </div>
        <div className="flex flex-wrap gap-1">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
              {t === "all" ? "All" : TYPE_META[t].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <FolderOpen size={24} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-sm">No documents found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(doc => {
              const meta = TYPE_META[doc.type] || TYPE_META.bio;
              return (
                <div key={doc.id} onClick={() => setSelected(doc)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selected?.id === doc.id ? "bg-indigo-500/10" : "bg-white/[0.02] hover:bg-white/[0.05]"}`}>
                  <meta.icon size={14} className={meta.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 truncate">{doc.title}</p>
                    <p className="text-xs text-white/30">{meta.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-5">
        {selected ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">{selected.title}</h3>
              <button onClick={async () => { await base44.entities.CareerDocument.delete(selected.id); setSelected(null); loadDocs(); }} className="text-white/30 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
            {selected.type === "linkedin" ? (
              <pre className="text-white/60 text-sm whitespace-pre-wrap">{(() => { try { return JSON.stringify(JSON.parse(selected.content), null, 2); } catch { return selected.content; } })()}</pre>
            ) : (
              <p className="text-white/60 text-sm whitespace-pre-wrap">{selected.content}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center py-20">
            <div>
              <FolderOpen size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select a document to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}