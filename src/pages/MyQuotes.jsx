import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { generateProposalNumber } from "@/lib/cpqEngine";
import { shareProposal } from "@/lib/enterpriseOrder";
import { toast } from "@/components/ui/use-toast";
import ShareProposalModal from "@/components/cpq/ShareProposalModal";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2, FileText, Plus, MoreVertical, Eye, Pencil, Copy, Download,
  Share2, Trash2, Archive, ArchiveRestore, Inbox, FileX,
} from "lucide-react";

const STATUS_STYLES = {
  draft: "bg-white/5 text-white/40",
  submitted: "bg-blue-500/10 text-blue-400",
  under_review: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  accepted: "bg-indigo-500/10 text-indigo-400",
  contract_signed: "bg-indigo-500/10 text-indigo-400",
  invoice_issued: "bg-amber-500/10 text-amber-400",
  payment_pending: "bg-amber-500/10 text-amber-400",
  paid: "bg-indigo-500/10 text-indigo-400",
  provisioned: "bg-emerald-500/10 text-emerald-400",
  active: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
  expired: "bg-white/5 text-white/30",
};

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  accepted: "Accepted",
  contract_signed: "Contract Signed",
  invoice_issued: "Invoice Issued",
  payment_pending: "Payment Pending",
  paid: "Paid",
  provisioned: "Provisioned",
  active: "Activated",
  rejected: "Rejected",
  expired: "Expired",
};

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "paid", label: "Paid" },
  { value: "active", label: "Activated" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function MyQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareProposalNumber, setShareProposalNumber] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [acting, setActing] = useState(null);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await base44.entities.CPQQuote.filter(
        { created_by_id: user.id },
        "-updated_date",
        100
      );
      setQuotes(data);
    } catch (e) {
      setQuotes([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleDuplicate = async (q) => {
    setActing(q.id);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      await base44.entities.CPQQuote.create({
        proposal_number: generateProposalNumber(),
        status: "draft",
        organization_name: q.organization_name,
        industry: q.industry,
        country: q.country,
        headquarters: q.headquarters,
        company_size: q.company_size,
        annual_revenue: q.annual_revenue,
        num_employees: q.num_employees,
        expected_active_users: q.expected_active_users,
        expected_managers: q.expected_managers,
        expected_executives: q.expected_executives,
        implementation_timeline: q.implementation_timeline,
        current_lms: q.current_lms,
        current_hr_platform: q.current_hr_platform,
        current_identity_provider: q.current_identity_provider,
        config_json: q.config_json,
        breakdown_json: q.breakdown_json,
        currency: q.currency,
        contract_length_years: q.contract_length_years,
        annual_value: q.annual_value,
        total_contract_value: q.total_contract_value,
        grand_total: q.grand_total,
        customer_email: q.customer_email,
        notes: q.notes,
        valid_until: validUntil.toISOString().split("T")[0],
      });
      toast({ title: "Quote Duplicated", description: "A new draft has been created from this proposal." });
      await load();
    } catch (e) {
      toast({ title: "Duplicate Failed", description: "Could not duplicate quote.", variant: "destructive" });
    }
    setActing(null);
  };

  const handleShare = async (q) => {
    setActing(q.id);
    try {
      const result = await shareProposal(q.id);
      setShareUrl(result.shareUrl);
      setShareProposalNumber(q.proposal_number);
    } catch (e) {
      toast({ title: "Share Failed", description: "Could not generate share link.", variant: "destructive" });
    }
    setActing(null);
  };

  const handleArchive = async (q, archive) => {
    setActing(q.id);
    try {
      await base44.entities.CPQQuote.update(q.id, { is_archived: archive });
      toast({ title: archive ? "Quote Archived" : "Quote Restored", description: q.proposal_number });
      await load();
    } catch (e) {
      toast({ title: "Action Failed", description: "Could not update quote.", variant: "destructive" });
    }
    setActing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActing(deleteTarget.id);
    try {
      await base44.entities.CPQQuote.delete(deleteTarget.id);
      toast({ title: "Quote Deleted", description: `${deleteTarget.proposal_number} has been deleted.` });
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast({ title: "Delete Failed", description: "Could not delete quote.", variant: "destructive" });
    }
    setActing(null);
  };

  const filtered = quotes.filter((q) => {
    if (!showArchived && q.is_archived) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    return true;
  });

  const totalAnnual = quotes.filter(q => !q.is_archived).reduce((s, q) => s + (q.annual_value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <FileText size={12} className="text-indigo-400" /> Enterprise Proposals
          </div>
          <h1 className="text-2xl font-bold text-white">My Quotes</h1>
          <p className="text-white/40 text-sm mt-1">{quotes.filter(q => !q.is_archived).length} proposals · {totalAnnual.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })} annual value</p>
        </div>
        <Link to="/cpq" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Create New Quote
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-indigo-500/50"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#0d0d14]">{s.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-indigo-500"
          />
          Show Archived
        </label>
      </div>

      {/* Table / Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            {quotes.length === 0 ? <Inbox size={28} className="text-white/30" /> : <FileX size={28} className="text-white/30" />}
          </div>
          <h3 className="text-white font-medium text-lg mb-1">
            {quotes.length === 0 ? "No proposals yet" : "No quotes match your filters"}
          </h3>
          <p className="text-white/40 text-sm mb-6">
            {quotes.length === 0 ? "You haven't created any Enterprise proposals yet." : "Try adjusting your status filter or showing archived quotes."}
          </p>
          {quotes.length === 0 && (
            <Link to="/cpq" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              <Plus size={16} /> Create New Quote
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
                <th className="text-left p-4">Proposal ID</th>
                <th className="text-left p-4">Organization</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Plan</th>
                <th className="text-right p-4">Seats</th>
                <th className="text-right p-4">Contract</th>
                <th className="text-right p-4">Annual Value</th>
                <th className="text-left p-4 hidden lg:table-cell">Created</th>
                <th className="text-left p-4 hidden lg:table-cell">Updated</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${q.is_archived ? "opacity-50" : ""}`}>
                  <td className="p-4">
                    <Link to={`/cpq/quote/${q.id}`} className="text-white/80 font-mono text-sm hover:text-indigo-400 transition-colors">
                      {q.proposal_number}
                    </Link>
                    {q.is_archived && <span className="ml-2 text-[10px] text-white/30 uppercase">Archived</span>}
                  </td>
                  <td className="p-4"><span className="text-white/80 text-sm">{q.organization_name}</span></td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[q.status] || STATUS_STYLES.draft}`}>
                      {STATUS_LABELS[q.status] || q.status}
                    </span>
                  </td>
                  <td className="p-4"><span className="text-white/50 text-sm capitalize">{q.organization_id ? "Enterprise" : "Enterprise"}</span></td>
                  <td className="p-4 text-right"><span className="text-white/60 text-sm">{q.expected_active_users || 0}</span></td>
                  <td className="p-4 text-right"><span className="text-white/60 text-sm">{q.contract_length_years || 1}yr</span></td>
                  <td className="p-4 text-right"><span className="text-white font-medium text-sm">{q.currency} {(q.annual_value || 0).toLocaleString()}</span></td>
                  <td className="p-4 hidden lg:table-cell"><span className="text-white/40 text-xs">{fmtDate(q.created_date)}</span></td>
                  <td className="p-4 hidden lg:table-cell"><span className="text-white/40 text-xs">{fmtDate(q.updated_date)}</span></td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-white/40 hover:text-white/70 p-1.5 rounded-lg hover:bg-white/5 transition-colors" disabled={acting === q.id}>
                        {acting === q.id ? <Loader2 size={14} className="animate-spin" /> : <MoreVertical size={14} />}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0d0d14] border-white/10">
                        <DropdownMenuItem asChild>
                          <Link to={`/cpq/quote/${q.id}`} className="flex items-center gap-2 text-white/70 cursor-pointer">
                            <Eye size={14} /> View
                          </Link>
                        </DropdownMenuItem>
                        {q.status === "draft" && (
                          <DropdownMenuItem asChild>
                            <Link to={`/cpq/quote/${q.id}`} className="flex items-center gap-2 text-white/70 cursor-pointer">
                              <Pencil size={14} /> Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(q)} className="flex items-center gap-2 text-white/70 cursor-pointer">
                          <Copy size={14} /> Duplicate
                        </DropdownMenuItem>
                        {q.pdf_url && (
                          <DropdownMenuItem asChild>
                            <a href={q.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 cursor-pointer">
                              <Download size={14} /> Download PDF
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleShare(q)} className="flex items-center gap-2 text-white/70 cursor-pointer">
                          <Share2 size={14} /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        {q.is_archived ? (
                          <DropdownMenuItem onClick={() => handleArchive(q, false)} className="flex items-center gap-2 text-white/70 cursor-pointer">
                            <ArchiveRestore size={14} /> Unarchive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleArchive(q, true)} className="flex items-center gap-2 text-white/70 cursor-pointer">
                            <Archive size={14} /> Archive
                          </DropdownMenuItem>
                        )}
                        {q.status === "draft" && (
                          <DropdownMenuItem onClick={() => setDeleteTarget(q)} className="flex items-center gap-2 text-red-400 cursor-pointer focus:text-red-400">
                            <Trash2 size={14} /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Share Modal */}
      {shareUrl && (
        <ShareProposalModal
          shareUrl={shareUrl}
          proposalNumber={shareProposalNumber}
          onClose={() => { setShareUrl(""); setShareProposalNumber(""); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0d0d14] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this quote?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              You're about to delete proposal <span className="text-white/70 font-mono">{deleteTarget?.proposal_number}</span> for {deleteTarget?.organization_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete Quote</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}