import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Globe, Building2, TrendingUp, Award } from "lucide-react";

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ icon: Icon, label, value, suffix, color }) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/10 rounded-xl p-5 text-center"
    >
      <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
        <Icon size={18} className="text-amber-400" />
      </div>
      <div className="text-3xl font-bold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/40 text-xs mt-1">{label}</div>
    </motion.div>
  );
}

export default function FoundersWallStats({ stats }) {
  if (!stats) return null;

  const industries = stats.industry_distribution || [];
  const plans = stats.plan_distribution || [];

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Total Founders" value={stats.total_founders || 0} color="#f59e0b" />
        <StatCard icon={Globe} label="Countries" value={stats.countries_represented || 0} color="#3b82f6" />
        <StatCard icon={Award} label="Activated" value={stats.manual_activations || 0} color="#10b981" />
        <StatCard icon={TrendingUp} label="Conversion" value={stats.conversion_forecast || 0} suffix="%" color="#a855f7" />
      </div>

      {/* Industries + Plans */}
      {(industries.length > 0 || plans.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {industries.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium mb-3">
                <Building2 size={14} className="text-amber-400" /> Top Industries
              </div>
              <div className="space-y-2">
                {industries.slice(0, 5).map(({ industry, count }) => {
                  const pct = stats.total_founders > 0 ? Math.round((count / stats.total_founders) * 100) : 0;
                  return (
                    <div key={industry}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{industry || "Unspecified"}</span>
                        <span className="text-white/40">{count}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/50 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {plans.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium mb-3">
                <Trophy size={14} className="text-amber-400" /> Plan Distribution
              </div>
              <div className="space-y-2">
                {plans.map(({ plan, count }) => {
                  const pct = stats.total_founders > 0 ? Math.round((count / stats.total_founders) * 100) : 0;
                  return (
                    <div key={plan}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 capitalize">{plan}</span>
                        <span className="text-white/40">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/50 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}