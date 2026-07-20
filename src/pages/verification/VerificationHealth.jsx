import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { runDependencyValidation, runTestSuite, computeOverallHealth } from "@/lib/execVerifiedHealthEngine";
import { base44 } from "@/api/base44Client";
import FreezeOverview from "@/components/verification/freeze/FreezeOverview";
import DependencyValidationPanel from "@/components/verification/freeze/DependencyValidationPanel";
import ReleaseReadinessChecklist from "@/components/verification/freeze/ReleaseReadinessChecklist";
import ActivationPlaybook from "@/components/verification/freeze/ActivationPlaybook";
import TestSuitePanel from "@/components/verification/freeze/TestSuitePanel";
import ObservabilityMetrics from "@/components/verification/freeze/ObservabilityMetrics";
import GovernanceChangePanel from "@/components/verification/freeze/GovernanceChangePanel";
import DocumentationOpsPanel from "@/components/verification/freeze/DocumentationOpsPanel";
import { ArrowLeft, Snowflake, Eye, FlaskConical, Gavel } from "lucide-react";

const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

export default function VerificationHealth() {
  const { enabled, loading: flagLoading } = useExecVerified();
  const { user } = useAuth();
  const [depResults, setDepResults] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!enabled) return;
    setDepResults(runDependencyValidation());
    setTestResults(runTestSuite());
    base44.entities.ExecVerification.list("-created_date", 50)
      .then((recs) => setRecords(recs || []))
      .catch(() => {});
  }, [enabled]);

  if (!flagLoading && !enabled) return <Navigate to="/security" replace />;
  if (flagLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;
  if (!ADMIN_ROLES.includes(user?.role)) return <Navigate to="/security" replace />;

  const health = depResults && testResults ? computeOverallHealth(depResults, testResults) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link to="/admin/verifications" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Verification Admin
        </Link>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Snowflake size={12} className="text-indigo-400" /> EXEC™ Verified v3.0
        </div>
        <h1 className="text-2xl font-bold text-white">Health Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Architecture freeze, operational readiness, and governance. Internal only — hidden while dormant.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 flex-wrap">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={Eye} label="Overview" />
        <TabButton active={activeTab === "readiness"} onClick={() => setActiveTab("readiness")} icon={Snowflake} label="Readiness" />
        <TabButton active={activeTab === "quality"} onClick={() => setActiveTab("quality")} icon={FlaskConical} label="Quality" />
        <TabButton active={activeTab === "governance"} onClick={() => setActiveTab("governance")} icon={Gavel} label="Governance" />
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <FreezeOverview health={health} />
          <DependencyValidationPanel results={depResults} />
        </div>
      )}

      {activeTab === "readiness" && (
        <div className="space-y-4">
          <ReleaseReadinessChecklist />
          <ActivationPlaybook />
        </div>
      )}

      {activeTab === "quality" && (
        <div className="space-y-4">
          <TestSuitePanel results={testResults} />
          <ObservabilityMetrics records={records} />
        </div>
      )}

      {activeTab === "governance" && (
        <div className="space-y-4">
          <GovernanceChangePanel />
          <DocumentationOpsPanel />
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>
      <Icon size={14} /> {label}
    </button>
  );
}