import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, Ban, ChevronDown, ChevronRight, Eye, FileText } from 'lucide-react';
import { EVIDENCE_TYPES, VERIFICATION_STATUSES, SOURCE_TYPES, getEvidenceTypeMeta, resolveEvidenceType, getSourceMeta, getQualityLabel, calculateEvidenceQualityScore, filterAndSortEvidence, parseTags, parseAIFlags } from '@/lib/evidenceVaultEngine';

const STATUS_ICONS = { unverified: Eye, pending: Clock, verified: CheckCircle2, rejected: XCircle, expired: AlertCircle, revoked: Ban };

export default function EvidenceExplorer({ evidenceItems, onSelectEvidence, selectedId }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    return filterAndSortEvidence(evidenceItems, { search, type: typeFilter, status: statusFilter, sourceType: sourceFilter, sortBy, sortDir: 'desc' });
  }, [evidenceItems, search, typeFilter, statusFilter, sourceFilter, sortBy]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Executive Evidence Explorer™</span>
        <span className="text-[10px] text-white/30 ml-auto">{filtered.length} of {evidenceItems?.length || 0}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/30"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-indigo-500/30">
          <option value="all">All Types</option>
          {EVIDENCE_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-indigo-500/30">
          <option value="all">All Statuses</option>
          {Object.entries(VERIFICATION_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-indigo-500/30">
          <option value="all">All Sources</option>
          {SOURCE_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-indigo-500/30">
          <option value="date">Sort: Date</option>
          <option value="quality">Sort: Quality</option>
          <option value="confidence">Sort: Confidence</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {/* Evidence List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={28} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No evidence items match your filters.</p>
          </div>
        ) : (
          filtered.map((evidence, idx) => {
            const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(evidence));
            const statusMeta = VERIFICATION_STATUSES[evidence.verification_status] || VERIFICATION_STATUSES.unverified;
            const sourceMeta = getSourceMeta(evidence.source_type);
            const quality = calculateEvidenceQualityScore(evidence);
            const qualityLabel = getQualityLabel(quality);
            const StatusIcon = STATUS_ICONS[evidence.verification_status] || Eye;
            const isExpanded = expanded === (evidence.id || idx);
            const isSelected = selectedId === evidence.id;

            return (
              <div key={evidence.id || idx} className={`border-b border-white/5 last:border-b-0 transition-colors ${isSelected ? 'bg-indigo-500/[0.03]' : ''}`}>
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => {
                    setExpanded(isExpanded ? null : (evidence.id || idx));
                    onSelectEvidence?.(evidence);
                  }}
                >
                  {isExpanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeMeta.color + '15' }}>
                    <ShieldCheck size={14} style={{ color: typeMeta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white truncate">{evidence.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: typeMeta.color + '15', color: typeMeta.color }}>{typeMeta.label}</span>
                    </div>
                    <div className="text-[10px] text-white/30 mt-0.5 truncate">
                      {evidence.organization || '—'} · {sourceMeta.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: statusMeta.color }}>
                      <StatusIcon size={11} /> {statusMeta.label}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ backgroundColor: qualityLabel.color + '10' }}>
                      <span className="text-[10px] text-white/30">Q:</span>
                      <span className="text-[11px] font-bold" style={{ color: qualityLabel.color }}>{quality}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 bg-white/[0.01]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                      <Field label="Source" value={evidence.source || '—'} />
                      <Field label="Issue Date" value={evidence.date ? new Date(evidence.date).toLocaleDateString() : '—'} />
                      <Field label="Reviewer" value={evidence.reviewer_name || evidence.verifier || '—'} />
                      <Field label="AI Review" value={evidence.ai_review_status === 'completed' ? `✓ ${evidence.ai_confidence}%` : evidence.ai_review_status} />
                    </div>
                    {evidence.description && <p className="text-[11px] text-white/40 mt-2">{evidence.description}</p>}
                    {parseAIFlags(evidence).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {parseAIFlags(evidence).map((flag, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15">{flag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-white/30 mb-0.5">{label}</div>
      <div className="text-white/60">{value}</div>
    </div>
  );
}