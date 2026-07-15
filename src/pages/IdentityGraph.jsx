import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { NODE_TYPES, RELATIONSHIPS } from '@/lib/identityGraphEngine';
import { Network, Loader2, Zap, Lock } from 'lucide-react';
import GraphCanvas from '@/components/identity-graph/GraphCanvas';
import NodeInspector from '@/components/identity-graph/NodeInspector';
import ImpactExplainer from '@/components/identity-graph/ImpactExplainer';

export default function IdentityGraph() {
  const { user } = useAuth();
  const [nodeData, setNodeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [impactSource, setImpactSource] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const results = await Promise.allSettled([
        base44.entities.UserProfile.filter({ user_id: user.id }),
        base44.entities.Certificate.filter({}, '-created_date', 100),
        base44.entities.ExecutiveCompetency.filter({ user_id: user.id }, '-created_date', 100),
        base44.entities.JourneyEvent.filter({ user_id: user.id }, '-created_date', 100),
        base44.entities.Achievement.filter({}, '-created_date', 100),
        base44.entities.SimulationSession.filter({}, '-created_date', 100),
        base44.entities.LessonProgress.filter({}, '-created_date', 100),
        base44.entities.ExecutiveCredential.filter({}, '-created_date', 100),
        base44.entities.IdentityVerification.filter({ user_id: user.id }),
        base44.entities.ExecutiveReputation.filter({ user_id: user.id }),
        base44.entities.CommunityMembership.filter({ user_id: user.id }),
        base44.entities.PortfolioVersion.filter({}, '-created_date', 10),
        base44.entities.LeadershipDNA.filter({ user_id: user.id }),
      ]);

      const [profiles, certs, competencies, journeys, achievements, simulations, lessons, credentials, verifications, reputations, memberships, versions, dna] =
        results.map(r => r.status === 'fulfilled' ? r.value : []);

      const profile = profiles?.[0];
      const verification = verifications?.[0];
      const reputation = reputations?.[0];

      let expCount = 0, eduCount = 0, skillCount = 0, awardCount = 0, pubCount = 0;
      if (profile) {
        try { expCount = JSON.parse(profile.experience_json || '[]').length; } catch {}
        try { eduCount = JSON.parse(profile.education_json || '[]').length; } catch {}
        skillCount = (profile.skills || []).length;
        try { awardCount = JSON.parse(profile.awards_json || '[]').length; } catch {}
        try { pubCount = JSON.parse(profile.projects_json || '[]').length; } catch {}
      }

      const careerJourneys = (journeys || []).filter(j => j.event_type === 'career');
      const eduJourneys = (journeys || []).filter(j => j.event_type === 'education');
      const awardJourneys = (journeys || []).filter(j => j.event_type === 'award');

      setNodeData({
        user: 1,
        experience: expCount || careerJourneys.length,
        education: eduCount || eduJourneys.length,
        certification: (certs || []).length,
        career_goal: profile?.target_role ? 1 : 0,
        skill: skillCount,
        competency: (competencies || []).length,
        leadership_dna: (dna || []).length,
        journey: (journeys || []).length,
        achievement: (achievements || []).length,
        award: awardCount || awardJourneys.length,
        publication: pubCount,
        membership: (memberships || []).length,
        simulation: (simulations || []).length,
        learning: (lessons || []).length,
        credential: (credentials || []).length,
        readiness: profile?.cached_readiness_score || 0,
        trust: verification?.trust_score || 0,
        reputation: reputation?.reputation_score || reputation?.score || 0,
        portfolio: (versions || []).length,
        promotion_forecast: profile?.cached_promotion_probability || 0,
      });
    } catch (e) { /* error */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleSimulate = async (nodeType) => {
    setImpactSource(nodeType);
    try {
      await base44.entities.SecurityEvent.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        event_type: 'identity_verification',
        severity: 'info',
        description: 'Executive Identity Graph™ impact simulated from ' + NODE_TYPES[nodeType].label,
        action_taken: 'logged',
        metadata_json: JSON.stringify({ source_node: nodeType, triggered_from: 'identity_graph' }),
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const totalNodes = Object.keys(NODE_TYPES).length;
  const activeNodes = Object.values(nodeData).filter(v => v > 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Network size={12} className="text-violet-400" /> Intelligence · Identity Graph
        </div>
        <h1 className="text-2xl font-bold text-white">Executive Identity Graph™</h1>
        <p className="text-white/40 text-sm mt-2 max-w-2xl leading-relaxed">
          The intelligence layer connecting every professional data object. Understand how each achievement,
          certification, competency, and learning event affects leadership capability, executive readiness,
          reputation, credentials, and career progression.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Graph Nodes" value={`${activeNodes}/${totalNodes}`} sub="active types" color="#6366f1" />
        <StatCard label="Relationships" value={String(RELATIONSHIPS.length)} sub="defined edges" color="#a855f7" />
        <StatCard label="Data Points" value={String(Object.values(nodeData).reduce((a, b) => a + (b || 0), 0))} sub="total records" color="#10b981" />
        <StatCard label="Graph Health" value={activeNodes > 10 ? 'Healthy' : 'Building'} sub={activeNodes > 10 ? 'Well connected' : 'Add more data'} color={activeNodes > 10 ? '#10b981' : '#f59e0b'} />
      </div>

      {/* Graph + Inspector */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GraphCanvas nodeData={nodeData} selected={selected} onSelect={setSelected} />
        </div>
        <div>
          <NodeInspector selected={selected} nodeData={nodeData} onSimulate={handleSimulate} />
        </div>
      </div>

      {/* Impact Explainer */}
      <ImpactExplainer sourceNode={impactSource} />

      {/* Governance Note */}
      <div className="flex items-start gap-2 text-[11px] text-white/30 bg-white/[0.02] border border-white/5 rounded-lg p-3">
        <Lock size={12} className="flex-shrink-0 mt-0.5 text-white/20" />
        <span>
          Every graph recalculation writes an immutable event to the Platform Event Ledger™.
          The graph model is the intelligence layer — it doesn't just store data, it understands
          how every entity influences another.
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40">{sub}</div>
    </div>
  );
}