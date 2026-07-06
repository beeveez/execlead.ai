import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Boxes, DollarSign, Receipt, Mail, Lock,
  Calculator, TrendingUp, Database, Network, FileText,
  Cpu, KeyRound, GitBranch, Rocket
} from "lucide-react";

const MODULES = [
  { path: "/developer", label: "Dashboard", desc: "Workspace overview", icon: LayoutDashboard },
  { path: "/feature-management", label: "Feature Flags", desc: "Toggle platform features", icon: Boxes },
  { path: "/pricing-admin", label: "Pricing Admin", desc: "Manage pricing plans", icon: DollarSign },
  { path: "/billing-admin", label: "Billing Admin", desc: "Billing operations", icon: Receipt },
  { path: "/email-settings", label: "Email Settings", desc: "Email provider config", icon: Mail },
  { path: "/payment-settings", label: "Payment Providers", desc: "Payment gateway config", icon: Lock },
  { path: "/cpq", label: "CPQ Wizard", desc: "Configure proposals", icon: Calculator },
  { path: "/cpq-dashboard", label: "Sales Pipeline", desc: "Track sales proposals", icon: TrendingUp },
  { path: "/company-admin", label: "Company Admin", desc: "Manage company data", icon: Database },
  { path: "/developer/organizations", label: "Organization Admin", desc: "Manage organizations", icon: Network },
  { path: "/developer/audit-logs", label: "Audit Logs", desc: "System audit trail", icon: FileText },
  { path: "/developer/system-health", label: "System Health", desc: "Service status & metrics", icon: Cpu },
  { path: "/developer/api-keys", label: "API Keys", desc: "Manage API credentials", icon: KeyRound },
  { path: "/developer/database", label: "Database Tools", desc: "Browse entities & data", icon: Database },
  { path: "/developer/migrations", label: "Migration History", desc: "Schema migrations", icon: GitBranch },
  { path: "/developer/deployments", label: "Deployment Center", desc: "Build & deploy info", icon: Rocket },
];

export default function WorkspaceModules() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {MODULES.map((m) => (
        <Link
          key={m.path}
          to={m.path}
          className="group bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
            <m.icon size={16} className="text-indigo-400" />
          </div>
          <div className="text-white/80 text-sm font-medium">{m.label}</div>
          <div className="text-white/30 text-xs mt-0.5">{m.desc}</div>
        </Link>
      ))}
    </div>
  );
}