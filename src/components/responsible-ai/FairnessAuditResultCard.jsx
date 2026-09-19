import React from 'react';
import { Scale, AlertTriangle, CheckCircle2, Eye, FileSearch, ShieldAlert, GitBranch, Info } from 'lucide-react';

const STATUS_BADGES = {
  PASS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  FAIL: 'bg-red-500/10 text-red-400 border-red-500/20',
  INSUFFICIENT_DATA: 'bg-white/5 text-white/50 border-white/10',
};

const SEVERITY_BADGES = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  low: 'bg-white/5 text-white/50 border-white/10',
  none: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/30">{label}</div>
      <div className="text-sm text-white/90 mt-0.5">{value}</div>
    </div>
  );
}

export default function FairnessAuditResultCard({ audit }) {
  if (!audit) return null;
  const groups = safeParse(audit.groups_json, []);
  const issues = safeParse(audit.detected_issues_json, []);
  const principles = safeParse(audit.principle_tests_json, []);
  const distribution = safeParse(audit.outcome_distribution_json, {});
  const changedFields = safeParse(audit.changed_fields_json, []);
  const isRevision = (Number(audit.revision_number) || 1) > 1 || Boolean(audit.parent_audit_id);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">{audit.audit_id}</span>
            {isRevision && (
              <span className="flex items-center gap-1 text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">
                <GitBranch size={10} /> Revision {audit.revision_number || '—'}
              </span>
            )}
          </div>
          <div className="text-xs text-white/40">
            {(audit.audit_dimensions || []).join(' · ')} · {audit.assessment_type} · {audit.test_date ? new Date(audit.test_date).toLocaleString() : '—'}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold border rounded-md px-2 py-1 ${STATUS_BADGES[audit.status] || STATUS_BADGES.INSUFFICIENT_DATA}`}>
            {audit.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT DATA' : audit.status}
          </span>
          {audit.human_review_required ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold border rounded-md px-2 py-1 bg-amber-500/10 text-amber-300 border-amber-500/20">
              <ShieldAlert size={11} /> Human review required
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] border rounded-md px-2 py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <CheckCircle2 size={11} /> No review flagged
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Section icon={FileSearch} title="What was tested">
          <div className="space-y-1.5 text-xs text-white/60">
            <div>Population: <span className="text-white/90">{audit.population_definition || '—'}</span></div>
            <div>Model/version: <span className="text-white/90">{audit.model_version || 'unrecorded'}</span></div>
            <div>Assessment version: <span className="text-white/90">{audit.assessment_version || 'unrecorded'}</span></div>
            <div className="text-white/40 pt-1">{audit.test_methodology}</div>
          </div>
        </Section>

        <Section icon={Eye} title="What evidence was used">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Sample size" value={audit.sample_size ?? '—'} />
            <Stat label="Substantive (sufficient evidence)" value={audit.substantive_sample_size ?? '—'} />
            <Stat label="Evidence coverage" value={`${audit.evidence_coverage ?? 0}%`} />
            <Stat label="Explainability coverage" value={`${audit.explainability_coverage ?? 0}%`} />
            <Stat label="Insufficient-evidence rate" value={`${audit.insufficient_evidence_rate ?? 0}%`} />
            <Stat label="Disparity indicator" value={audit.disparity_indicator === null || audit.disparity_indicator === undefined ? 'n/a — sample too small' : `${audit.disparity_indicator} pts`} />
          </div>
          {distribution && Object.keys(distribution).length > 0 && (
            <div className="mt-3 text-[11px] text-white/40">
              Outcome distribution: weak {distribution.weak || 0} · developing {distribution.developing || 0} · strong {distribution.strong || 0} · insufficient evidence {distribution.insufficient_evidence || 0}
            </div>
          )}
        </Section>
      </div>

      {groups.length > 0 && (
        <Section icon={Scale} title="What was found — per group">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 text-left">
                  <th className="py-1.5 pr-3 font-medium">Group</th>
                  <th className="py-1.5 pr-3 font-medium">Sample</th>
                  <th className="py-1.5 pr-3 font-medium">Substantive</th>
                  <th className="py-1.5 pr-3 font-medium">Mean score</th>
                  <th className="py-1.5 pr-3 font-medium">Insuff. evidence</th>
                  <th className="py-1.5 font-medium">Statistical status</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, i) => (
                  <tr key={i} className="border-t border-white/5 text-white/70">
                    <td className="py-1.5 pr-3 text-white/90">{g.group}</td>
                    <td className="py-1.5 pr-3">{g.sampleSize}</td>
                    <td className="py-1.5 pr-3">{g.substantiveSampleSize}</td>
                    <td className="py-1.5 pr-3">{g.meanScore === null ? 'n/a' : g.meanScore}</td>
                    <td className="py-1.5 pr-3">{g.insufficientEvidenceRate}%</td>
                    <td className="py-1.5">
                      <span className={g.statisticalStatus === 'adequate' ? 'text-emerald-400' : 'text-white/40'}>
                        {g.statisticalStatus === 'adequate' ? 'adequate sample' : 'insufficient data — no conclusions drawn'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {audit.status === 'INSUFFICIENT_DATA' && (
            <div className="mt-3 flex items-start gap-2 text-[11px] text-white/40 border border-white/10 rounded-md p-2.5 bg-white/[0.02]">
              <Info size={12} className="mt-0.5 shrink-0" />
              The sample is too small for statistical conclusions. No PASS/FAIL is claimed — this is reported honestly rather than invented.
            </div>
          )}
        </Section>
      )}

      {issues.length > 0 && (
        <Section icon={AlertTriangle} title="Detected issues">
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="border border-white/10 rounded-md p-3 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${SEVERITY_BADGES[issue.severity] || SEVERITY_BADGES.low}`}>{issue.severity}</span>
                  <span className="text-xs font-medium text-white/90">{issue.title}</span>
                </div>
                <div className="text-[11px] text-white/50">{issue.description}</div>
                <div className="text-[11px] text-amber-300/80 mt-1">Remediation: {issue.remediation}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {principles.length > 0 && (
        <Section icon={CheckCircle2} title="Assessment Fairness Principles™">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {principles.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                {p.passed === true ? <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                  : p.passed === false ? <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                  : <Info size={12} className="text-white/30 mt-0.5 shrink-0" />}
                <span>
                  <span className="text-white/80">{p.title}</span>
                  {p.passed === null && <span className="text-white/30"> — not measured in this audit</span>}
                  <div className="text-white/35">{p.evidence}</div>
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Section icon={ShieldAlert} title="Human review boundary">
          <div className="text-xs text-white/60 space-y-1.5">
            <div>AI assessment → evidence → explanation → <span className="text-white/90">human review</span> → human decision.</div>
            <div className="text-white/40">AI output is decision support — never an autonomous employment decision.</div>
            <div className="pt-1">
              <Stat label="Reviewer" value={audit.reviewer || 'Not yet reviewed'} />
            </div>
          </div>
        </Section>

        <Section icon={GitBranch} title="Remediation & challenge readiness">
          <div className="text-xs text-white/60 space-y-1.5">
            <div className="text-white/80">{audit.remediation_recommendation || 'No remediation indicated.'}</div>
            <div className="text-white/40">
              Challenge status: {audit.challenge_status || 'none'}
              {audit.parent_audit_id && ` · supersedes ${audit.parent_audit_id}`}
              {audit.superseded_by_audit_id && ` · superseded by ${audit.superseded_by_audit_id}`}
              {changedFields.length > 0 && ` · changed: ${changedFields.join(', ')}`}
            </div>
            <div className="text-white/30">Assessments can be challenged: additional evidence → reassessment → original preserved → revision traceable → escalation to human review.</div>
          </div>
        </Section>
      </div>
    </div>
  );
}