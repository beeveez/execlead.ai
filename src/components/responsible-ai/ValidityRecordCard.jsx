import React from 'react';
import { BadgeCheck, AlertTriangle, Eye, FileSearch, Scale, GitBranch, ShieldAlert, Info } from 'lucide-react';

const STATUS_BADGES = {
  VALIDATED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REVIEW_REQUIRED: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  INSUFFICIENT_EVIDENCE: 'bg-white/5 text-white/50 border-white/10',
  UNSUPPORTED_CONCLUSION: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const DECISION_BADGES = {
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  modified: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  rejected: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  none: 'bg-white/5 text-white/40 border-white/10',
};

function safeParse(value, fallback) {
  try { const p = JSON.parse(value); return p ?? fallback; } catch { return fallback; }
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-indigo-400" />
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-white/50">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function ValidityRecordCard({ record }) {
  if (!record) return null;
  const evidence = safeParse(record.evidence_json, []);
  const missing = safeParse(record.missing_evidence_json, []);
  const contradictions = safeParse(record.contradictory_evidence_json, []);
  const warnings = safeParse(record.construct_warnings_json, []);
  const wouldImprove = safeParse(record.additional_evidence_would_improve_json, []);
  const changedFields = safeParse(record.changed_fields_json, []);
  const humanEvidence = safeParse(record.human_decision_evidence_json, []);
  const isRevision = (Number(record.revision_number) || 1) > 1 || Boolean(record.parent_validity_id);
  const humanOverride = (record.human_decision_type || 'none') !== 'none';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BadgeCheck size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">{record.validity_id}</span>
            {isRevision && (
              <span className="flex items-center gap-1 text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">
                <GitBranch size={10} /> Revision {record.revision_number}
              </span>
            )}
          </div>
          <div className="text-xs text-white/40">
            {record.dimension} · {record.assessment_type} · assessed {record.assessed_at ? new Date(record.assessed_at).toLocaleString() : '—'}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold border rounded-md px-2 py-1 ${STATUS_BADGES[record.validity_status] || STATUS_BADGES.INSUFFICIENT_EVIDENCE}`}>
            {record.validity_status === 'INSUFFICIENT_EVIDENCE' ? 'INSUFFICIENT EVIDENCE' : record.validity_status}
          </span>
          {record.human_review_required && (
            <span className="flex items-center gap-1 text-[11px] border rounded-md px-2 py-1 bg-amber-500/10 text-amber-300 border-amber-500/20">
              <ShieldAlert size={11} /> Human review recommended
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Section icon={FileSearch} title="What was assessed">
          <div className="space-y-1.5 text-xs text-white/60">
            <div>Dimension: <span className="text-white/90">{record.dimension}</span></div>
            <div>Intended construct: <span className="text-white/90">{record.intended_construct || '—'}</span></div>
            <div>Model/version: <span className="text-white/90">{record.model_version || 'unrecorded'}</span></div>
            <div>Framework: <span className="text-white/90">{record.governance_framework_version || '—'}</span></div>
            {record.provenance_incomplete && (
              <div className="text-[11px] text-white/30 pt-1">Model provenance was never recorded for this assessment — the limitation is preserved, never backfilled.</div>
            )}
          </div>
        </Section>

        <Section icon={Eye} title="Evidence → Conclusion → Confidence">
          <div className="text-xs text-white/60 space-y-1.5">
            <div>Evidence considered: <span className="text-white/90">{evidence.length} item(s)</span>
              {evidence.slice(0, 4).map((e, i) => (
                <div key={i} className="text-[11px] text-white/35 pl-2 border-l border-white/10 mt-0.5">
                  {e.signal_type} · {e.quality} · {e.supports} <span className="text-white/25">({e.source})</span>
                </div>
              ))}
            </div>
            <div>Conclusion: <span className="text-white/90">{record.conclusion || 'none — insufficient evidence'}</span> <span className="text-white/30">({record.conclusion_source || 'evidence_derived'})</span></div>
            <div>Confidence: <span className="text-white/90">{record.confidence_original ?? '—'} → {record.confidence_adjusted ?? '—'}</span> <span className="text-white/30">(adjusted, never inflated)</span></div>
            <div className="text-white/40 pt-1">{record.interpretation}</div>
          </div>
        </Section>
      </div>

      {(missing.length > 0 || wouldImprove.length > 0) && (
        <Section icon={Info} title="Missing evidence & what would improve the assessment">
          <div className="text-xs text-white/60 space-y-2">
            {missing.map((m, i) => <div key={`m${i}`} className="flex items-start gap-2"><AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" /><span>{m}</span></div>)}
            {wouldImprove.map((w, i) => <div key={`w${i}`} className="flex items-start gap-2"><BadgeCheck size={12} className="text-emerald-400 mt-0.5 shrink-0" /><span>{w}</span></div>)}
          </div>
        </Section>
      )}

      {contradictions.length > 0 && (
        <Section icon={Scale} title="Conflicting evidence (preserved — not silently resolved)">
          <div className="space-y-1.5">
            {contradictions.map((c, i) => (
              <div key={i} className="text-[11px] text-white/60 border border-amber-500/20 bg-amber-500/5 rounded-md p-2">
                {c.signal_type} · quality {c.quality} · contradicts <span className="text-white/35">({c.source})</span> — {c.description || 'material conflicting evidence'}
              </div>
            ))}
            <div className="text-[11px] text-white/40 pt-1">Confidence was reduced and the conclusion routed to human review. The system does not simply select whichever evidence supports the stronger conclusion.</div>
          </div>
        </Section>
      )}

      {warnings.length > 0 && (
        <Section icon={AlertTriangle} title="Construct validity warnings">
          <div className="space-y-1">
            {warnings.map((w, i) => <div key={i} className="text-[11px] text-white/50">{w}</div>)}
          </div>
        </Section>
      )}

      <Section icon={ShieldAlert} title="AI conclusion vs human decision">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-white/10 rounded-md p-3 bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300/70 mb-1">AI conclusion (preserved)</div>
            <div className="text-xs text-white/80">{record.conclusion || 'none — insufficient evidence'}</div>
            <div className="text-[11px] text-white/35 mt-1">{record.validity_status} · {record.conclusion_source || 'evidence_derived'}</div>
          </div>
          <div className="border border-white/10 rounded-md p-3 bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Human decision</div>
            {humanOverride ? (
              <>
                <span className={`inline-block text-[10px] font-semibold border rounded px-1.5 py-0.5 mb-1.5 ${DECISION_BADGES[record.human_decision_type] || DECISION_BADGES.none}`}>{record.human_decision_type}</span>
                <div className="text-xs text-white/80">{record.human_decision}</div>
                <div className="text-[11px] text-white/35 mt-1">{record.human_decision_rationale || ''}</div>
                <div className="text-[10px] text-white/25 mt-1">Reviewer: {record.reviewer_name || '—'} · {record.review_date || ''}</div>
                {humanEvidence.length > 0 && <div className="text-[10px] text-white/25 mt-1">Supporting evidence: {humanEvidence.map((e) => e.description || e.signal_type).join('; ')}</div>}
              </>
            ) : (
              <div className="text-xs text-white/40">Awaiting human review{record.human_review_required ? ' — review recommended' : ''}.</div>
            )}
          </div>
        </div>
        <div className="text-[11px] text-white/30 mt-2">
          AI assessment → evidence → explanation → human review → human decision. EXECLEAD.AI provides decision support — never an autonomous employment decision.
        </div>
      </Section>

      {(record.parent_validity_id || record.superseded_by_validity_id || changedFields.length > 0) && (
        <div className="text-[11px] text-white/35 flex items-center gap-2 flex-wrap">
          <GitBranch size={11} />
          {record.parent_validity_id && `supersedes ${record.parent_validity_id}`}
          {record.superseded_by_validity_id && ` · superseded by ${record.superseded_by_validity_id}`}
          {changedFields.length > 0 && ` · changed: ${changedFields.join(', ')}`}
          {record.revision_reason && ` · reason: ${record.revision_reason}`}
        </div>
      )}
    </div>
  );
}