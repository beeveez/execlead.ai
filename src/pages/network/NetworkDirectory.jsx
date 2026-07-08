import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2, Search, Users, UserPlus, MessageSquare, MapPin, Building2,
} from "lucide-react";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { toast } from "@/components/ui/use-toast";

export default function NetworkDirectory() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fIndustry, setFIndustry] = useState("");
  const [connectedIds, setConnectedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [allProfiles, connections] = await Promise.all([
          base44.entities.UserProfile.list("-created_date", 200),
          user?.id
            ? base44.entities.NetworkConnection.filter({ requester_id: user.id })
            : [],
        ]);
        setProfiles(allProfiles);
        setConnectedIds(new Set(connections.map((c) => c.recipient_id)));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const filtered = profiles.filter((p) => {
    if (p.created_by_id === user?.id) return false;
    if (fIndustry && p.industry !== fIndustry) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.current_company?.toLowerCase().includes(q) ||
        p.current_role?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const industries = [...new Set(profiles.map((p) => p.industry).filter(Boolean))].sort();

  const handleConnect = async (profile) => {
    try {
      await base44.entities.NetworkConnection.create({
        requester_id: user?.id,
        requester_name: "You",
        recipient_id: profile.created_by_id,
        recipient_name: profile.full_name,
        status: "pending",
      });
      setConnectedIds((prev) => new Set([...prev, profile.created_by_id]));
      toast({ title: "Connection request sent", description: `You've requested to connect with ${profile.full_name}.` });
    } catch (e) {
      toast({ title: "Could not send request", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Users size={12} className="text-indigo-400" /> Executive Directory
        </div>
        <h1 className="text-xl font-bold text-white">Find Executives</h1>
        <p className="text-white/40 text-sm mt-1">
          Connect with verified executives across industries and regions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, role, country..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select
          value={fIndustry}
          onChange={(e) => setFIndustry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No executives found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-base font-bold text-indigo-400 overflow-hidden shrink-0">
                  {p.profile_photo ? (
                    <img src={p.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (p.full_name || "?").charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm truncate">{p.full_name || "Executive"}</span>
                    {p.founding_member && <FoundingMemberBadge size={10} />}
                  </div>
                  <div className="text-white/40 text-xs truncate">{p.current_role || p.target_role}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                    {p.current_company && (
                      <span className="flex items-center gap-1"><Building2 size={10} /> {p.current_company}</span>
                    )}
                    {p.country && (
                      <span className="flex items-center gap-1"><MapPin size={10} /> {p.country}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConnect(p)}
                  disabled={connectedIds.has(p.created_by_id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    connectedIds.has(p.created_by_id)
                      ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {connectedIds.has(p.created_by_id) ? (
                    <><MessageSquare size={12} /> Connected</>
                  ) : (
                    <><UserPlus size={12} /> Connect</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}