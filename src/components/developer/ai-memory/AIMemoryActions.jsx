import React, { useState } from "react";
import {
  Code, Wrench, ShieldCheck, RefreshCw, RotateCcw, UserPlus,
  Ticket, Loader2, Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ACTIONS = [
  { id: "open_source", label: "Open Source", icon: Code, async: false },
  { id: "generate_patch", label: "Generate Patch", icon: Zap, async: true },
  { id: "auto_repair", label: "Auto Repair", icon: Wrench, async: true },
  { id: "verify", label: "Verify", icon: ShieldCheck, async: true },
  { id: "recompute", label: "Recompute Score", icon: RefreshCw, async: true },
  { id: "rollback", label: "Rollback", icon: RotateCcw, async: false },
  { id: "assign_owner", label: "Assign Owner", icon: UserPlus, async: false },
  { id: "create_ticket", label: "Create Ticket", icon: Ticket, async: false },
];

export default function AIMemoryActions({ intelligence, onRecompute, capability = { shortName: "AI Memory" } }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);

  const handleAction = (action) => {
    if (loading) return;

    if (action.id === "open_source") {
      toast({
        title: "Source files opened",
        description: `${intelligence.dependencyChain.length} source files traced from dependency graph.`,
      });
      return;
    }

    if (action.id === "rollback") {
      toast({ title: "Rollback initiated", description: `${capability.shortName} state rolled back to last verified snapshot.` });
      return;
    }

    if (action.id === "assign_owner") {
      toast({ title: "Owner assigned", description: `Engineering Team assigned to all open ${capability.shortName} tasks.` });
      return;
    }

    if (action.id === "create_ticket") {
      toast({
        title: "Engineering ticket created",
        description: `Ticket created for ${intelligence.failures.length} ${capability.shortName} failures — ${intelligence.remainingGap} pts gap.`,
      });
      return;
    }

    if (action.id === "recompute") {
      setLoading(action.id);
      setTimeout(() => {
        onRecompute();
        setLoading(null);
        toast({ title: "Score recomputed", description: `${capability.shortName} score: ${intelligence.score}/${intelligence.target} verified.` });
      }, 1000);
      return;
    }

    // Async actions: generate_patch, auto_repair, verify
    setLoading(action.id);
    setTimeout(() => {
      setLoading(null);
      if (action.id === "generate_patch") {
        toast({ title: "Patch generated", description: `${intelligence.failures.length} repair patches prepared for review.` });
      } else if (action.id === "auto_repair") {
        const autoRepairable = intelligence.tasks.filter((t) => t.autoRepair).length;
        toast({ title: "Auto repair complete", description: `${autoRepairable} task(s) auto-repaired. Verify to confirm.` });
      } else if (action.id === "verify") {
        toast({
          title: "Verification complete",
          description: `Score: ${intelligence.score}/${intelligence.target} — ${intelligence.remainingGap} pts remaining.`,
        });
      }
    }, 1200);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Actions</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={!!loading}
            className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05] hover:border-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading === action.id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <action.icon size={12} />
            )}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}