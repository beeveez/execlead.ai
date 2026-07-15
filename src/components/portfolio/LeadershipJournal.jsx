import React, { useState, useEffect } from 'react';
import { PenLine, Plus, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

export default function LeadershipJournal({ data }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(data.journalEntries || []);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.JournalEntry.filter({}, '-created_date', 10)
      .then(res => setEntries(res || []))
      .catch(() => setEntries([]));
  }, []);

  const filtered = entries.filter(e => !search || (e.title || e.content || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <PortfolioSection id="journal" title="Leadership Journal™" icon={PenLine} color="#14b8a6"
      action={<button onClick={() => navigate('/journal')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> Journal</button>}>
      <div className="relative mb-3">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/30" />
      </div>
      {filtered.length > 0 ? (
        <div className="space-y-1.5">
          {filtered.slice(0, 5).map((e) => (
            <div key={e.id} className="bg-white/[0.02] rounded-lg p-2.5">
              <div className="text-xs text-white/70 font-medium truncate">{e.title || 'Untitled'}</div>
              <div className="text-[10px] text-white/30 truncate">{e.content?.substring(0, 80) || ''}...</div>
              <div className="text-[9px] text-white/20 mt-0.5">{e.created_date ? new Date(e.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">No journal entries yet.</p>
          <button onClick={() => navigate('/journal')} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs hover:bg-teal-500/20"><Plus size={10} /> New Entry</button>
        </div>
      )}
    </PortfolioSection>
  );
}