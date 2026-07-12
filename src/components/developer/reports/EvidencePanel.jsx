import React, { useState, useEffect, useMemo } from "react";
import {
  Paperclip, Loader2, ChevronDown, ChevronRight, Plus, Camera, FileText, Code,
  GitBranch, Route as RouteIcon, Settings, ShieldCheck, History, Link2, Trash2, Upload, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { runGovernancePipeline } from "@/lib/governancePipeline";
import { Button } from "@/components/ui/button";

const EVIDENCE_TYPES = [
  { value: "screenshot", label: "Screenshot", icon: Camera, hasFile: true },
  { value: "log", label: "Log", icon: FileText, hasContent: true },
  { value: "source_file", label: "Source File", icon: Code, hasFile: true },
  { value: "commit", label: "Commit", icon: GitBranch, hasContent: true, placeholder: "Commit hash (e.g. a1b2c3d)" },
  { value: "route", label: "Route", icon: RouteIcon, hasContent: true, placeholder: "Route path (e.g. /developer/deployments)" },
  { value: "configuration", label: "Configuration", icon: Settings, hasContent: true, placeholder: "Config content" },
  { value: "validation_rule", label: "Validation Rule", icon: ShieldCheck, hasContent: true, placeholder: "Rule description" },
  { value: "audit_history", label: "Audit History", icon: History, hasContent: true, placeholder: "Audit entry reference" },
  { value: "related_finding", label: "Related Finding", icon: Link2, hasContent: true, placeholder: "Related finding ID or code" },
];

const SEVERITY_BADGE = {
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function AddEvidenceForm({ finding, user, onAdded, onCancel }) {
  const { toast } = useToast();
  const [type, setType] = useState("log");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const typeConfig = EVIDENCE_TYPES.find((t) => t.value === type) || EVIDENCE_TYPES[0];

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let fileUrl = null;
      if (typeConfig.hasFile && file) {
        const res = await base44.integrations.Core.UploadFile({ file });
        fileUrl = res.file_url;
      }
      await base44.entities.ReportEvidence.create({
        finding_id: finding.id || finding.code,
        finding_description: finding.message,
        finding_severity: finding.level,
        evidence_type: type,
        title: title.trim(),
        description: "",
        content: typeConfig.hasContent ? content.trim() : "",
        file_url: fileUrl,
        attached_by_id: user?.id,
        attached_by_name: user?.full_name || user?.email,
      });
      toast({ title: "Evidence attached", description: `${typeConfig.label} added to finding.` });
      onAdded();
    } catch (e) {
      toast({ title: "Failed to attach evidence", description: e?.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Add Evidence</span>
        <button onClick={onCancel} className="text-white/30 hover:text-white"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-white/40 text-xs mb-1 block">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none">
            {EVIDENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs mb-1 block">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Evidence title" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none" />
        </div>
      </div>
      {typeConfig.hasContent && (
        <div>
          <label className="text-white/40 text-xs mb-1 block">{typeConfig.label} Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={typeConfig.placeholder || ""} rows={3} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none font-mono resize-y" />
        </div>
      )}
      {typeConfig.hasFile && (
        <div>
          <label className="text-white/40 text-xs mb-1 block">Upload File</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-white/50 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:cursor-pointer" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button onClick={handleSubmit} size="sm" className="bg-indigo-600 hover:bg-indigo-500" disabled={submitting}>
          {submitting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" />}
          Attach Evidence
        </Button>
        <Button onClick={onCancel} size="sm" variant="ghost" className="text-white/50 hover:text-white">Cancel</Button>
      </div>
    </div>
  );
}

function EvidenceItem({ item, onDelete }) {
  const config = EVIDENCE_TYPES.find((t) => t.value === item.evidence_type) || EVIDENCE_TYPES[0];
  const Icon = config.icon;
  return (
    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
      <Icon size={14} className="text-indigo-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate">{item.title}</span>
          <span className="text-white/30 text-xs shrink-0">{config.label}</span>
        </div>
        {item.content && <pre className="text-white/40 text-xs mt-1 font-mono whitespace-pre-wrap truncate">{item.content}</pre>}
        {item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer" className="text-indigo-400 text-xs hover:underline mt-1 inline-block">View file →</a>}
        <div className="text-white/20 text-xs mt-1">{item.attached_by_name} · {new Date(item.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      </div>
      <button onClick={() => onDelete(item.id)} className="text-white/20 hover:text-red-400 shrink-0"><Trash2 size={12} /></button>
    </div>
  );
}

export default function EvidencePanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [findings, setFindings] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const cert = runGovernancePipeline("evidence");
      const allEvidence = await base44.entities.ReportEvidence.list("-created_date", 500);
      setFindings(cert.findings || []);
      setEvidence(allEvidence);
    } catch (e) {
      console.error("Failed to load evidence:", e);
    } finally {
      setLoading(false);
    }
  };

  const evidenceByFinding = useMemo(() => {
    const map = {};
    evidence.forEach((e) => {
      const key = e.finding_id;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [evidence]);

  const handleDelete = async (id) => {
    try {
      await base44.entities.ReportEvidence.delete(id);
      await loadAll();
      toast({ title: "Evidence removed" });
    } catch (e) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const filteredFindings = useMemo(() => {
    if (filter === "with") return findings.filter((f) => (evidenceByFinding[f.id || f.code] || []).length > 0);
    if (filter === "without") return findings.filter((f) => (evidenceByFinding[f.id || f.code] || []).length === 0);
    return findings;
  }, [findings, filter, evidenceByFinding]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const withEvidence = findings.filter((f) => (evidenceByFinding[f.id || f.code] || []).length > 0).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Paperclip size={14} className="text-indigo-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Total Findings</span></div>
          <div className="text-white text-2xl font-bold">{findings.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><ShieldCheck size={14} className="text-emerald-400" /><span className="text-white/40 text-xs uppercase tracking-wider">With Evidence</span></div>
          <div className="text-white text-2xl font-bold">{withEvidence}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Paperclip size={14} className="text-amber-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Evidence Items</span></div>
          <div className="text-white text-2xl font-bold">{evidence.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {["all", "with", "without"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-indigo-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>
            {f === "all" ? "All Findings" : f === "with" ? "With Evidence" : "Without Evidence"}
          </button>
        ))}
      </div>

      {/* Findings list */}
      <div className="space-y-1.5">
        {filteredFindings.map((f) => {
          const fid = f.id || f.code;
          const items = evidenceByFinding[fid] || [];
          const isExpanded = expanded === fid;
          return (
            <div key={fid} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : fid)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors"
              >
                {isExpanded ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${SEVERITY_BADGE[f.level] || SEVERITY_BADGE.info}`}>{f.level}</span>
                <span className="text-white/80 text-sm font-medium truncate flex-1 text-left">{f.message}</span>
                {items.length > 0 && (
                  <span className="flex items-center gap-1 text-indigo-400 text-xs shrink-0">
                    <Paperclip size={10} /> {items.length}
                  </span>
                )}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {items.map((item) => <EvidenceItem key={item.id} item={item} onDelete={handleDelete} />)}
                  {showForm === fid ? (
                    <AddEvidenceForm finding={f} user={user} onAdded={() => { setShowForm(null); loadAll(); }} onCancel={() => setShowForm(null)} />
                  ) : (
                    <button onClick={() => setShowForm(fid)} className="flex items-center gap-1.5 text-indigo-400 text-xs hover:text-indigo-300 px-2 py-1.5">
                      <Plus size={12} /> Add Evidence
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredFindings.length === 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm">No findings match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}