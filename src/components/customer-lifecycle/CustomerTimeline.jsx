import React from "react";
import { Clock, FileText, Mail, LogIn, Brain, Award, MessageSquare, Shield, Gift, BookOpen } from "lucide-react";
import { SectionCard, EmptyState } from "./Shared";

const EVENT_ICONS = {
  application: FileText, invitation: Mail, activation: LogIn, simulation: Brain,
  learning: BookOpen, feedback: MessageSquare, insight: MessageSquare,
  certification: Award, referral: Gift, security: Shield,
};

export default function CustomerTimeline({ data, onSelectCustomer }) {
  const { customers } = data;
  const allEvents = customers
    .flatMap((c) => c.timeline?.map((e) => ({ ...e, customer: c })) || [])
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!allEvents.length) return <EmptyState message="No timeline events found" />;

  return (
    <SectionCard title="Unified Activity Timeline™" icon={Clock}>
      <div className="max-h-[600px] overflow-y-auto pr-2">
        <div className="space-y-2">
          {allEvents.slice(0, 100).map((event, i) => {
            const Icon = EVENT_ICONS[event.type] || Clock;
            return (
              <div key={i} className="flex gap-3 group cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => onSelectCustomer?.(event.customer)}>
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white/80 text-sm truncate">{event.label}</p>
                    <span className="text-white/30 text-xs shrink-0">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/40 text-xs truncate">{event.customer.fullName || event.customer.email}</p>
                  {event.detail && <p className="text-white/30 text-xs">{event.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}