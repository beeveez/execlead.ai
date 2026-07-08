import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { safeParse, getTypeMeta, getStatusMeta, getSeverityMeta, FEEDBACK_STATUSES, SEVERITY_LEVELS } from "@/lib/feedbackConfig";
import {
  ROADMAP_STAGES, PRODUCT_MODULES, ENVIRONMENTS, BUSINESS_VALUES, EFFORT_ESTIMATES,
  getRoadmapStage, getSentiment, getBusinessValue, getEffort, getCustomerImpact,
  resolveCustomer, getTags, getAiLabels, getLifecycleHistory, getCustomerCommunications,
  formatRelative, canManageProduct,
} from "@/lib/productManagement";
import {
  X, Sparkles, Bug, Lightbulb, Send, Clock, User, Building2, Mail,
  Tag, Link2, FileText, ChevronRight, Loader2, AlertTriangle, CheckCircle2,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "ai", label: "AI Analysis" },
  { id: "engineering", label: "Engineering" },
  { id: "communications", label: "Customer" },
  { id: "lifecycle", label: "Lifecycle" },
];

export default function FeedbackDetailDrawer({ feedback, pm, onClose }) {
  const [tab, setTab] = useState("overview");
  const [noteText, setNoteText] = useState("");
  const [noteField, setNoteField] = useState("engineering_notes");
  const [commMessage, setCommMessage] = useState("");
  const [commStatus, setCommStatus] = useState("Under Review");

  if (!feedback) return null;

  const tMeta = getTypeMeta(feedback.type);
  const sMeta = getStatusMeta(feedback.status);
  const sevMeta = getSeverityMeta(feedback.severity);
  const sentiment = getSentiment(feedback.ai_sentiment);
  const customer = resolveCustomer(feedback);
  const tags = getTags(feedback);
  const aiLabels = getAiLabels(feedback);
  const lifecycle = getLifecycleHistory(feedback);
  const comms = getCustomerCommunications(feedback);
  const attachments = safeParse(feedback.attachments_json, []);
  const diag = safeParse(feedback.diagnostics_json, {});
  const canManage = canManageProduct(pm.user?.role);
  const isBug = feedback.type === "bug";
  const isFeature = feedback.type === "feature";

  const update = (patch) => pm.updateFeedback(feedback.id, patch);
  const inputCls = "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50";

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await pm.addInternalNote(feedback.id, noteText.trim(), noteField);
    setNoteText("");
    toast({ title: "Note saved" });
  };

  const handleSendComm = async () => {
    if (!commMessage.trim()) return;
    await pm.sendCustomerUpdate(feedback.id, commMessage.trim(), commStatus);
    setCommMessage("");
    toast({ title: "Customer notified", description: `Status update sent: ${commStatus}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl h-full bg-[#0a0a0f] border-l border-white/10 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-2xl shrink-0">{tMeta.icon}</span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">{feedback.title}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1 text-[10px] text-white/30">
                  <code>{feedback.feedback_id}</code>
                  <span className="px-1.5 py-0.5 rounded-full border" style={{ color: sMeta.color, borderColor: `${sMeta.color}30`, background: `${sMeta.color}10` }}>{sMeta.label}</span>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: sevMeta.color }} /> {sevMeta.label}</span>
                  <span>{feedback.category}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1"><X size={18} /></button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/60"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* ==== OVERVIEW ==== */}
          {tab === "overview" && (
            <>
              {/* Customer */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Customer</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5"><User size={12} className="text-white/30" /> <span className="text-white/60">{customer.name}</span></div>
                  <div className="flex items-center gap-1.5"><Mail size={12} className="text-white/30" /> <span className="text-white/60 truncate">{customer.email}</span></div>
                  <div className="flex items-center gap-1.5"><Building2 size={12} className="text-white/30" /> <span className="text-white/60">{customer.organization}</span></div>
                  <div className="flex items-center gap-1.5"><Tag size={12} className="text-white/30" /> <span className="text-white/60">{customer.plan} · {customer.role}</span></div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Description</div>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{feedback.description}</p>
                {(feedback.expected_behavior || feedback.actual_behavior || feedback.steps_to_reproduce) && (
                  <div className="mt-3 space-y-1.5 text-xs">
                    {feedback.expected_behavior && <div><span className="text-white/40">Expected: </span><span className="text-white/60">{feedback.expected_behavior}</span></div>}
                    {feedback.actual_behavior && <div><span className="text-white/40">Actual: </span><span className="text-white/60">{feedback.actual_behavior}</span></div>}
                    {feedback.steps_to_reproduce && <div><span className="text-white/40">Steps: </span><span className="text-white/60 whitespace-pre-wrap">{feedback.steps_to_reproduce}</span></div>}
                  </div>
                )}
              </div>

              {/* Tags */}
              {(tags.length > 0 || aiLabels.length > 0) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[...tags, ...aiLabels].map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/50 border border-white/10">{t}</span>
                  ))}
                </div>
              )}

              {/* Admin Controls */}
              {canManage && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                  <div className="text-xs text-white/40 uppercase tracking-wider">Workflow Controls</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-white/30 block mb-1">Status</label>
                      <select value={feedback.status} onChange={e => update({ status: e.target.value })} className={inputCls}>
                        {FEEDBACK_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 block mb-1">Assign Developer</label>
                      <input defaultValue={feedback.assigned_developer || ""} onBlur={e => e.target.value !== feedback.assigned_developer && update({ assigned_developer: e.target.value })} placeholder="Unassigned" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 block mb-1">Severity</label>
                      <select value={feedback.severity} onChange={e => update({ severity: e.target.value })} className={inputCls}>
                        {SEVERITY_LEVELS.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 block mb-1">Roadmap Stage</label>
                      <select value={feedback.roadmap_stage || "backlog"} onChange={e => pm.updateRoadmapStage(feedback.id, e.target.value)} className={inputCls}>
                        {ROADMAP_STAGES.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {!isBug && <button onClick={() => pm.convertToBug(feedback)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20"><Bug size={12} /> Convert to Bug</button>}
                    {!isFeature && <button onClick={() => pm.convertToFeature(feedback)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20"><Lightbulb size={12} /> Convert to Feature</button>}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><FileText size={12} /> Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                        {a.type?.startsWith("image/") ? <img src={a.url} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FileText size={18} className="text-white/30" /></div>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==== AI ANALYSIS ==== */}
          {tab === "ai" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles size={14} className="text-indigo-400" /> <span className="text-sm font-medium text-white">AI Product Analysis</span></div>
                <button onClick={() => pm.analyzeFeedback(feedback.id)} disabled={pm.analyzingId === feedback.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-medium hover:bg-indigo-500/25 disabled:opacity-50">
                  {pm.analyzingId === feedback.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {pm.analyzingId === feedback.id ? "Analyzing..." : (feedback.analyzed_at ? "Re-analyze" : "Run Analysis")}
                </button>
              </div>

              {feedback.analyzed_at ? (
                <>
                  {/* Confidence */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">Confidence Score</span>
                      <span className="text-sm font-bold text-indigo-400">{feedback.ai_confidence || 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${feedback.ai_confidence || 0}%` }} />
                    </div>
                  </div>

                  {feedback.ai_summary && (
                    <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.05] p-4">
                      <div className="text-xs text-indigo-400/80 uppercase tracking-wider mb-1">Executive Summary</div>
                      <p className="text-sm text-white/70">{feedback.ai_summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Sentiment">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: sentiment.color }}><span className="w-2 h-2 rounded-full" style={{ background: sentiment.color }} /> {sentiment.label}</span>
                    </Field>
                    <Field label="Customer Impact"><span className="text-sm text-white/70">{getCustomerImpact(feedback.ai_estimated_customer_impact).label}</span></Field>
                    <Field label="Suggested Priority"><span className="text-sm text-amber-400">{feedback.ai_priority || "—"}</span></Field>
                    <Field label="Suggested Category"><span className="text-sm text-indigo-400">{feedback.ai_category || "—"}</span></Field>
                    <Field label="Responsible Module"><span className="text-sm text-white/70">{feedback.ai_responsible_module || "—"}</span></Field>
                    <Field label="Analyzed"><span className="text-sm text-white/50">{formatRelative(feedback.analyzed_at)}</span></Field>
                  </div>

                  {feedback.ai_business_impact && (
                    <Field label="Business Impact"><p className="text-sm text-white/60">{feedback.ai_business_impact}</p></Field>
                  )}
                  {feedback.ai_suggested_next_action && (
                    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                      <div className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 size={12} /> Suggested Next Action</div>
                      <p className="text-sm text-white/70">{feedback.ai_suggested_next_action}</p>
                    </div>
                  )}
                  {aiLabels.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">{aiLabels.map((l, i) => <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400">{l}</span>)}</div>
                  )}
                  {feedback.ai_duplicate_of && feedback.ai_duplicate_of !== "null" && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400"><AlertTriangle size={12} /> Possible duplicate of: "{feedback.ai_duplicate_of}"</div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-white/30 text-sm">
                  <Sparkles size={28} className="mx-auto text-white/10 mb-2" />
                  No AI analysis yet. Run analysis to generate sentiment, priority, impact, and next-action recommendations.
                </div>
              )}
            </div>
          )}

          {/* ==== ENGINEERING ==== */}
          {tab === "engineering" && (
            <div className="space-y-4">
              {isBug && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-1"><Bug size={12} /> Bug Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <LabeledSelect label="Affected Module" value={feedback.affected_module || ""} onChange={v => update({ affected_module: v })} options={PRODUCT_MODULES} />
                    <LabeledSelect label="Environment" value={feedback.environment || ""} onChange={v => update({ environment: v })} options={ENVIRONMENTS} />
                    <LabeledInput label="Affected Version" defaultValue={feedback.version || ""} onBlur={v => update({ version: v })} />
                    <LabeledInput label="Fix Version" defaultValue={feedback.fix_version || ""} onBlur={v => update({ fix_version: v })} />
                  </div>
                  <LabeledTextarea label="Root Cause" defaultValue={feedback.root_cause || ""} onBlur={v => update({ root_cause: v })} />
                  <LabeledTextarea label="Resolution" defaultValue={feedback.resolution_notes || ""} onBlur={v => update({ resolution_notes: v })} />
                </div>
              )}
              {isFeature && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-1"><Lightbulb size={12} /> Feature Details</div>
                  <div className="grid grid-cols-2 gap-3">
                    <LabeledSelect label="Business Value" value={feedback.business_value || "medium"} onChange={v => update({ business_value: v })} options={BUSINESS_VALUES.map(b => b.id)} />
                    <LabeledSelect label="Effort Estimate" value={feedback.effort_estimate || "m"} onChange={v => update({ effort_estimate: v })} options={EFFORT_ESTIMATES.map(e => e.id)} />
                    <LabeledInput label="Target Release" defaultValue={feedback.target_release || ""} onBlur={v => update({ target_release: v })} />
                    <LabeledInput label="Owner" defaultValue={feedback.owner || ""} onBlur={v => update({ owner: v })} />
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                <div className="text-xs text-white/40 uppercase tracking-wider">Internal Notes</div>
                <div className="flex items-center gap-2">
                  <select value={noteField} onChange={e => setNoteField(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60">
                    <option value="engineering_notes" className="bg-[#0d0d14]">Engineering Notes</option>
                    <option value="investigation_results" className="bg-[#0d0d14]">Investigation Results</option>
                  </select>
                </div>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." rows={3} className={inputCls} />
                <button onClick={handleAddNote} disabled={!noteText.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium disabled:opacity-40"><FileText size={12} /> Add Note</button>

                {feedback.engineering_notes && (
                  <div className="mt-2 text-xs text-white/50 whitespace-pre-wrap bg-white/[0.02] rounded-lg p-3 border border-white/5">{feedback.engineering_notes}</div>
                )}
                {feedback.investigation_results && (
                  <div className="mt-2 text-xs text-white/50 whitespace-pre-wrap bg-white/[0.02] rounded-lg p-3 border border-white/5">{feedback.investigation_results}</div>
                )}
              </div>

              {/* Linked Issues */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1"><Link2 size={12} /> Linked Issues</div>
                <LinkedIssuesEditor feedback={feedback} update={update} />
              </div>
            </div>
          )}

          {/* ==== COMMUNICATIONS ==== */}
          {tab === "communications" && (
            <div className="space-y-4">
              {canManage ? (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div className="text-xs text-white/40 uppercase tracking-wider">Send Customer Update</div>
                  <select value={commStatus} onChange={e => setCommStatus(e.target.value)} className={inputCls}>
                    {["Received", "Under Review", "Planned", "In Development", "Released", "Closed"].map(s => <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>)}
                  </select>
                  <textarea value={commMessage} onChange={e => setCommMessage(e.target.value)} placeholder="Write a message to the customer..." rows={3} className={inputCls} />
                  <button onClick={handleSendComm} disabled={!commMessage.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium disabled:opacity-40"><Send size={12} /> Send & Notify</button>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="text-xs text-white/40 uppercase tracking-wider">Communication History</div>
                {comms.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-6">No customer updates sent yet.</p>
                ) : comms.map((c, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-indigo-500/10 text-indigo-400">{c.status}</span>
                      <span className="text-[10px] text-white/30">{c.date ? new Date(c.date).toLocaleString() : ""} · {c.sent_by}</span>
                    </div>
                    <p className="text-sm text-white/60">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==== LIFECYCLE ==== */}
          {tab === "lifecycle" && (
            <div className="space-y-3">
              <div className="text-xs text-white/40 uppercase tracking-wider">Feedback Lifecycle</div>
              {lifecycle.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">No lifecycle events recorded yet.</p>
              ) : (
                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
                  {lifecycle.map((evt, i) => (
                    <div key={i} className="relative mb-4">
                      <div className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-500/40 bg-[#0a0a0f]" />
                      <div className="text-sm text-white/70">{evt.label || evt.stage}</div>
                      <div className="text-[10px] text-white/30 flex items-center gap-1"><Clock size={10} /> {evt.date ? new Date(evt.date).toLocaleString() : ""}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3"><div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>{children}</div>;
}

function LabeledInput({ label, defaultValue, onBlur }) {
  return (
    <div>
      <label className="text-[10px] text-white/30 block mb-1">{label}</label>
      <input defaultValue={defaultValue || ""} onBlur={e => e.target.value !== defaultValue && onBlur(e.target.value)} placeholder="—" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50" />
    </div>
  );
}

function LabeledTextarea({ label, defaultValue, onBlur }) {
  return (
    <div>
      <label className="text-[10px] text-white/30 block mb-1">{label}</label>
      <textarea defaultValue={defaultValue || ""} onBlur={e => e.target.value !== defaultValue && onBlur(e.target.value)} placeholder="—" rows={2} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50" />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[10px] text-white/30 block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50">
        <option value="" className="bg-[#0d0d14]">—</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0d0d14]">{o}</option>)}
      </select>
    </div>
  );
}

function LinkedIssuesEditor({ feedback, update }) {
  const [input, setInput] = useState("");
  const issues = safeParse(feedback.linked_issues_json, []);
  const add = () => {
    if (!input.trim()) return;
    const next = [...issues, input.trim()];
    update({ linked_issues_json: JSON.stringify(next) });
    setInput("");
  };
  const remove = (idx) => {
    const next = issues.filter((_, i) => i !== idx);
    update({ linked_issues_json: JSON.stringify(next) });
  };
  return (
    <div className="space-y-2">
      {issues.map((iss, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <Link2 size={12} className="text-white/30" />
          <span className="flex-1 text-white/60">{iss}</span>
          <button onClick={() => remove(i)} className="text-white/30 hover:text-red-400"><X size={12} /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Link an issue (e.g. JIRA-123)" className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80" />
        <button onClick={add} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs">Link</button>
      </div>
    </div>
  );
}