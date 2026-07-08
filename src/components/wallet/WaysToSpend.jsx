import React from "react";
import { ShoppingBag } from "lucide-react";
import { WAYS_TO_SPEND } from "@/lib/walletEngine";

export default function WaysToSpend() {
  const categories = [...new Set(WAYS_TO_SPEND.map((w) => w.category))];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShoppingBag size={18} className="text-cyan-400" />
        <h2 className="text-white font-semibold">Ways to Spend Wallet Balance</h2>
      </div>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">{cat}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {WAYS_TO_SPEND.filter((w) => w.category === cat).map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] rounded-lg border border-white/5 hover:border-cyan-500/20 transition-colors">
                  <item.icon size={14} className="text-cyan-400 shrink-0" />
                  <span className="text-white/60 text-xs leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}