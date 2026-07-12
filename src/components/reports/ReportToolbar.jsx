import React, { useState } from "react";
import { FileText, Printer, FileJson, Table2, Loader2, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { downloadPDF, printReport, downloadJSON, downloadCSV, REPORT_TYPES } from "@/lib/enterpriseReportEngine";
import { useToast } from "@/components/ui/use-toast";

/**
 * Enterprise Report Engine™ — Reusable Toolbar
 * ----------------------------------------------
 * Every operational dashboard mounts this with a `reportBuilder` callback.
 *
 * Props:
 *   reportBuilder  async (reportType) => reportDef   builds the report definition
 *   filenamePrefix  string                              for download filenames
 *   supportCSV      bool                                show CSV export (default true)
 *   className       string
 */
export default function ReportToolbar({ reportBuilder, filenamePrefix = "Report", supportCSV = true, className = "" }) {
  const [loading, setLoading] = useState(null);
  const { toast } = useToast();

  const run = async (action, fn) => {
    if (loading) return;
    setLoading(action);
    try {
      await fn();
      toast({ title: "Report ready", description: `${filenamePrefix} exported successfully.` });
    } catch (e) {
      toast({ title: "Report failed", description: e?.message || "Could not generate report.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handlePDF = (type) => run("pdf", async () => {
    const reportDef = await reportBuilder(type);
    await downloadPDF(reportDef);
  });

  const handlePrint = () => run("print", async () => {
    const reportDef = await reportBuilder("full_engineering");
    await printReport(reportDef);
  });

  const handleExecSummary = () => run("pdf", async () => {
    const reportDef = await reportBuilder("executive_summary");
    await downloadPDF(reportDef);
  });

  const handleJSON = () => run("json", async () => {
    const reportDef = await reportBuilder("full_engineering");
    downloadJSON(reportDef);
  });

  const handleCSV = () => run("csv", async () => {
    const reportDef = await reportBuilder("full_engineering");
    downloadCSV(reportDef);
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Generate PDF — dropdown with report types */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" disabled={!!loading}>
            {loading === "pdf" ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <FileText size={14} className="mr-1.5" />}
            Generate PDF
            <ChevronDown size={12} className="ml-1.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-white/40 uppercase">Report Type</DropdownMenuLabel>
          {Object.values(REPORT_TYPES).map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => handlePDF(t.id)} className="text-sm cursor-pointer">
              <FileText size={12} className="mr-2 text-indigo-400" /> {t.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePrint} className="text-sm cursor-pointer">
            <Printer size={12} className="mr-2 text-blue-400" /> Print Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Print */}
      <Button onClick={handlePrint} variant="outline" size="sm" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" disabled={!!loading}>
        {loading === "print" ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Printer size={14} className="mr-1.5" />}
        Print
      </Button>

      {/* Executive Summary Only */}
      <Button onClick={handleExecSummary} variant="outline" size="sm" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" disabled={!!loading}>
        <ShieldCheck size={14} className="mr-1.5" />
        Executive Summary
      </Button>

      {/* Download JSON */}
      <Button onClick={handleJSON} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5" disabled={!!loading}>
        {loading === "json" ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <FileJson size={14} className="mr-1.5" />}
        JSON
      </Button>

      {/* Export CSV */}
      {supportCSV && (
        <Button onClick={handleCSV} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5" disabled={!!loading}>
          {loading === "csv" ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Table2 size={14} className="mr-1.5" />}
          CSV
        </Button>
      )}
    </div>
  );
}