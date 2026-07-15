import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { recalculateTrust, calculateVerificationCompletion, TRUST_LEVELS, calculateTrustLevel } from '@/lib/trustEngine';
import { ShieldCheck, Loader2, CheckCircle2, Clock, Smartphone, TrendingUp, Lock } from 'lucide-react';
import VerificationStatusGrid from '@/components/verification/VerificationStatusGrid';
import VerificationTimeline from '@/components/verification/VerificationTimeline';
import TrustedDevicesPanel from '@/components/verification/TrustedDevicesPanel';
import ExecutiveTrustBreakdown from '@/components/verification/ExecutiveTrustBreakdown';
import RiskAssessmentPanel from '@/components/verification/RiskAssessmentPanel';

export default function VerificationCenter() {
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const records = await base44.entities.IdentityVerification.filter({ user_id: user.id });
      let record = records[0];

      if (!record) {
        record = await base44.entities.IdentityVerification.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          email_verified: true,
          email_verified_date: new Date().toISOString(),
          identity_status: 'pending_upload',
          verification_provider: 'none',
          risk_level: 'low',
        });
      }

      const recalced = recalculateTrust(record);
      if (recalced.trust_score !== record.trust_score || recalced.trust_level !== record.trust_level) {
        record = await base44.entities.IdentityVerification.update(record.id, {
          trust_score: recalced.trust_score,
          trust_level: recalced.trust_level,
          risk_level: recalced.risk_level || 'low',
        });
      }
      setVerification(record);

      const [logRecords, deviceRecords] = await Promise.all([
        base44.entities.VerificationLog.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.TrustedDevice.filter({ user_id: user.id }, '-last_used', 20).catch(() => []),
      ]);
      setLogs(logRecords || []);
      setDevices(deviceRecords || []);
    } catch (e) { /* error */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleRevokeDevice = async (deviceId) => {
    setRevoking(true);
    try {
      await base44.entities.TrustedDevice.update(deviceId, { status: 'revoked', trust_status: 'revoked' });
      if (verification?.id) {
        await base44.entities.VerificationLog.create({
          verification_id: verification.id,
          user_id: user.id,
          user_name: user.full_name || user.email,
          action: 'device_revoked',
          decision: 'approved',
          notes: 'Device revoked by user from Verification Center',
        });
      }
      await load();
    } catch (e) { /* error */ }
    setRevoking(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const completion = calculateVerificationCompletion(verification);
  const level = calculateTrustLevel(verification);
  const levelMeta = TRUST_LEVELS.find(l => l.level === level);
  const pendingCount = [
    verification?.email_verified, verification?.phone_verified, verification?.identity_verified,
    verification?.professional_verified, verification?.organization_verified,
    verification?.education_verified, verification?.executive_credentials_verified,
    verification?.executive_portfolio_verified,
  ].filter(v => !v).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-emerald-400" /> Security · Verification Center™
        </div>
        <h1 className="text-2xl font-bold text-white">Verification Center™</h1>
        <p className="text-white/40 text-sm mt-2 max-w-2xl leading-relaxed">
          The authoritative identity verification hub across EXECLEAD.AI. Track every verification,
          manage trusted devices, and maintain Executive Trust™ with full auditability.
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardStat icon={CheckCircle2} label="Verification Completion" value={`${completion}%`} sub={`${8 - pendingCount} of 8 complete`} color="#10b981" />
        <DashboardStat icon={TrendingUp} label="Executive Trust Score" value={`${verification?.trust_score || 0}`} sub={`Level ${level} · ${levelMeta?.name || 'Unverified'}`} color="#a855f7" />
        <DashboardStat icon={Clock} label="Pending Verifications" value={String(pendingCount)} sub={pendingCount === 0 ? 'All complete' : 'Action needed'} color={pendingCount > 0 ? '#f59e0b' : '#10b981'} />
        <DashboardStat icon={Smartphone} label="Trusted Devices" value={String(devices.filter(d => d.status === 'trusted').length)} sub={`${devices.length} total registered`} color="#06b6d4" />
      </div>

      {/* Risk Assessment */}
      <RiskAssessmentPanel verification={verification} devices={devices} />

      {/* Verification Status Grid */}
      <VerificationStatusGrid verification={verification} />

      {/* Executive Trust Breakdown */}
      <ExecutiveTrustBreakdown verification={verification} />

      {/* Trusted Devices */}
      <TrustedDevicesPanel devices={devices} onRevoke={handleRevokeDevice} revoking={revoking} />

      {/* Verification Timeline */}
      <VerificationTimeline logs={logs} />

      {/* Governance Note */}
      <div className="flex items-start gap-2 text-[11px] text-white/30 bg-white/[0.02] border border-white/5 rounded-lg p-3">
        <Lock size={12} className="flex-shrink-0 mt-0.5 text-white/20" />
        <span>
          Every verification event is written to the immutable Platform Event Ledger™ and Audit Ledger™.
          Verification history cannot be edited or deleted — ensuring full auditability and compliance.
        </span>
      </div>
    </div>
  );
}

function DashboardStat({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40 mt-0.5">{sub}</div>
    </div>
  );
}