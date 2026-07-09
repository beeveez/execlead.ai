import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Trophy, ArrowRight, Users, Globe } from "lucide-react";

export default function FoundersWallCTA() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    base44.functions.invoke("reserveFoundingMembership", { action: "wall" })
      .then((res) => {
        const d = res.data || res;
        setStats(d.stats);
      })
      .catch(() => {});
  }, []);

  const total = stats?.total_founders || 0;
  const countries = stats?.countries_represented || 0;

  if (total === 0) return null;

  return (
    <section className="py-16 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-3">
                <Trophy size={12} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">The Founding Chapter</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Join <span className="gold-shimmer">{total} Founding Members</span>
                <br />from {countries} {countries === 1 ? "Country" : "Countries"}
              </h2>
              <p className="text-white/40 text-sm max-w-md">
                Be part of EXECLEAD.AI history. Founder numbers are permanent and immutable.
              </p>
            </div>
            <Link
              to="/founders"
              className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              View Founders Wall <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}