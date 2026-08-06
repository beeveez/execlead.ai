import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Database, Sparkles } from 'lucide-react';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return '—';
  }
}

const SKELETON = [0, 1, 2, 3, 4, 5, 6, 7];

export default function CustomerEvidence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke('getCustomerEvidence', {});
        if (alive) setData(res.data || res);
      } catch (e) {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const metrics = data?.metrics || [];
  const anySufficient = data?.anySufficient;
  const fallback = data?.fallbackMessage || 'Growing with our Founding Members.';

  return (
    <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-semibold mb-3">
            <ShieldCheck size={13} /> Customer Evidence Layer™
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Verified Platform Evidence</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Every metric below is generated from verified platform data — never fabricated. Provenance included.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SKELETON.map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-white/8 bg-white/[0.02] shimmer-bg" />
            ))}
          </div>
        ) : !anySufficient ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-8 text-center">
            <Sparkles size={24} className="text-amber-400 mx-auto mb-3" />
            <p className="text-white/80 text-lg font-semibold">{fallback}</p>
            <p className="text-white/40 text-sm mt-2">Evidence will appear here automatically as the platform grows.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex flex-col"
              >
                <div className="flex-1">
                  {m.sufficient ? (
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{m.display}</div>
                  ) : (
                    <div className="text-lg font-semibold text-amber-400/80 mb-1">Growing</div>
                  )}
                  <div className="text-white/55 text-xs leading-snug">{m.label}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                  <Database size={11} className="text-white/30 shrink-0" />
                  <span className="text-[10px] text-white/35">{m.source} · Updated {fmtDate(m.lastUpdated)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}