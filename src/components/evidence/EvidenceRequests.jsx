import React, { useState, useEffect, useCallback } from 'react';
import { Send, Upload, Eye, CheckCircle2, XCircle, AlertCircle, Clock, Loader2, FileSearch } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { REQUEST_STATUSES, getRequestStatusMeta } from '@/lib/evidenceIntelligenceEngine';
import { EVIDENCE_TYPES } from '@/lib/evidenceVaultEngine';

const STATUS_ICONS = { requested: Send, submitted: Upload, under_review: Eye, approved: CheckCircle2, rejected: XCircle, expired: AlertCircle };

export default function EvidenceRequests({ evidenceItems }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('employment');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const load = useCallback(async () => {
    try {
      const items = await base44.entities.EvidenceRequest.list('-created_date', 50);
      setRequests(items || []);
    } catch (e) { /* error */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const req = await base44.entities.EvidenceRequest.create({
        title: newTitle,
        evidence_type_requested: newType,
        description: newDesc,
        deadline: newDeadline || null,
        status: 'requested',
        priority: 'medium',
        requesting_user_id: user?.id,
        requesting_user_name: user?.full_name || user?.email,
        target_user_id: user?.id,
        target_user_name: user?.full_name || user?.email,
        target_user_email: user?.email,
      });
      setRequests(prev => [req, ...prev]);
      setNewTitle(''); setNewDesc(''); setNewDeadline(''); setShowCreate(false);
    } catch (e) { /* error */ }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updates = { status, reviewed_date: status === 'approved' || status === 'rejected' ? new Date().toISOString() : null, reviewer_id: user?.id, reviewer_name: user?.full_name || user?.email };
      await base44.entities.EvidenceRequest.update(id, updates);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (e) { /* error */ }
  };

  const handleLinkEvidence = async (requestId, evidenceId) => {
    try {
      await base44.entities.EvidenceRequest.update(requestId, {
        related_evidence_id: evidenceId,
        status: 'submitted',
        submitted_date: new Date().toISOString(),
      });
      await load();
    } catch (e) { /* error */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Send size={14} className="text-blue-400" />
        <span className="text-sm font-bold text-white">Evidence Requests™</span>
        <span className="text-[10px] text-white/30 ml-auto">{requests.length} request{requests.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-colors">
          <Send size={11} /> Request
        </button>
      </div>

      {showCreate && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-3 space-y-2">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Request title..." className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/30" autoFocus />
          <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-blue-500/30">
            {EVIDENCE_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What evidence is needed and why..." className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/30 resize-none" rows="2" />
          <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-blue-500/30" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-xs text-blue-300 font-medium">Create Request</button>
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50">Cancel</button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <FileSearch size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No evidence requests yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(req => {
            const statusMeta = getRequestStatusMeta(req.status);
            const StatusIcon = STATUS_ICONS[req.status] || Clock;
            const typeMeta = EVIDENCE_TYPES.find(t => t.key === req.evidence_type_requested) || EVIDENCE_TYPES[0];
            const linkedEvidence = evidenceItems?.find(e => e.id === req.related_evidence_id);

            return (
              <div key={req.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: statusMeta.color + '15' }}>
                    <StatusIcon size={14} style={{ color: statusMeta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-white">{req.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: typeMeta.color + '15', color: typeMeta.color }}>{typeMeta.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: statusMeta.color + '15', color: statusMeta.color }}>{statusMeta.label}</span>
                    </div>
                    {req.description && <p className="text-[11px] text-white/40 mt-1">{req.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
                      {req.deadline && <span className="flex items-center gap-0.5"><Clock size={9} /> Due {new Date(req.deadline).toLocaleDateString()}</span>}
                      {linkedEvidence && <span className="flex items-center gap-0.5 text-emerald-400"><CheckCircle2 size={9} /> Linked: {linkedEvidence.title}</span>}
                    </div>

                    {/* Actions */}
                    {req.status === 'requested' && (
                      <div className="mt-2">
                        <select
                          onChange={(e) => e.target.value && handleLinkEvidence(req.id, e.target.value)}
                          defaultValue=""
                          className="bg-white/[0.03] border border-white/5 rounded-lg px-2 py-1 text-[11px] text-white/70 focus:outline-none focus:border-blue-500/30"
                        >
                          <option value="">Link evidence...</option>
                          {(evidenceItems || []).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                        </select>
                      </div>
                    )}
                    {req.status === 'submitted' && (
                      <div className="flex gap-1 mt-2">
                        <button onClick={() => handleStatusChange(req.id, 'approved')} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15">Approve</button>
                        <button onClick={() => handleStatusChange(req.id, 'rejected')} className="text-[10px] px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15">Reject</button>
                        <button onClick={() => handleStatusChange(req.id, 'under_review')} className="text-[10px] px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/15">Review</button>
                      </div>
                    )}
                    {req.status === 'under_review' && (
                      <div className="flex gap-1 mt-2">
                        <button onClick={() => handleStatusChange(req.id, 'approved')} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15">Approve</button>
                        <button onClick={() => handleStatusChange(req.id, 'rejected')} className="text-[10px] px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}