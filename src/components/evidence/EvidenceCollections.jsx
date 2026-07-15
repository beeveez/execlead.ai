import React, { useState, useEffect, useCallback } from 'react';
import { FolderPlus, Folder, Trash2, Plus, X, Check, Loader2, FolderCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { COLLECTION_TEMPLATES, getCollectionTemplate, calculateCollectionCompleteness } from '@/lib/evidenceIntelligenceEngine';
import { getEvidenceTypeMeta, resolveEvidenceType } from '@/lib/evidenceVaultEngine';

export default function EvidenceCollections({ evidenceItems }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('leadership_portfolio');
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [addingTo, setAddingTo] = useState(null);

  const load = useCallback(async () => {
    try {
      const items = await base44.entities.EvidenceCollection.list('-created_date', 50);
      setCollections(items || []);
    } catch (e) { /* error */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const template = getCollectionTemplate(newType);
    try {
      const collection = await base44.entities.EvidenceCollection.create({
        name: newName,
        collection_type: newType,
        description: template.description,
        evidence_ids: JSON.stringify([]),
        status: 'draft',
        item_count: 0,
      });
      setCollections(prev => [collection, ...prev]);
      setNewName('');
      setShowCreate(false);
    } catch (e) { /* error */ }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.EvidenceCollection.delete(id);
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (e) { /* error */ }
  };

  const parseIds = (col) => {
    try { return JSON.parse(col.evidence_ids || '[]'); } catch { return []; }
  };

  const handleAddEvidence = async (collection, evidenceId) => {
    const ids = parseIds(collection);
    if (ids.includes(evidenceId)) return;
    ids.push(evidenceId);
    try {
      await base44.entities.EvidenceCollection.update(collection.id, {
        evidence_ids: JSON.stringify(ids),
        item_count: ids.length,
        completeness_score: calculateCollectionCompleteness(ids, evidenceItems),
      });
      await load();
      setAddingTo(null);
    } catch (e) { /* error */ }
  };

  const handleRemoveEvidence = async (collection, evidenceId) => {
    const ids = parseIds(collection).filter(id => id !== evidenceId);
    try {
      await base44.entities.EvidenceCollection.update(collection.id, {
        evidence_ids: JSON.stringify(ids),
        item_count: ids.length,
        completeness_score: calculateCollectionCompleteness(ids, evidenceItems),
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
        <FolderCheck size={14} className="text-purple-400" />
        <span className="text-sm font-bold text-white">Executive Evidence Collections™</span>
        <span className="text-[10px] text-white/30 ml-auto">{collections.length} collection{collections.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 transition-colors">
          <FolderPlus size={11} /> New
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-3 space-y-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Collection name..." className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/30" autoFocus />
          <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-purple-500/30">
            {COLLECTION_TEMPLATES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-xs text-purple-300 font-medium transition-colors"><Plus size={11} /> Create</button>
            <button onClick={() => setShowCreate(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 transition-colors"><X size={11} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Collections list */}
      {collections.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Folder size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No collections yet. Create one to organize your evidence.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {collections.map(col => {
            const template = getCollectionTemplate(col.collection_type);
            const ids = parseIds(col);
            const items = evidenceItems?.filter(e => ids.includes(e.id)) || [];
            const isExpanded = expandedCollection === col.id;
            return (
              <div key={col.id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02]" onClick={() => setExpandedCollection(isExpanded ? null : col.id)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: template.color + '15' }}>
                    <Folder size={14} style={{ color: template.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white truncate">{col.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: template.color + '15', color: template.color }}>{template.label}</span>
                    </div>
                    <div className="text-[10px] text-white/30 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} · {col.completeness_score || 0}% complete</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${col.completeness_score || 0}%`, backgroundColor: template.color }} />
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 border-t border-white/5">
                    {items.length > 0 ? (
                      <div className="space-y-1 mt-2">
                        {items.map(item => {
                          const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(item));
                          return (
                            <div key={item.id} className="flex items-center gap-2 text-[11px] py-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeMeta.color }} />
                              <span className="text-white/60 flex-1 truncate">{item.title}</span>
                              <span className="text-[9px] text-white/30">{typeMeta.label}</span>
                              <button onClick={() => handleRemoveEvidence(col, item.id)} className="text-white/20 hover:text-red-400"><X size={10} /></button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/30 mt-2">No evidence items in this collection yet.</p>
                    )}

                    {/* Add evidence dropdown */}
                    {addingTo === col.id ? (
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {(evidenceItems || []).filter(e => !ids.includes(e.id)).map(e => (
                          <div key={e.id} className="flex items-center gap-2 text-[11px] py-1 cursor-pointer hover:bg-white/[0.03] rounded px-2" onClick={() => handleAddEvidence(col, e.id)}>
                            <Plus size={10} className="text-purple-400" />
                            <span className="text-white/60 flex-1 truncate">{e.title}</span>
                          </div>
                        ))}
                        <button onClick={() => setAddingTo(null)} className="text-[10px] text-white/30 hover:text-white/50 mt-1">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingTo(col.id)} className="flex items-center gap-1 mt-2 text-[11px] text-purple-400 hover:text-purple-300">
                        <Plus size={10} /> Add evidence
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}