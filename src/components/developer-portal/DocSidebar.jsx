import React from "react";
import { ChevronRight } from "lucide-react";
import { DOC_CATEGORIES } from "@/lib/developerPortalEngine";

export default function DocSidebar({
  docs, entityNames, activeCategory, selectedDoc,
  onSelectDoc, onSelectCategory, searchResults, searchQuery,
}) {
  const getCategoryCount = (catId) => {
    if (catId === "entities" || catId === "data-models") return entityNames.length;
    return docs.filter(d => d.category === catId).length;
  };

  // Search mode
  if (searchQuery) {
    return (
      <div className="w-72 border-r border-white/5 bg-white/[0.01] overflow-y-auto flex-shrink-0">
        <div className="p-3 text-[10px] uppercase tracking-widest text-white/30">
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
        </div>
        {searchResults.length === 0 ? (
          <div className="px-3 py-4 text-sm text-white/20">No results found.</div>
        ) : (
          searchResults.map(d => (
            <DocItem
              key={d.id}
              label={d.title}
              active={selectedDoc?.id === d.id}
              onClick={() => onSelectDoc(d)}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="w-72 border-r border-white/5 bg-white/[0.01] overflow-y-auto flex-shrink-0">
      {DOC_CATEGORIES.map(cat => {
        const isActive = activeCategory === cat.id;
        const count = getCategoryCount(cat.id);
        return (
          <div key={cat.id}>
            <button
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-indigo-300 bg-indigo-500/5" : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ChevronRight
                  size={12}
                  className={`transition-transform ${isActive ? "rotate-90" : ""}`}
                />
                {cat.label}
              </span>
              <span className="text-[10px] text-white/20 font-mono">{count}</span>
            </button>
            {isActive && (
              <div className="pb-2">
                {cat.dynamic ? (
                  entityNames.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-white/20 italic">Discovering...</div>
                  ) : (
                    entityNames.map(name => (
                      <DocItem
                        key={`entity-${name}`}
                        label={name}
                        active={selectedDoc?.id === `entity-${name}`}
                        onClick={() => onSelectDoc({ id: `entity-${name}`, title: name, category: cat.id, isEntity: true })}
                      />
                    ))
                  )
                ) : (
                  docs.filter(d => d.category === cat.id).map(d => (
                    <DocItem
                      key={d.id}
                      label={d.title}
                      active={selectedDoc?.id === d.id}
                      onClick={() => onSelectDoc(d)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 pl-7 text-xs transition-colors truncate ${
        active ? "text-indigo-300 bg-indigo-500/5" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
      }`}
    >
      {label}
    </button>
  );
}