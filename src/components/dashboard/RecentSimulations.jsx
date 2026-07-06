import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Brain, ArrowRight } from "lucide-react";

const SESSION_LABELS = {
  "45min_interview": "45-Min Interview",
  "60min_interview": "60-Min Interview",
  "panel_interview": "Panel Interview",
  "board_interview": "Board Interview",
  "customer_escalation": "Customer Escalation",
  "executive_service_review": "Service Review",
  "major_incident_bridge": "Incident Bridge",
  "business_review": "Business Review",
  "qbr_simulation": "QBR Simulation",
  "negotiation_meeting": "Negotiation",
  "vendor_dispute": "Vendor Dispute",
  "crisis_management": "Crisis Management",
};

export default function RecentSimulations() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SimulationSession.list("-created_date", 3)
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Recent Simulations</h2>
        <Link to="/simulator" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          New Simulation <ArrowRight size={10} />
        </Link>
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
            <Brain size={20} className="mx-auto text-white/10 mb-2" />
            <p className="text-white/30 text-sm mb-3">No simulations yet.</p>
            <Link to="/simulator" className="text-cyan-400 text-sm hover:text-cyan-300">Run your first simulation</Link>
          </div>
        ) : (
          sessions.map(s => (
            <Link key={s.id} to="/simulator" className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-4 py-3 transition-colors">
              <div className={`text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center ${s.overall_score >= 70 ? "bg-emerald-500/10 text-emerald-400" : s.overall_score >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40"}`}>
                {s.overall_score || "—"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm truncate">{SESSION_LABELS[s.session_type] || s.session_type}</p>
                <p className="text-white/30 text-xs">{s.target_role} · {s.interviewer_profile}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}