import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// ============================================================
// EXEC™ Verified Framework™ — Feature Flag Hook
// Feature Flag: exec_verified (default: OFF)
//
// When OFF: All verification UI is completely hidden from end users.
// Backend remains fully available.
//
// Activation:
// 1. Set FeatureFlag entity "exec_verified" status to "enabled" in admin console
// 2. Flip FALLBACK_ENABLED to true for code-level activation
// (Both are needed — FeatureFlag is admin-readable only due to RLS,
//  so the fallback constant ensures regular users see the feature
//  once the code is deployed with it enabled.)
// ============================================================

const FALLBACK_ENABLED = false;
const FLAG_KEY = "exec_verified";

export function useExecVerified() {
  const [enabled, setEnabled] = useState(FALLBACK_ENABLED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.entities.FeatureFlag.filter({ flag_key: FLAG_KEY })
      .then((flags) => {
        if (!active) return;
        const flag = flags?.[0];
        if (flag) {
          // If the flag exists and is enabled (and kill switch is not active), show the feature
          setEnabled(flag.status === "enabled" && !flag.kill_switch_active);
        }
        // If flag doesn't exist, keep FALLBACK_ENABLED
      })
      .catch(() => {
        // RLS blocks read for non-admin roles — keep FALLBACK_ENABLED
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { enabled, loading };
}