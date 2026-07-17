import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { computeSecurityIntelligence } from "@/lib/securityIntelligenceEngine";
import SecHeader from "@/components/security-intelligence/SecHeader";
import SecCoverage from "@/components/security-intelligence/SecCoverage";
import SecTechDebt from "@/components/security-intelligence/SecTechDebt";
import SecCategoryGrid from "@/components/security-intelligence/SecCategoryGrid";
import SecCopilot from "@/components/security-intelligence/SecCopilot";
import SecReportToolbar from "@/components/security-intelligence/SecReportToolbar";
import SecTestRegistryDrawer from "@/components/security-intelligence/SecTestRegistryDrawer";
import SecFailureRegistryDrawer from "@/components/security-intelligence/SecFailureRegistryDrawer";
import SecDeployGateDrawer from "@/components/security-intelligence/SecDeployGateDrawer";
import SecCoverageDrawer from "@/components/security-intelligence/SecCoverageDrawer";
import SecTechDebtDrawer from "@/components/security-intelligence/SecTechDebtDrawer";
import SecCategoryDrawer from "@/components/security-intelligence/SecCategoryDrawer";
import SecTestDetailDrawer from "@/components/security-intelligence/SecTestDetailDrawer";

export default function SecurityIntelligenceCenter() {
  const [intel, setIntel] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [coverageKey, setCoverageKey] = useState(null);
  const [debtKey, setDebtKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    computeSecurityIntelligence().then((result) => {
      if (!cancelled) setIntel(result);
    }).catch(() => {
      if (!cancelled) setIntel({ error: true });
    });
    return () => { cancelled = true; };
  }, []);

  if (!intel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Loader2 size={16} className="animate-spin" /> Computing security intelligence…
        </div>
      </div>
    );
  }

  if (intel.error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-white/40 text-sm">Failed to compute security intelligence.</div>
      </div>
    );
  }

  const handleNavigate = (target, key) => {
    if (target === "testRegistry") setActiveDrawer("testRegistry");
    else if (target === "failures") setActiveDrawer("failures");
    else if (target === "warnings") setActiveDrawer("warnings");
    else if (target === "deployGate") setActiveDrawer("deployGate");
    else if (target === "coverage") { setCoverageKey(key); setActiveDrawer("coverage"); }
    else if (target === "techDebt") {
      if (key === "roadmap") { setDebtKey("critical"); }
      else setDebtKey(key);
      setActiveDrawer("techDebt");
    }
  };

  const failedTests = intel.tests.filter((t) => t.status === "fail");
  const criticalFailures = failedTests.filter((t) => t.riskLevel === "critical");
  const warningFailures = failedTests.filter((t) => t.riskLevel === "warning");

  const coverageDetail = coverageKey ? intel.coverage[coverageKey] : null;
  const debtDetail = debtKey ? intel.techDebt[debtKey] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      <SecHeader header={intel.header} onNavigate={handleNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecCoverage coverage={intel.coverage} onNavigate={handleNavigate} />
        <SecTechDebt techDebt={intel.techDebt} onNavigate={handleNavigate} />
      </div>

      <SecCategoryGrid categories={intel.categories} onCategoryClick={(cat) => setActiveCategory(cat)} />

      <SecReportToolbar intel={intel} />

      <SecCopilot intel={intel} title="Ask EXEC™ — Security Intelligence Center" />

      {/* Drawers */}
      <SecTestRegistryDrawer
        open={activeDrawer === "testRegistry"}
        tests={intel.tests}
        intel={intel}
        onClose={() => setActiveDrawer(null)}
        onTestClick={(t) => { setActiveTest(t); }}
      />
      <SecFailureRegistryDrawer
        open={activeDrawer === "failures"}
        title="Critical Failure Registry™"
        tests={criticalFailures}
        intel={intel}
        onClose={() => setActiveDrawer(null)}
        onTestClick={(t) => setActiveTest(t)}
      />
      <SecFailureRegistryDrawer
        open={activeDrawer === "warnings"}
        title="Warning Registry™"
        tests={warningFailures}
        intel={intel}
        onClose={() => setActiveDrawer(null)}
        onTestClick={(t) => setActiveTest(t)}
      />
      <SecDeployGateDrawer
        open={activeDrawer === "deployGate"}
        deployGate={intel.deployGate}
        intel={intel}
        onClose={() => setActiveDrawer(null)}
      />
      <SecCoverageDrawer
        open={activeDrawer === "coverage"}
        detail={coverageDetail}
        intel={intel}
        onClose={() => setActiveDrawer(null)}
      />
      <SecTechDebtDrawer
        open={activeDrawer === "techDebt"}
        detail={debtDetail}
        intel={intel}
        onClose={() => setActiveDrawer(null)}
      />
      <SecCategoryDrawer
        category={activeCategory}
        intel={intel}
        onClose={() => setActiveCategory(null)}
        onTestClick={(t) => setActiveTest(t)}
      />
      <SecTestDetailDrawer
        test={activeTest}
        onClose={() => setActiveTest(null)}
      />
    </div>
  );
}