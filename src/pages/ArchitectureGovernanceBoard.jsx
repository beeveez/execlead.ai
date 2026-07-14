import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  STATUS_META,
  RECOMMENDATION_META,
  PROPOSAL_TYPE_META,
  generateProposalId,
} from "@/lib/architectureGovernanceEngine";
import ProposalCard from "@/components/architecture-governance/ProposalCard";
import ProposalForm from "@/components/architecture-governance/ProposalForm";
import ProposalDetail from "@/components/architecture-governance/ProposalDetail";
import ReviewPanel from "@/components/architecture-governance/ReviewPanel";
import GovernanceViolations from "@/components/architecture-governance/GovernanceViolations";
import { Plus, Gavel, Search, Building2, ShieldAlert } from "lucide-react";
import { computeGovernanceMetrics } from "@/lib/entityGovernancePolicy";

const STATUSES = Object.entries(STATUS_META);
const TYPES = Object.entries(PROPOSAL_TYPE_META);

export default function ArchitectureGovernanceBoard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const canReview = user && ["super_admin", "platform_admin", "admin", "developer"].includes(user.role);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ArchitectureProposal.list("-created_date", 100);
      setProposals(data);
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (form) => {
    const proposalId = generateProposalId(proposals);
    await base44.entities.ArchitectureProposal.create({
      ...form,
      proposal_id: proposalId,
      status: "submitted",
      submitted_by_id: user?.id,
      submitted_by_name: user?.full_name || user?.email,
      submitted_at: new Date().toISOString(),
      recommendation: "pending",
    });
    setShowForm(false);
    await loadProposals();
  };

  const handleReview = async (reviewData) => {
    await base44.entities.ArchitectureProposal.update(reviewing.id, {
      ...reviewData,
      reviewed_by_id: user?.id,
      reviewed_by_name: user?.full_name || user?.email,
    });
    setReviewing(null);
    setSelected(null);
    await loadProposals();
  };

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterType !== "all" && p.proposal_type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.title?.toLowerCase().includes(q) && !p.proposal_id?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [proposals, filterStatus, filterType, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: proposals.length,
      pending: proposals.filter((p) => ["submitted", "under_review"].includes(p.status)).length,
      approved: proposals.filter((p) => ["approved", "approved_with_conditions"].includes(p.status)).length,
      rejected: proposals.filter((p) => p.status === "rejected").length,
    };
  }, [proposals]);

  const govMetrics = useMemo(() => computeGovernanceMetrics(), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gavel size={14} className="text-white/25" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Architecture Governance Board™</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Architecture Governance Board</h1>
          <p className="text-white/40 text-sm mt-1.5">Every major architectural decision is documented, reviewed, and aligned.</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Plus size={16} className="mr-2" /> New Proposal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Proposals", value: stats.total, color: "#6366f1" },
          { label: "Pending Review", value: stats.pending, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, color: "#10b981" },
          { label: "Rejected", value: stats.rejected, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-white" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Entity Governance Policy™ — Immutability Violations */}
      {govMetrics.violationCount > 0 && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} className="text-red-400" />
            <span className="text-xs uppercase tracking-widest text-red-400 font-medium">
              {govMetrics.violationCount} Governance Violation{govMetrics.violationCount !== 1 ? "s" : ""}
            </span>
          </div>
          <GovernanceViolations />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-indigo-500/40"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-indigo-500/40"
        >
          <option value="all">All Types</option>
          {TYPES.map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No architecture proposals yet. Click "New Proposal" to submit one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProposalCard key={p.id} proposal={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && <ProposalForm onClose={() => setShowForm(false)} onSubmit={handleSubmit} />}
      {selected && (
        <ProposalDetail
          proposal={selected}
          onClose={() => setSelected(null)}
          onReview={() => setReviewing(selected)}
          canReview={canReview}
        />
      )}
      {reviewing && (
        <ReviewPanel
          proposal={reviewing}
          onReview={handleReview}
          onCancel={() => setReviewing(null)}
        />
      )}
    </div>
  );
}