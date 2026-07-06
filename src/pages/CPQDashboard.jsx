import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, FileText, Plus, TrendingUp, Building2, DollarSign } from "lucide-react";

const STATUS_COLORS = {
  draft: "bg-white/5 text-white/40",
  submitted: "bg-blue-500/10 text-blue-400",
  under_review: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-white/5 text-white/30",
};

function StatCard({ icon: Icon, label, value, color }) {
  const colors = { indigo: "text-indigo-400 bg-indigo-500/10", emerald: "text-emerald-400 bg-emerald-500/10", blue: "text-blue-400 bg-blue-500/10", amber: "text-amber-400 bg-amber-500/10" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}><Icon size={16} /></div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}

export default function CPQDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.CPQQuote.list("-created_date", 100);
        setQuotes(data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const totalPipeline = quotes.reduce((sum, q) => sum + (q.grand_total || 0), 0);
  const totalAnnual = quotes.reduce((sum, q) => sum + (q.annual_value || 0), 0);
  const acceptedCount = quotes.filter(q => q.status === "accepted").length;
  const winRate = quotes.length > 0 ? Math.round(acceptedCount / quotes.length * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <FileText size={12} className="text-indigo-400" /> CPQ Dashboard
          </div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
        </div>
        <Link to="/cpq" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> New Quote
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Total Pipeline" value={`$${totalPipeline.toLocaleString()}`} color="indigo" />
        <StatCard icon={TrendingUp} label="Annual Recurring" value={`$${totalAnnual.toLocaleString()}`} color="emerald" />
        <StatCard icon={FileText} label="Total Quotes" value={quotes.length} color="blue" />
        <StatCard icon={Building2} label="Win Rate" value={`${winRate}%`} color="amber" />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
              <th className="text-left p-4">Proposal #</th>
              <th className="text-left p-4">Organization</th>
              <th className="text-left p-4 hidden md:table-cell">Status</th>
              <th className="text-right p-4 hidden sm:table-cell">Annual</th>
              <th className="text-right p-4">Total</th>
              <th className="text-right p-4"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-8 text-white/30 text-sm">No quotes yet. Create your first enterprise proposal.</td></tr>
            ) : (
              quotes.map(q => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4"><span className="text-white/80 font-mono text-sm">{q.proposal_number}</span></td>
                  <td className="p-4"><span className="text-white/80 text-sm">{q.organization_name}</span></td>
                  <td className="p-4 hidden md:table-cell"><span className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[q.status] || STATUS_COLORS.draft}`}>{q.status}</span></td>
                  <td className="p-4 text-right hidden sm:table-cell"><span className="text-white/60 text-sm">${(q.annual_value || 0).toLocaleString()}</span></td>
                  <td className="p-4 text-right"><span className="text-white font-medium text-sm">${(q.grand_total || 0).toLocaleString()}</span></td>
                  <td className="p-4 text-right"><Link to={`/cpq/quote/${q.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs">View</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}