import React, { useState } from "react";
import {
  Target, TrendingDown, Sparkles, Activity, Clock, Calendar,
  User, ChevronDown, FileText, FileJson, Table2, Loader2, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const STATS = [
  { icon: Target, label: "Target", key: "target", suffix: "/10" },
  { icon: TrendingDown, label: "Remaining Gap", key: "remainingGap", suffix: " pts" },
  { icon: Sparkles, label: "Potential Gain", key: "potentialScoreGain", suffix: " pts", prefix: "+" },
  { icon: Activity, label: "Confidence", key: "confidence" },
  { icon: Clock, label: "Trend", key: "trend" },
  { icon: User, label: "Owner", key: "owner" },
  { icon: Calendar, label: "Last Verification", key: "lastVerification" },
  { icon: Calendar, label: "Next Verification", key: "nextVerification" },
];

const REPORT_TYPES = [
  { id: "executive_pdf", label: "Executive PDF", icon: FileText },
  { id: "engineering_pdf", label: "Engineering PDF", icon: FileText },
  { id: "ai_diagnostics", label: "AI Diagnostics Report", icon: Activity },
  { id: "architecture", label: "Architecture Report", icon: ShieldCheck },
  { id: "audit", label: "Audit Report", icon: FileText },
  { id: "board", label: "Board Report", icon: FileText },
  { id: "csv", label: "CSV", icon: Table2 },
  { id: "excel", label: "Excel", icon: Table2 },
];

function downloadFile(filename, content, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AIMemoryHeader({ intelligence, onRecompute }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const pct = intelligence.percentage;
  const ringColor = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (pct / 100) * circumference;

  const handleExport = (reportType) => {
    setLoading(reportType.id);
    setTimeout(() => {
      if (reportType.id === "csv") {
        const rows = [
          "Issue,Severity,Category,Current Value,Target,Potential Score Gain,Estimated Hours,Owner,Status",
          ...intelligence.failures.map((f) =>
            `"${f.issue}","${f.severity}","${f.category}","${f.currentValue}","${f.targetValue}","${f.potentialScoreGain}","${f.estimatedHours}","${f.owner}","${f.status}"`
          ),
        ];
        downloadFile("ai-memory-failure-registry.csv", rows.join("\n"), "text/csv");
      } else if (reportType.id === "excel") {
        downloadFile("ai-memory-intelligence.xls", JSON.stringify(intelligence, null, 2), "application/vnd.ms-excel");
      } else {
        downloadFile(`ai-memory-${reportType.id}.json`, JSON.stringify(intelligence, null, 2), "application/json");
      }
      toast({ title: "Report ready", description: `${reportType.label} exported successfully.` });
      setLoading(null);
    }, 800);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-start gap-5 flex-wrap">
        {/* Score ring */}
        <div className="flex items-center gap-4 shrink-0">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            <circle
              cx="50" cy="50" r="36" fill="none" stroke={ringColor} strokeWidth="7"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 0.7s ease" }}
            />
            <text x="50" y="48" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{intelligence.score}</text>
            <text x="50" y="62" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">/ {intelligence.target}</text>
          </svg>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">AI Memory™ Score</div>
            <div className="text-2xl font-bold text-white">{intelligence.score}/{intelligence.target}</div>
            <div className="text-[10px] mt-1" style={{ color: ringColor }}>{pct}% of target</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[200px]">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-1">
                <s.icon size={10} className="text-white/30" />
                <span className="text-[9px] text-white/30 uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-xs text-white/80 font-medium truncate">
                {s.prefix || ""}{String(intelligence[s.key])}{s.suffix || ""}
              </div>
            </div>
          ))}
        </div>

        {/* Generate Report */}
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-500 text-white" disabled={!!loading}>
                {loading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <FileText size={14} className="mr-1.5" />}
                Generate Report
                <ChevronDown size={12} className="ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-white/40 uppercase">Export Format</DropdownMenuLabel>
              {REPORT_TYPES.map((rt) => (
                <DropdownMenuItem key={rt.id} onClick={() => handleExport(rt)} className="text-sm cursor-pointer">
                  <rt.icon size={12} className="mr-2 text-violet-400" /> {rt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}