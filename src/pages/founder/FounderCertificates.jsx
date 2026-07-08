import React from "react";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { formatFoundingMemberDate } from "@/lib/foundingMember";
import { Award, Check, Loader2, Download, Crown } from "lucide-react";

export default function FounderCertificates() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const issued = member.certificate_issued;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Founder Certificates</h1>
        <p className="text-white/40 text-sm">Official certificates of founding membership.</p>
      </div>

      <div className={`rounded-2xl p-6 border ${issued ? "bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20" : "bg-white/[0.03] border-white/5"}`}>
        {issued ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-amber-400" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-1">Certificate Issued</h2>
            <p className="text-white/40 text-sm mb-4">
              Your Founding Member certificate was issued on {member.certificate_issued_date ? formatFoundingMemberDate(member.certificate_issued_date) : "N/A"}.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
              <FoundingMemberBadge size={14} joinedDate={member.joined_date} />
            </div>
            <div>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">
                <Download size={14} /> Download Certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Crown size={32} className="mx-auto text-amber-400/40 mb-3" />
            <h2 className="text-white/70 font-medium text-sm mb-1">Certificate Not Yet Issued</h2>
            <p className="text-white/30 text-xs">Your founding member certificate will be issued by the platform administration.</p>
          </div>
        )}
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h3 className="text-white/70 text-sm font-medium mb-3">Certificate Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Status</div>
            <div className={issued ? "text-emerald-400" : "text-white/40"}>{issued ? "Issued" : "Pending"}</div>
          </div>
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Issue Date</div>
            <div className="text-white/70">{member.certificate_issued_date ? formatFoundingMemberDate(member.certificate_issued_date) : "—"}</div>
          </div>
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Founder Number</div>
            <div className="text-white/70 font-mono">#{member.founding_member_number}</div>
          </div>
          <div>
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Joined</div>
            <div className="text-white/70">{formatFoundingMemberDate(member.joined_date)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}