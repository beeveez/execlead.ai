import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { COUNTRIES } from "@/lib/payments";
import { Trophy, Users, Globe, Loader2, Crown, ArrowRight } from "lucide-react";

const PLAN_LABELS = { professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" };
const STATUS_STYLES = {
  reserved: "bg-blue-500/10 text-blue-400",
  approved: "bg-amber-500/10 text-amber-400",
  invited: "bg-purple-500/10 text-purple-400",
  activated: "bg-emerald-500/10 text-emerald-400",
};

function getCountryName(code) {
  return COUNTRIES.find((c) => c.code === code)?.name || code || "—";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function FounderDirectory() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("reserveFoundingMembership", { action: "directory" })
      .then((res) => {
        const data = res.data || res;
        setMembers(data.members || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <Crown size={14} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">The Founding Chapter</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Founder Directory</h1>
          <p className="text-white/40 max-w-xl mx-auto">
            The visionaries who believed in EXECLEAD.AI from the very beginning. These are the founding members who shaped our platform.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={32} className="text-amber-400/30 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No founding members have gone public yet.</p>
            <Link to="/pricing" className="inline-flex items-center gap-1.5 mt-4 text-amber-400 text-sm hover:underline">
              Reserve your spot <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-8">
              <Users size={14} /> {members.length} Founding Member{members.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m, i) => (
                <motion.div key={m.founding_member_number}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/10 rounded-xl p-5 hover:border-amber-500/30 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Trophy size={16} className="text-amber-400" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_STYLES[m.status] || "bg-white/5 text-white/40"}`}>
                      {m.status}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">{m.full_name || "Anonymous Founder"}</h3>
                  <p className="text-white/40 text-xs mb-3">{m.profession || PLAN_LABELS[m.preferred_plan] || "Executive"}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <span className="text-amber-400/60 font-mono">{m.founding_member_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Globe size={11} /> {getCountryName(m.country)}
                    </div>
                    <div className="text-white/30">Joined {formatDate(m.reservation_date)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-medium transition-colors">
            <Trophy size={16} /> Join the Founding Chapter
          </Link>
        </div>
      </div>
    </div>
  );
}