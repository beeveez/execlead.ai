import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { CREDENTIAL_CATALOG, CREDENTIAL_TYPES, getAvailableCredentials, evaluateCredential, generateCredentialNumber, generateCredentialHash, getLevelMeta, getTypeMeta } from '@/lib/credentialEngine';
import CredentialDashboard from '@/components/credentials/CredentialDashboard';
import CredentialWallet from '@/components/credentials/CredentialWallet';
import CredentialDetail from '@/components/credentials/CredentialDetail';
import CredentialAdvisor from '@/components/credentials/CredentialAdvisor';
import { Award, CheckCircle2, Circle, Lock, ShieldCheck } from 'lucide-react';

export default function ExecutiveCredentials() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState([]);
  const [data, setData] = useState({});
  const [selected, setSelected] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      if (!user) return;
      const results = await Promise.allSettled([
        base44.entities.ExecutiveCredential.filter({}, '-created_date', 50),
        base44.entities.Achievement.filter({}, '-created_date', 50),
        base44.entities.Certificate.filter({}, '-created_date', 50),
        base44.entities.SimulationSession.filter({}, '-created_date', 20),
        base44.entities.LessonProgress.filter({}, '-created_date', 50),
        base44.entities.EvidenceItem.filter({}, '-created_date', 50),
        base44.entities.NetworkConnection.filter({}, '-created_date', 50),
        base44.entities.ResumeVersion.filter({}, '-created_date', 10),
        base44.entities.JourneyEvent.filter({}, '-created_date', 20),
      ]);
      const [creds, achievements, certificates, simulations, lessons, evidence, connections, resumes, journeyEvents] =
        results.map(r => r.status === 'fulfilled' ? r.value : []);
      setCredentials(creds);
      setData({
        achievements, certificates, simulations, lessons, evidenceItems: evidence, connections, resumes, journeyEvents,
        achievementsCount: achievements.length, certificatesCount: certificates.length,
        simulationsCount: simulations.length, lessonsCount: lessons.length,
        evidenceCount: evidence.length, connectionsCount: connections.length,
        journeyCount: journeyEvents.length, verificationsCount: 0,
        hasResume: resumes.length > 0, hasSummary: !!user?.data?.executive_summary,
        hasStory: !!user?.data?.executive_story, hasDNA: false,
        hasReputation: false, hasLegacy: false,
      });
      setLoading(false);
    })();
  }, [user]);

  const claimCredential = async (cred) => {
    const evaluation = evaluateCredential(cred.key, data);
    if (!evaluation.canIssue) return;
    setClaiming(cred.key);
    try {
      const credNumber = generateCredentialNumber();
      const issuedDate = new Date().toISOString();
      const created = await base44.entities.ExecutiveCredential.create({
        credential_key: cred.key, credential_name: cred.name,
        credential_level: cred.level, credential_type: cred.type,
        credential_description: cred.description,
        issued_date: issuedDate, issuer: 'EXECLEAD.AI',
        verification_status: 'active', credential_number: credNumber,
        credential_hash: generateCredentialHash({ credential_key: cred.key, credential_number: credNumber, issued_date: issuedDate }),
        verification_url: `${window.location.origin}/verify/cred/${credNumber}`,
        portfolio_visibility: 'public',
        evidence_summary: JSON.stringify(cred.evidence),
        requirements_met: JSON.stringify(evaluation.met.map(r => r.label)),
        is_permanent: cred.isPermanent !== false,
        renewal_status: cred.isPermanent !== false ? 'permanent' : 'active',
      });
      setCredentials([created, ...credentials]);
      base44.entities.PortfolioVersion.create({
        version_number: `v${Date.now()}`, change_description: `Credential earned: ${cred.name}`, change_type: 'achievement_added',
      }).catch(() => {});
    } catch (err) { console.error(err); }
    finally { setClaiming(null); }
  };

  if (loading) {
    return (<div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>);
  }

  const available = getAvailableCredentials(credentials, data);
  const recommendedCount = available.filter(c => c.evaluation.progress >= 40 && c.evaluation.progress < 100).length;
  const filteredAvailable = filter === 'all' ? available : available.filter(c => c.type === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} className="text-white/25" />
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Verified Leadership Credential Framework™</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Executive Credentials™</h1>
        <p className="text-xs text-white/40 mt-1">Evidence-based leadership credentials. Earned, not purchased.</p>
      </div>

      <CredentialDashboard earnedCount={credentials.length} availableCount={available.length} recommendedCount={recommendedCount} data={data} />

      {credentials.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">Credential Wallet™</h2>
            <span className="text-[10px] text-white/30">{credentials.length} earned</span>
          </div>
          <CredentialWallet credentials={credentials} onDetail={setSelected} />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Available Credentials</h2>
          <div className="flex gap-1">
            <button onClick={() => setFilter('all')} className={`text-[10px] px-2 py-1 rounded ${filter === 'all' ? 'bg-white/10 text-white/70' : 'text-white/30'}`}>All</button>
            {CREDENTIAL_TYPES.map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)} className={`text-[10px] px-2 py-1 rounded ${filter === t.id ? 'bg-white/10 text-white/70' : 'text-white/30'}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredAvailable.map((cred) => {
            const level = getLevelMeta(cred.level);
            const type = getTypeMeta(cred.type);
            const TypeIcon = type.icon;
            return (
              <div key={cred.key} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon size={12} style={{ color: type.color }} />
                      <span className="text-xs font-bold text-white/80">{cred.name}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${level.color}20`, color: level.color }}>{level.label}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mb-2">{cred.description}</p>
                    <div className="space-y-1">
                      {cred.requirements.map((req, i) => {
                        const isMet = cred.evaluation.met.some(m => m.id === req.id);
                        return (
                          <div key={i} className="flex items-center gap-1.5 text-[10px]">
                            {isMet ? <CheckCircle2 size={10} className="text-emerald-400" /> : <Circle size={10} className="text-white/15" />}
                            <span className={isMet ? 'text-white/50' : 'text-white/25'}>{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: cred.evaluation.canIssue ? '#10b981' : '#6366f1' }}>{cred.evaluation.progress}%</div>
                      <div className="text-[8px] text-white/20">{cred.evaluation.met.length}/{cred.requirements.length} met</div>
                    </div>
                    {cred.evaluation.canIssue ? (
                      <button onClick={() => claimCredential(cred)} disabled={claiming === cred.key}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] hover:bg-emerald-500/20 disabled:opacity-50">
                        {claiming === cred.key ? 'Issuing...' : 'Claim Credential'}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] text-white/20"><Lock size={8} /> Locked</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all" style={{ width: `${cred.evaluation.progress}%`, backgroundColor: cred.evaluation.canIssue ? '#10b981' : '#6366f1' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CredentialAdvisor data={data} credentials={credentials} />
      {selected && <CredentialDetail credential={selected} data={data} onClose={() => setSelected(null)} />}
    </div>
  );
}