import React from "react";
import { Users, Minus, Plus } from "lucide-react";

export default function SeatSelector({ seats, onChange, seatTiers }) {
  const sortedTiers = [...(seatTiers || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const currentTier = sortedTiers.find(t => {
    if (seats >= t.min_seats) {
      const max = t.max_seats || 0;
      return max === 0 || seats <= max;
    }
    return false;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => onChange(Math.max(100, seats - 50))} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"><Minus size={16} /></button>
        <input
          type="number"
          min="100"
          value={seats}
          onChange={(e) => onChange(Math.max(100, parseInt(e.target.value) || 100))}
          className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-center text-lg font-bold text-white focus:outline-none focus:border-indigo-500/50"
        />
        <button onClick={() => onChange(seats + 50)} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"><Plus size={16} /></button>
        {currentTier && (
          <div className="ml-auto text-right">
            <div className="text-white/40 text-xs">Tier: {currentTier.tier_name}</div>
            <div className="text-indigo-400 font-bold">${currentTier.annual_price_per_user}/user/yr</div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sortedTiers.map(tier => {
          const isActive = currentTier?.tier_name === tier.tier_name;
          return (
            <div key={tier.tier_name} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${isActive ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "bg-white/[0.02] text-white/30 border border-white/5"}`}>
              {tier.tier_name} · ${tier.annual_price_per_user}/yr
            </div>
          );
        })}
      </div>
    </div>
  );
}