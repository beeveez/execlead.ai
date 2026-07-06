import React, { useState } from "react";
import { downloadReceiptPDF, formatCurrency } from "@/lib/payments";
import { Download, CreditCard, Loader2, FileText } from "lucide-react";

export default function PaymentHistory({ invoices, profile }) {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (invoice) => {
    setDownloading(invoice.id);
    try {
      await downloadReceiptPDF(invoice, profile);
    } catch (e) {}
    setDownloading(null);
  };

  return (
    <div>
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Payment History</h2>
      {invoices.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <CreditCard size={24} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/30 text-sm">No invoices yet.</p>
          <p className="text-white/20 text-xs mt-1">Upgrade to Professional or Executive to begin your subscription history.</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs text-white/30 uppercase tracking-wider">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-white/40">{new Date(inv.created_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-white/60 capitalize">{inv.plan}</td>
                  <td className="px-4 py-3 text-white/60">{formatCurrency(inv.amount, inv.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : inv.status === "refunded" ? "bg-blue-500/10 text-blue-400" : inv.status === "failed" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDownload(inv)} disabled={downloading === inv.id} className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-indigo-400 transition-colors disabled:opacity-30">
                      {downloading === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}