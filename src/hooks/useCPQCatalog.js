import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  DEFAULT_MODULES, DEFAULT_SEAT_TIERS, DEFAULT_AI_PACKAGES,
  DEFAULT_SUPPORT_PACKAGES, DEFAULT_DISCOUNT_RULES, DEFAULT_TAX_RULES, DEFAULT_CURRENCIES,
} from "@/lib/cpqCatalog";

/**
 * Loads the CPQ catalog from the database.
 * Falls back to local defaults if the DB is empty or unreachable.
 * All pricing is data-driven — admins can edit everything in the DB.
 */
export function useCPQCatalog() {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const fallback = {
        modules: DEFAULT_MODULES,
        seatTiers: DEFAULT_SEAT_TIERS,
        aiPackages: DEFAULT_AI_PACKAGES,
        supportPackages: DEFAULT_SUPPORT_PACKAGES,
        discountRules: DEFAULT_DISCOUNT_RULES,
        taxRules: DEFAULT_TAX_RULES,
        currencies: DEFAULT_CURRENCIES,
      };

      try {
        const [modules, seatTiers, aiPackages, supportPackages, discountRules, taxRules, currencies] = await Promise.all([
          base44.entities.CPQModule.list("sort_order", 100),
          base44.entities.CPQSeatTier.list("sort_order", 50),
          base44.entities.CPQAIPackage.list("sort_order", 50),
          base44.entities.CPQSupportPackage.list("sort_order", 50),
          base44.entities.CPQDiscountRule.list(),
          base44.entities.CPQTaxRule.list(),
          base44.entities.CPQCurrency.list(),
        ]);

        setCatalog({
          modules: modules.length > 0 ? modules : fallback.modules,
          seatTiers: seatTiers.length > 0 ? seatTiers : fallback.seatTiers,
          aiPackages: aiPackages.length > 0 ? aiPackages : fallback.aiPackages,
          supportPackages: supportPackages.length > 0 ? supportPackages : fallback.supportPackages,
          discountRules: discountRules.length > 0 ? discountRules : fallback.discountRules,
          taxRules: taxRules.length > 0 ? taxRules : fallback.taxRules,
          currencies: currencies.length > 0 ? currencies : fallback.currencies,
        });
      } catch (e) {
        setCatalog(fallback);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { catalog, loading };
}