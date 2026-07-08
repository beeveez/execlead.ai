import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'getWallet') return await handleGetWallet(base44, user);
    if (action === 'getTransactions') return await handleGetTransactions(base44, user, body);
    if (action === 'requestWithdrawal') return await handleRequestWithdrawal(base44, user, body);
    if (action === 'getWithdrawals') return await handleGetWithdrawals(base44, user);
    if (action === 'adminAdjust') return await handleAdminAdjust(base44, user, body);
    if (action === 'updateTaxInfo') return await handleUpdateTaxInfo(base44, user, body);

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/* ===================== GET WALLET ===================== */
async function handleGetWallet(base44, user) {
  let wallets = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: user.id });
  let wallet = wallets[0];

  if (!wallet) {
    wallet = await base44.asServiceRole.entities.ExecutiveWallet.create({
      user_id: user.id,
      user_name: user.full_name || '',
      user_email: user.email || '',
    });
  }

  wallet = await syncCommissions(base44, user, wallet);
  const eligibility = await checkEligibility(base44, user, wallet);
  const referralStats = await getReferralStats(base44, user);
  const commissionBreakdown = await getCommissionBreakdown(base44, user);
  const ambassadorLevel = getAmbassadorLevel(wallet.lifetime_earnings || 0);
  const rewardTier = getRewardTier(wallet.lifetime_referrals || 0);

  const updates = {};
  if (wallet.ambassador_level !== ambassadorLevel.level) updates.ambassador_level = ambassadorLevel.level;
  if (wallet.reward_tier !== rewardTier.tier) updates.reward_tier = rewardTier.tier;
  if (wallet.withdrawal_eligible !== eligibility.eligible) updates.withdrawal_eligible = eligibility.eligible;
  if (Object.keys(updates).length > 0) {
    wallet = await base44.asServiceRole.entities.ExecutiveWallet.update(wallet.id, updates);
  }

  return Response.json({ wallet, eligibility, referralStats, commissionBreakdown, ambassadorLevel, rewardTier });
}

/* ===================== GET TRANSACTIONS ===================== */
async function handleGetTransactions(base44, user, body) {
  const limit = body.limit || 100;
  const txns = await base44.asServiceRole.entities.WalletTransaction.filter({ user_id: user.id }, '-created_date', limit);
  return Response.json({ transactions: txns, total: txns.length });
}

/* ===================== REQUEST WITHDRAWAL ===================== */
async function handleRequestWithdrawal(base44, user, body) {
  const { amount, method, account_details } = body;
  if (!amount || amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });
  if (!method) return Response.json({ error: 'Withdrawal method required' }, { status: 400 });

  let wallets = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: user.id });
  let wallet = wallets[0];
  if (!wallet) return Response.json({ error: 'Wallet not found' }, { status: 404 });

  wallet = await syncCommissions(base44, user, wallet);
  const eligibility = await checkEligibility(base44, user, wallet);
  if (!eligibility.eligible) {
    return Response.json({ error: 'Not eligible for withdrawal', reasons: eligibility.reasons }, { status: 403 });
  }

  let settings = [];
  try { settings = await base44.asServiceRole.entities.ReferralSettings.filter({}); } catch {}
  const minAmount = settings[0]?.minimum_payout_threshold || 50;
  if (amount < minAmount) {
    return Response.json({ error: `Minimum withdrawal amount is $${minAmount}` }, { status: 400 });
  }
  if (amount > (wallet.withdrawable_balance || 0)) {
    return Response.json({ error: 'Insufficient withdrawable balance' }, { status: 400 });
  }

  const withdrawal = await base44.asServiceRole.entities.WithdrawalRequest.create({
    user_id: user.id,
    user_name: user.full_name || '',
    user_email: user.email || '',
    amount,
    method,
    status: 'pending',
    requested_date: new Date().toISOString(),
    account_details_json: JSON.stringify(account_details || {}),
  });

  const txn = await base44.asServiceRole.entities.WalletTransaction.create({
    user_id: user.id,
    user_name: user.full_name || '',
    transaction_id: `WT-WD-${Date.now()}`,
    type: 'withdrawal',
    description: `Withdrawal via ${method.replace('_', ' ')} — $${amount.toFixed(2)}`,
    amount: -amount,
    balance_after: (wallet.available_balance || 0) - amount,
    status: 'pending',
    reference_id: withdrawal.id,
    reference_type: 'withdrawal',
  });

  await base44.asServiceRole.entities.WithdrawalRequest.update(withdrawal.id, { wallet_transaction_id: txn.id });
  wallet = await syncCommissions(base44, user, wallet);

  try {
    await base44.asServiceRole.entities.Notification.create({
      type: 'system',
      title: 'Withdrawal Requested',
      message: `Your withdrawal request for $${amount.toFixed(2)} via ${method.replace('_', ' ')} is pending review.`,
      icon: '🏦',
      user_id: user.id,
      workspace: 'executive',
      visibility: 'private',
    });
  } catch {}

  return Response.json({ withdrawal, wallet });
}

/* ===================== GET WITHDRAWALS ===================== */
async function handleGetWithdrawals(base44, user) {
  const withdrawals = await base44.asServiceRole.entities.WithdrawalRequest.filter({ user_id: user.id }, '-created_date', 50);
  return Response.json({ withdrawals });
}

/* ===================== ADMIN ADJUST ===================== */
async function handleAdminAdjust(base44, user, body) {
  const role = user.role || '';
  if (!['admin', 'super_admin', 'platform_admin', 'security_admin'].includes(role)) {
    return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }

  const { target_user_id, amount, description, type = 'manual_adjustment' } = body;
  if (!target_user_id || !amount) return Response.json({ error: 'target_user_id and amount required' }, { status: 400 });

  let wallets = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: target_user_id });
  let wallet = wallets[0];
  if (!wallet) {
    wallet = await base44.asServiceRole.entities.ExecutiveWallet.create({
      user_id: target_user_id,
      user_name: body.target_user_name || '',
      user_email: body.target_user_email || '',
    });
  }

  await base44.asServiceRole.entities.WalletTransaction.create({
    user_id: target_user_id,
    user_name: wallet.user_name || '',
    transaction_id: `WT-ADJ-${Date.now()}`,
    type,
    description: description || `Manual adjustment by ${user.full_name || 'admin'}`,
    amount,
    balance_after: (wallet.available_balance || 0) + amount,
    status: 'completed',
    reference_type: 'admin_adjustment',
    metadata_json: JSON.stringify({ adjusted_by: user.id, adjusted_by_name: user.full_name }),
  });

  wallet = await syncCommissions(base44, target_user_id, wallet);

  try {
    await base44.asServiceRole.entities.Notification.create({
      type: 'system',
      title: amount > 0 ? 'Wallet Credited' : 'Wallet Debited',
      message: `${amount > 0 ? 'Credit' : 'Debit'} of $${Math.abs(amount).toFixed(2)} — ${description || 'manual adjustment'}`,
      icon: amount > 0 ? '💰' : '⚠️',
      user_id: target_user_id,
      workspace: 'executive',
      visibility: 'private',
    });
  } catch {}

  return Response.json({ wallet });
}

/* ===================== UPDATE TAX INFO ===================== */
async function handleUpdateTaxInfo(base44, user, body) {
  let wallets = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: user.id });
  let wallet = wallets[0];
  if (!wallet) return Response.json({ error: 'Wallet not found' }, { status: 404 });
  wallet = await base44.asServiceRole.entities.ExecutiveWallet.update(wallet.id, { tax_info_completed: body.completed || false });
  const eligibility = await checkEligibility(base44, user, wallet);
  return Response.json({ wallet, eligibility });
}

/* ===================== SYNC COMMISSIONS ===================== */
async function syncCommissions(base44, user, wallet) {
  const userId = user.id || wallet.user_id;
  const userName = user.full_name || wallet.user_name || '';

  let approvedTxns = [];
  try {
    approvedTxns = await base44.asServiceRole.entities.ReferralTransaction.filter({
      referrer_user_id: userId,
      status: 'approved'
    });
  } catch {}

  for (const rt of approvedTxns) {
    let existing = [];
    try {
      existing = await base44.asServiceRole.entities.WalletTransaction.filter({
        user_id: userId,
        reference_id: rt.id,
        reference_type: 'referral_transaction'
      });
    } catch {}

    if (existing.length === 0) {
      if (rt.commission_amount > 0) {
        await base44.asServiceRole.entities.WalletTransaction.create({
          user_id: userId,
          user_name: userName,
          transaction_id: `WT-RC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: 'referral_commission',
          description: `Referral commission — ${rt.invitee_name || rt.invitee_email || 'invitee'} (${rt.plan || 'subscription'})`,
          amount: rt.commission_amount,
          balance_after: 0,
          status: 'completed',
          reference_id: rt.id,
          reference_type: 'referral_transaction',
        });
      }
      if (rt.founding_bonus_applied && rt.founding_bonus_amount > 0) {
        await base44.asServiceRole.entities.WalletTransaction.create({
          user_id: userId,
          user_name: userName,
          transaction_id: `WT-FB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: 'founder_bonus',
          description: `Founder bonus — ${rt.invitee_name || rt.invitee_email || 'invitee'}`,
          amount: rt.founding_bonus_amount,
          balance_after: 0,
          status: 'completed',
          reference_id: rt.id,
          reference_type: 'referral_transaction',
        });
      }
      try { await base44.asServiceRole.entities.ReferralTransaction.update(rt.id, { status: 'paid' }); } catch {}
    }
  }

  // Pending commissions
  let pendingTxns = [];
  try {
    pendingTxns = await base44.asServiceRole.entities.ReferralTransaction.filter({
      referrer_user_id: userId,
      status: 'pending'
    });
  } catch {}
  const pendingTotal = pendingTxns.reduce((sum, t) => sum + (t.commission_amount || 0) + (t.founding_bonus_amount || 0), 0);

  // Recalculate from all wallet transactions
  let allTxns = [];
  try {
    allTxns = await base44.asServiceRole.entities.WalletTransaction.filter({ user_id: userId });
  } catch {}

  const completed = allTxns.filter((t) => t.status === 'completed');
  const lifetimeEarnings = completed.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalDebits = completed.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const availableBalance = lifetimeEarnings - totalDebits;

  const referralEarnings = completed.filter((t) => t.type === 'referral_commission').reduce((s, t) => s + t.amount, 0);
  const founderBonuses = completed.filter((t) => t.type === 'founder_bonus').reduce((s, t) => s + t.amount, 0);
  const walletCredits = completed.filter((t) => t.type === 'wallet_credit' || t.type === 'bonus_credit').reduce((s, t) => s + t.amount, 0);
  const bonusCredits = completed.filter((t) => t.type === 'bonus_credit').reduce((s, t) => s + t.amount, 0);
  const subscriptionSavings = completed.filter((t) => t.type === 'subscription_renewal' || t.type === 'subscription_purchase').reduce((s, t) => s + Math.abs(t.amount), 0);
  const marketplaceSpend = completed.filter((t) => t.type === 'marketplace_purchase').reduce((s, t) => s + Math.abs(t.amount), 0);

  const pendingWithdrawals = allTxns
    .filter((t) => t.type === 'withdrawal' && (t.status === 'pending' || t.status === 'processing'))
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const withdrawableBalance = Math.max(0, availableBalance - pendingWithdrawals);

  let referrals = [];
  try {
    referrals = await base44.asServiceRole.entities.Referral.filter({ referrer_user_id: userId });
  } catch {}
  const lifetimeReferrals = referrals.filter((r) => ['converted', 'verified', 'registered'].includes(r.status)).length;

  const updated = await base44.asServiceRole.entities.ExecutiveWallet.update(wallet.id, {
    available_balance: availableBalance,
    pending_balance: pendingTotal,
    withdrawable_balance: withdrawableBalance,
    lifetime_earnings: lifetimeEarnings,
    referral_earnings: referralEarnings,
    founder_bonuses: founderBonuses,
    wallet_credits: walletCredits,
    bonus_credits: bonusCredits,
    subscription_savings: subscriptionSavings,
    marketplace_spend: marketplaceSpend,
    total_transactions: allTxns.length,
    lifetime_referrals: lifetimeReferrals,
  });

  return updated;
}

/* ===================== ELIGIBILITY ===================== */
async function checkEligibility(base44, user, wallet) {
  const reasons = [];

  let identity = null;
  try {
    const verifications = await base44.asServiceRole.entities.IdentityVerification.filter({ user_id: user.id });
    identity = verifications[0];
  } catch {}

  if (!identity?.identity_verified) reasons.push('Identity not verified');
  if ((identity?.trust_score || 0) < 90) reasons.push(`Trust score must be ≥ 90 (currently ${identity?.trust_score || 0})`);
  if (!wallet?.tax_info_completed) reasons.push('Tax information not completed');

  let fraudReferrals = [];
  try {
    fraudReferrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_user_id: user.id,
      fraud_flag: true
    });
  } catch {}
  if (fraudReferrals.length > 0) reasons.push(`${fraudReferrals.length} fraud flag(s) detected on referrals`);

  if (wallet?.status !== 'active') reasons.push('Wallet is not active');

  return {
    eligible: reasons.length === 0,
    reasons,
    trust_score: identity?.trust_score || 0,
    identity_verified: identity?.identity_verified || false,
    tax_info_completed: wallet?.tax_info_completed || false,
  };
}

/* ===================== REFERRAL STATS ===================== */
async function getReferralStats(base44, user) {
  let referrals = [];
  let events = [];
  try {
    referrals = await base44.asServiceRole.entities.Referral.filter({ referrer_user_id: user.id });
  } catch {}
  try {
    events = await base44.asServiceRole.entities.ReferralEvent.filter({ referrer_user_id: user.id });
  } catch {}

  const clicks = events.filter((e) => e.event_type === 'link_clicked').length;
  const registrations = referrals.filter((r) => ['registered', 'verified', 'converted'].includes(r.status)).length;
  const conversions = referrals.filter((r) => r.status === 'converted').length;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

  return { clicks, registrations, conversions, conversionRate, total_referrals: referrals.length };
}

/* ===================== COMMISSION BREAKDOWN ===================== */
async function getCommissionBreakdown(base44, user) {
  let txns = [];
  try {
    txns = await base44.asServiceRole.entities.ReferralTransaction.filter({ referrer_user_id: user.id });
  } catch {}

  const groups = {
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
    cancelled: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
  };

  for (const t of txns) {
    const key = t.status || 'pending';
    if (groups[key]) {
      groups[key].count++;
      groups[key].amount += (t.commission_amount || 0) + (t.founding_bonus_amount || 0);
    }
  }

  let fraudCount = 0;
  try {
    const fraudReferrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_user_id: user.id,
      fraud_flag: true
    });
    fraudCount = fraudReferrals.length;
  } catch {}

  groups.fraud_review = { count: fraudCount, amount: 0 };

  return groups;
}

/* ===================== AMBASSADOR / TIER ===================== */
function getAmbassadorLevel(lifetimeEarnings) {
  const levels = [
    { level: 'diamond', label: 'Diamond', min: 10000, color: '#b9f2ff', icon: '💠', bonus: '20% extra commission' },
    { level: 'platinum', label: 'Platinum', min: 5000, color: '#e5e4e2', icon: '💎', bonus: '15% extra commission' },
    { level: 'gold', label: 'Gold', min: 1000, color: '#ffd700', icon: '🥇', bonus: '12% extra commission' },
    { level: 'silver', label: 'Silver', min: 500, color: '#c0c0c0', icon: '🥈', bonus: '8% extra commission' },
    { level: 'bronze', label: 'Bronze', min: 100, color: '#cd7f32', icon: '🥉', bonus: '5% extra commission' },
  ];
  for (const l of levels) {
    if (lifetimeEarnings >= l.min) return l;
  }
  return { level: 'none', label: 'None', min: 0, color: '#666', icon: '⚪', bonus: 'Standard commission' };
}

function getRewardTier(lifetimeReferrals) {
  const tiers = [
    { tier: 'legend', label: 'EXECLEAD Legend', min: 500, icon: '💎' },
    { tier: 'partner', label: 'Elite Executive Partner', min: 100, icon: '👑' },
    { tier: 'champion', label: 'Executive Champion', min: 50, icon: '🏆' },
    { tier: 'ambassador', label: 'Leadership Ambassador', min: 25, icon: '🏅' },
    { tier: 'influencer', label: 'Executive Influencer', min: 10, icon: '🌟' },
    { tier: 'supporter', label: 'Executive Supporter', min: 1, icon: '⭐' },
  ];
  for (const t of tiers) {
    if (lifetimeReferrals >= t.min) return t;
  }
  return { tier: 'none', label: 'None', min: 0, icon: '⚪' };
}