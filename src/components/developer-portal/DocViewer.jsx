import React from "react";
import ReactMarkdown from "react-markdown";
import DependencyGraph from "./DependencyGraph";
import RelationshipPanel from "./RelationshipPanel";
import { createEntityDoc } from "@/lib/developerPortalEngine";
import { Database, User, Clock, Link2, Box } from "lucide-react";

export default function DocViewer({ doc, entitySchema, loadingSchema }) {
  // Entity docs — fetch schema dynamically
  if (doc.isEntity) {
    if (loadingSchema) return <LoadingState />;
    if (!entitySchema) return <EntityError name={doc.title} />;
    doc = createEntityDoc(doc.title, entitySchema);
  }

  return (
    <div className="max-w-3xl">
      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-1">{doc.title}</h1>
      <p className="text-white/40 text-sm mb-4">{doc.overview}</p>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetaCard icon={User} label="Owner" value={doc.owner} />
        <MetaCard icon={Box} label="Version" value={doc.version} />
        <MetaCard icon={Clock} label="Last Modified" value={doc.lastModified} />
        <MetaCard
          icon={Link2}
          label="Dependencies"
          value={doc.dependencies.length > 0 ? `${doc.dependencies.length}` : "None"}
        />
      </div>

      {/* Dependency graph (if present) */}
      {doc.graph && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Dependency Graph</h2>
          <DependencyGraph data={doc.graph} />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {doc.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">{section.heading}</h2>
            <div className="prose prose-invert prose-sm max-w-none text-white/70">
              <ReactMarkdown>{section.body}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Knowledge Graph™ relationships */}
      <RelationshipPanel doc={doc} />

      {/* Related components */}
      {doc.relatedComponents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Related Components</h2>
          <div className="flex flex-wrap gap-2">
            {doc.relatedComponents.map((c, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-white/20" />
        <span className="text-[9px] uppercase tracking-widest text-white/30">{label}</span>
      </div>
      <div className="text-xs text-white/70 font-medium truncate">{value}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
  );
}

function EntityError({ name }) {
  return (
    <div className="text-center py-16">
      <Database size={40} className="text-white/10 mx-auto mb-3" />
      <p className="text-white/30 text-sm">Unable to load schema for <span className="text-white/50 font-mono">{name}</span></p>
    </div>
  );
}