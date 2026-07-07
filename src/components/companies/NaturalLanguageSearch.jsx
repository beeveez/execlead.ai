import React, { useState } from "react";
import { Search, Sparkles, Loader2, X } from "lucide-react";

export default function NaturalLanguageSearch({ onResults, onClear, allCompanies }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setActive(true);
    try {
      const { naturalLanguageSearch } = await import("@/lib/companyEnrichment");
      const results = await naturalLanguageSearch(query, allCompanies);
      onResults(results);
    } catch (e) {
      onResults([]);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setQuery("");
    setActive(false);
    onClear();
  };

  const examples = [
    "Top AI companies",
    "Companies hiring CIOs",
    "Cloud-first companies",
    "Fortune 100 technology",
    "Companies using ServiceNow",
  ];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Sparkles size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${loading ? "text-violet-400 animate-pulse" : "text-violet-400/50"}`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ask anything: 'Top AI companies', 'Companies hiring CIOs', 'Cloud-first companies'..."
          className="w-full bg-violet-500/[0.05] border border-violet-500/20 rounded-lg pl-9 pr-24 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {active && (
            <button onClick={handleClear} className="p-1.5 rounded text-white/30 hover:text-white/60">
              <X size={14} />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-30 text-white text-xs font-medium transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            AI Search
          </button>
        </div>
      </div>
      {!active && (
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setQuery(ex); }}
              className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/50 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}