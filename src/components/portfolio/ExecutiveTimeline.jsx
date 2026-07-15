import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

const TYPE_META = {
  Achievement: { color: '#10b981', label: 'Achievement' },
  Certificate: { color: '#8b5cf6', label: 'Certification' },
  default: { color: '#6366f1', label: 'Event' },
};

export default function ExecutiveTimeline({ data }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const items = [
      ...(data.achievements || []).map(a => ({ id: a.id, type: 'Achievement', title: a.title || a.description || 'Achievement', date: a.date || a.created_date, org: a.organization || '' })),
      ...(data.certificates || []).map(c => ({ id: c.id, type: 'Certificate', title: c.title || c.name || 'Certification', date: c.issued_date || c.created_date, org: c.issuer || '' })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setEvents(items);
  }, [data]);

  return (
    <PortfolioSection id="timeline" title="Executive Timeline™" icon={Calendar} color="#8b5cf6">
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.slice(0, 15).map((evt) => {
            const meta = TYPE_META[evt.type] || TYPE_META.default;
            return (
              <div key={evt.id} className="flex items-start gap-3 pl-3 border-l-2" style={{ borderColor: `${meta.color}40` }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: meta.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium truncate">{evt.title}</div>
                  <div className="text-[10px] text-white/30">
                    {evt.date ? new Date(evt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''}
                    {evt.org ? ` · ${evt.org}` : ''}
                  </div>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>{meta.label}</span>
              </div>
            );
          })}
          {events.length > 15 && <div className="text-[10px] text-white/30 text-center pt-1">+ {events.length - 15} more events</div>}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30">No timeline events yet. Add achievements and certifications to build your timeline.</p>
        </div>
      )}
    </PortfolioSection>
  );
}