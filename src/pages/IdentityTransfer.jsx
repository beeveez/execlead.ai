import React from "react";
import IdentityTransferWizard from "@/components/identity/IdentityTransferWizard";
import AffiliationManager from "@/components/identity/AffiliationManager";

export default function IdentityTransfer() {
  return (
    <div>
      <IdentityTransferWizard />
      <AffiliationManager />
    </div>
  );
}