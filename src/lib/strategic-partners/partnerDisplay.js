export const PRIORITY_TO_IMPORTANCE = { P0: 'critical', P1: 'high', P2: 'medium' };
export const IMPORTANCE_TO_PRIORITY = { critical: 'P0', high: 'P1', medium: 'P2', low: 'P2' };

export function priorityLabel(partner) {
  return IMPORTANCE_TO_PRIORITY[partner.strategicImportance] || '—';
}

export function relationshipClass(partner) {
  if (partner.partnerStatus === 'At Risk') return 'At-Risk Partner';
  if (partner.partnerStatus === 'Active' || partner.partnershipStage === 'Active') return 'Active Partner';
  if (['Negotiation', 'Agreement Pending'].includes(partner.partnershipStage)) return 'Negotiating Partner';
  if (['Target', 'Research'].includes(partner.partnershipStage)) return 'Target Partner';
  return 'Prospective Partner';
}

export function isTargetPartner(partner) {
  return ['Target', 'Research'].includes(partner.partnershipStage);
}

export function relationshipState(partner) {
  const kind = relationshipClass(partner);
  return ({ 'Target Partner': 'Target', 'Prospective Partner': 'Prospect', 'Negotiating Partner': 'Negotiation', 'Active Partner': 'Active', 'At-Risk Partner': 'At Risk' })[kind];
}

export const statusTone = (partner) => {
  const kind = relationshipClass(partner);
  if (kind === 'Active Partner') return 'border-success/30 bg-success/10 text-success';
  if (kind === 'Negotiating Partner') return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  if (kind === 'At-Risk Partner') return 'border-destructive/30 bg-destructive/10 text-destructive';
  if (kind === 'Prospective Partner') return 'border-primary/30 bg-primary/10 text-primary';
  return 'border-border bg-muted text-muted-foreground';
};