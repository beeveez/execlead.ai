import React from "react";
import { Sunrise, Target, Calendar, Users, GraduationCap, Gift, Wallet, Trophy, CalendarDays, CheckSquare, Loader2, RefreshCw } from "lucide-react";

function BriefingSection({ icon: Icon, title, items, color }) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className={color || 'text-indigo-400'} />
        <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider">{title}</h4>
      </div>
      {Array.isArray(items) ? (
        <ul className="space-y-1 ml-5">
          {items.map((item, i) => (
            <li key={i} className="text-white/50 text-sm leading-relaxed flex gap-1.5">
              <span className="text-white/20">•</span> {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/50 text-sm leading-relaxed ml-5">{items}</p>
      )}
    </div>
  );
}

export default function DailyBriefing({ briefing, loading, cached, onRefresh }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-indigo-400 mb-3" />
        <p className="text-white/40 text-sm">Your Chief of Staff is preparing your briefing...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="text-center py-12">
        <Sunrise size={32} className="mx-auto text-white/10 mb-3" />
        <p className="text-white/40 text-sm font-medium">No briefing yet</p>
        <p className="text-white/20 text-xs mt-1 mb-4">Generate your daily executive briefing.</p>
        <button onClick={onRefresh} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Sunrise size={15} /> Generate Briefing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {briefing.summary && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-white/70 text-sm leading-relaxed italic">"{briefing.summary}"</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BriefingSection icon={Target} title="Today's Priorities" items={briefing.priorities} color="text-red-400" />
        <BriefingSection icon={Calendar} title="Upcoming" items={briefing.upcoming} color="text-blue-400" />
        <BriefingSection icon={Users} title="Networking" items={briefing.networking} color="text-green-400" />
        <BriefingSection icon={GraduationCap} title="Learning" items={briefing.learning} color="text-cyan-400" />
        <BriefingSection icon={Gift} title="Referrals" items={briefing.referrals} color="text-purple-400" />
        <BriefingSection icon={Wallet} title="Wallet" items={briefing.wallet} color="text-teal-400" />
        <BriefingSection icon={Trophy} title="Ranking" items={briefing.ranking} color="text-amber-400" />
        <BriefingSection icon={CalendarDays} title="Events" items={briefing.events} color="text-pink-400" />
      </div>
      <BriefingSection icon={CheckSquare} title="Action Items" items={briefing.action_items} color="text-emerald-400" />
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[10px] text-white/20">
          {cached ? `Generated earlier today` : 'Just generated'} by Executive Chief of Staff
        </span>
        <button onClick={onRefresh} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>
    </div>
  );
}