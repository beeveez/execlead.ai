/**
 * CPQ Pricing Engine
 * Fully data-driven — all values come from the catalog.
 * Nothing is hardcoded. Recalculates instantly on every config change.
 */

export function calculateQuote(config, catalog) {
  const {
    modules = [],
    seatTiers = [],
    aiPackages = [],
    supportPackages = [],
    discountRules = [],
    taxRules = [],
    currencies = [],
  } = catalog;

  const moduleMap = {};
  modules.forEach(m => { moduleMap[m.module_id] = m; });

  // 1. Platform Fee (flat annual)
  const platformModule = modules.find(m => m.type === "platform" && m.is_active !== false);
  const platformFee = platformModule?.annual_price || 0;

  // 2. Seat Cost (tiered)
  const seats = Math.max(config.seats || 0, 0);
  const sortedTiers = [...seatTiers].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  let seatTier = null;
  for (const tier of sortedTiers) {
    if (seats >= tier.min_seats) {
      const max = tier.max_seats || 0;
      if (max === 0 || seats <= max) {
        seatTier = tier;
      }
    }
  }
  const seatPricePerUser = seatTier?.annual_price_per_user || 0;
  const seatCost = seats * seatPricePerUser;

  // 3. Module Cost (per-user or flat)
  const selectedModuleIds = config.moduleIds || [];
  const selectedModules = selectedModuleIds
    .map(id => moduleMap[id])
    .filter(m => m && m.type === "module" && m.is_active !== false);
  const moduleCost = selectedModules.reduce((sum, m) => {
    const price = m.annual_price || 0;
    return sum + (m.is_per_user ? price * seats : price);
  }, 0);

  // 4. AI Package (per-user or flat)
  const aiPackage = aiPackages.find(p => p.package_id === config.aiPackageId);
  const aiBasePrice = aiPackage?.annual_price || 0;
  const aiCost = aiPackage
    ? (aiPackage.is_per_user !== false ? aiBasePrice * seats : aiBasePrice)
    : 0;

  // 5. Support Package (flat annual)
  const supportPackage = supportPackages.find(p => p.package_id === config.supportPackageId);
  const supportCost = supportPackage?.annual_price || 0;

  // 6. Services & Add-ons
  const serviceIds = config.serviceIds || [];
  const selectedServices = serviceIds
    .map(id => moduleMap[id])
    .filter(m => m && (m.type === "service" || m.type === "addon") && m.is_active !== false);
  const servicesCost = selectedServices.reduce((sum, s) => sum + (s.annual_price || 0), 0);

  // Annual Recurring Subtotal
  const annualRecurring = platformFee + seatCost + moduleCost + aiCost + supportCost;

  // 7. Discount
  const discountRule = discountRules.find(r => r.rule_id === config.discountRuleId);
  const discount = calculateDiscount(discountRule, config.discountValue, annualRecurring);
  const discountedAnnual = Math.max(annualRecurring - discount.amount, 0);

  // 8. Multi-Year Contract
  const contractLength = Math.max(config.contractLength || 1, 1);
  const multiYearBonusRate = (discount.multiYearBonus || 0) / 100;
  let multiYearDiscount = 0;
  if (contractLength > 1 && multiYearBonusRate > 0) {
    multiYearDiscount = discountedAnnual * multiYearBonusRate * (contractLength - 1);
  }
  const recurringContractValue = (discountedAnnual * contractLength) - multiYearDiscount;
  const contractValue = recurringContractValue + servicesCost;

  // 9. Tax
  const country = config.country || "US";
  const taxRule = taxRules.find(t => t.country_code === country);
  const taxExempt = config.taxExempt || false;
  const taxRate = taxExempt ? 0 : (taxRule?.rate || 0);
  const taxAmount = contractValue * taxRate;

  // 10. Grand Total
  const grandTotal = contractValue + taxAmount;

  // 11. Currency Conversion
  const currencyCode = config.currency || "USD";
  const currency = currencies.find(c => c.code === currencyCode);
  const exchangeRate = currency?.exchange_rate || 1;
  const convertedTotal = grandTotal * exchangeRate;

  // Equivalents
  const monthlyEquivalent = grandTotal / (contractLength * 12);
  const annualEquivalent = grandTotal / contractLength;
  const threeYearEquivalent = annualEquivalent * 3;
  const fiveYearEquivalent = annualEquivalent * 5;

  // Multi-Year Savings (vs 1-year at full price)
  const oneYearTotal = annualRecurring + servicesCost;
  const multiYearSavings = contractLength > 1
    ? (oneYearTotal * contractLength) - grandTotal
    : 0;

  return {
    platformFee,
    platformModuleName: platformModule?.name,
    seats,
    seatPricePerUser,
    seatTier: seatTier?.tier_name,
    seatCost,
    moduleCost,
    selectedModules: selectedModules.map(m => ({
      id: m.module_id,
      name: m.name,
      icon: m.icon,
      price: m.is_per_user ? m.annual_price * seats : m.annual_price,
      isPerUser: m.is_per_user,
    })),
    aiPackage: aiPackage ? { id: aiPackage.package_id, name: aiPackage.name, price: aiCost } : null,
    aiCost,
    supportPackage: supportPackage ? { id: supportPackage.package_id, name: supportPackage.name, price: supportCost } : null,
    supportCost,
    servicesCost,
    selectedServices: selectedServices.map(s => ({
      id: s.module_id,
      name: s.name,
      icon: s.icon,
      price: s.annual_price,
      type: s.type,
    })),
    annualRecurring,
    discount: {
      ruleId: discountRule?.rule_id,
      rule: discountRule?.name,
      type: discountRule?.discount_type,
      value: discount.value,
      amount: discount.amount,
      multiYearBonus: discount.multiYearBonus,
      requiresApproval: discount.requiresApproval,
      approvalThreshold: discountRule?.approval_threshold,
    },
    discountedAnnual,
    contractLength,
    multiYearDiscount,
    contractValue,
    tax: {
      type: taxRule?.tax_type || "none",
      rate: taxRate,
      amount: taxAmount,
      exempt: taxExempt,
      country,
    },
    grandTotal,
    currency: currencyCode,
    currencySymbol: currency?.symbol || "$",
    exchangeRate,
    convertedTotal,
    monthlyEquivalent,
    annualEquivalent,
    threeYearEquivalent,
    fiveYearEquivalent,
    multiYearSavings,
  };
}

function calculateDiscount(rule, manualValue, subtotal) {
  if (!rule) return { amount: 0, value: 0, multiYearBonus: 0, requiresApproval: false };

  let value = rule.discount_value || 0;
  if (manualValue != null && manualValue > 0) {
    value = manualValue;
  }

  let amount = 0;
  const type = rule.discount_type;
  if (["percentage", "promotional", "partner", "educational", "non_profit", "manual"].includes(type)) {
    amount = subtotal * (value / 100);
  } else if (type === "fixed") {
    amount = value;
  }

  if (rule.max_discount_amount && rule.max_discount_amount > 0 && amount > rule.max_discount_amount) {
    amount = rule.max_discount_amount;
  }
  if (rule.min_contract_value && rule.min_contract_value > 0 && subtotal < rule.min_contract_value) {
    amount = 0;
  }

  const requiresApproval = rule.approval_threshold && rule.approval_threshold > 0 && amount > rule.approval_threshold;

  return {
    amount: Math.min(amount, subtotal),
    value,
    multiYearBonus: rule.multi_year_bonus || 0,
    requiresApproval,
  };
}

export function generateProposalNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EXEC-${year}-${random}`;
}

export function formatCPQPrice(amount, currencyCode, currencies) {
  const currency = currencies?.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || "$";
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}