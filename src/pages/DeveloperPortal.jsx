import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Share2 } from "lucide-react";
import {
  DOC_CATEGORIES, generateAllDocs, searchDocs, createEntityDoc,
} from "@/lib/developerPortalEngine";
import DocSidebar from "@/components/developer-portal/DocSidebar";
import DocViewer from "@/components/developer-portal/DocViewer";
import DocSearch from "@/components/developer-portal/DocSearch";
import ExportToolbar from "@/components/developer-portal/ExportToolbar";
import KnowledgeGraphView from "@/components/knowledge-graph/KnowledgeGraphView";

export default function DeveloperPortal() {
  const docs = useMemo(() => generateAllDocs(), []);
  const [entityNames, setEntityNames] = useState([]);
  const [activeCategory, setActiveCategory] = useState("architecture");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entitySchema, setEntitySchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Discover entity names at runtime
  useEffect(() => {
    let cancelled = false;
    try {
      let names = Object.keys(base44.entities);
      if (names.length === 0) {
        names = Object.getOwnPropertyNames(base44.entities);
      }
      names = names.filter(n => {
        if (n.startsWith("_")) return false;
        try { return typeof base44.entities[n]?.schema === "function"; } catch { return false; }
      }).sort();
      if (!cancelled) setEntityNames(names);
    } catch {
      // Entity discovery unavailable
    }
    return () => { cancelled = true; };
  }, []);

  // Handle doc selection
  const handleSelectDoc = async (doc) => {
    setSelectedDoc(doc);
    setEntitySchema(null);
    if (doc.isEntity) {
      setLoadingSchema(true);
      try {
        const schema = await base44.entities[doc.title].schema();
        setEntitySchema(schema);
      } catch {
        setEntitySchema(null);
      }
      setLoadingSchema(false);
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchDocs(docs, searchQuery);
  }, [docs, searchQuery]);

  const activeCategoryMeta = DOC_CATEGORIES.find(c => c.id === activeCategory);
  const exportDoc = selectedDoc?.isEntity && entitySchema
    ? createEntityDoc(selectedDoc.title, entitySchema)
    : selectedDoc;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-1">Developer Portal™</div>
        <h1 className="text-2xl font-bold text-white">Developer Portal</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Auto-generated technical documentation. Always current — reads directly from platform registries.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <DocSearch value={searchQuery} onChange={setSearchQuery} />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowGraph(!showGraph)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
              showGraph
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            <Share2 size={14} /> Knowledge Graph
          </button>
          {!showGraph && <ExportToolbar doc={exportDoc} />}
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden border border-white/10 rounded-xl">
        <DocSidebar
          docs={docs}
          entityNames={entityNames}
          selectedDoc={selectedDoc}
          onSelectDoc={handleSelectDoc}
          onCategoryToggle={(catId) => {
            setActiveCategory(catId);
            setSelectedDoc(null);
            setSearchQuery("");
          }}
          searchResults={searchResults}
          searchQuery={searchQuery}
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {showGraph ? (
            <KnowledgeGraphView />
          ) : selectedDoc ? (
            <DocViewer
              doc={selectedDoc}
              entitySchema={entitySchema}
              loadingSchema={loadingSchema}
            />
          ) : (
            <CategoryOverview
              category={activeCategoryMeta}
              docs={docs.filter(d => d.category === activeCategory)}
              entityNames={activeCategory === "entities" || activeCategory === "data-models" ? entityNames : []}
              onSelectDoc={handleSelectDoc}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryOverview({ category, docs, entityNames, onSelectDoc }) {
  if (!category) return null;
  const items = category.dynamic ? entityNames : docs.map(d => d.title);

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1">{category.label}</h1>
      <p className="text-white/40 text-sm mb-4">{category.description}</p>
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">
        {items.length} document{items.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((title, i) => (
          <button
            key={i}
            onClick={() => {
              if (category.dynamic) {
                onSelectDoc({ id: `entity-${title}`, title, category: category.id, isEntity: true });
              } else {
                const d = docs[i];
                onSelectDoc(d);
              }
            }}
            className="text-left px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors truncate"
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  );
}