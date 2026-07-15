import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { PORTFOLIO_SECTIONS, computeCompleteness } from '@/lib/portfolioEngine';
import { isSectionVisible } from '@/lib/portfolioEngineV2';
import SectionNavigator from '@/components/portfolio/SectionNavigator';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import PortfolioScoreboard from '@/components/portfolio/PortfolioScoreboard';
import RecommendationPanel from '@/components/portfolio/RecommendationPanel';
import IdentityLayer from '@/components/portfolio/IdentityLayer';
import PortfolioViews from '@/components/portfolio/PortfolioViews';
import PortfolioHealth from '@/components/portfolio/PortfolioHealth';
import ExecutiveSnapshot from '@/components/portfolio/ExecutiveSnapshot';
import ExecutiveStory from '@/components/portfolio/ExecutiveStory';
import ExecutiveTimeline from '@/components/portfolio/ExecutiveTimeline';
import LeadershipDNASection from '@/components/portfolio/LeadershipDNASection';
import ExecutiveJourney from '@/components/portfolio/ExecutiveJourney';
import VerifiedAchievements from '@/components/portfolio/VerifiedAchievements';
import EvidenceVault from '@/components/portfolio/EvidenceVault';
import LinkSection from '@/components/portfolio/LinkSection';
import ExecutiveTrust from '@/components/portfolio/ExecutiveTrust';
import LearningRecord from '@/components/portfolio/LearningRecord';
import SimulationHistory from '@/components/portfolio/SimulationHistory';
import LeadershipJournal from '@/components/portfolio/LeadershipJournal';
import ExecutiveInsights from '@/components/portfolio/ExecutiveInsights';
import CareerAssets from '@/components/portfolio/CareerAssets';
import ImpactDashboard from '@/components/portfolio/ImpactDashboard';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import VersionHistory from '@/components/portfolio/VersionHistory';
import { BookOpen, Star, FileCheck, Users, Globe, Landmark, Award, UploadCloud } from 'lucide-react';

export default function ExecutivePortfolio() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [active, setActive] = useState('snapshot');
  const [viewMode, setViewMode] = useState('private');

  useEffect(() => {
    (async () => {
      if (!user) return;
      const results = await Promise.allSettled([
        base44.entities.Achievement.filter({}, '-created_date', 50),
        base44.entities.Certificate.filter({}, '-created_date', 50),
        base44.entities.SimulationSession.filter({}, '-created_date', 20),
        base44.entities.JournalEntry.filter({}, '-created_date', 20),
        base44.entities.LessonProgress.filter({}, '-created_date', 50),
        base44.entities.ProfileView.filter({}, '-created_date', 20),
        base44.entities.NetworkConnection.filter({}, '-created_date', 50),
        base44.entities.ResumeVersion.filter({}, '-created_date', 10),
        base44.entities.JourneyEvent.filter({}, '-created_date', 20),
        base44.entities.EvidenceItem.filter({}, '-created_date', 50),
        base44.entities.PortfolioVersion.filter({}, '-created_date', 20),
      ]);
      const [achievements, certificates, simulations, journalEntries, lessons, profileViews, connections, resumes, journeyEvents, evidenceItems, versions] =
        results.map(r => r.status === 'fulfilled' ? r.value : []);
      setData({
        achievements, certificates, simulations, journalEntries, lessons, profileViews, connections, resumes, journeyEvents, evidenceItems, versions,
        achievementsCount: achievements.length, certificatesCount: certificates.length,
        simulationsCount: simulations.length, journalCount: journalEntries.length,
        lessonsCount: lessons.length, connectionsCount: connections.length,
        profileViewsCount: profileViews.length, timelineCount: achievements.length + certificates.length,
        journeyCount: journeyEvents.length, evidenceCount: evidenceItems.length,
        versionsCount: versions.length, hasResume: resumes.length > 0,
        hasSummary: !!user?.data?.executive_summary, hasStory: !!user?.data?.executive_story,
        hasDNA: false, hasReputation: false, hasLegacy: false, hasInsights: false,
        profileVisible: true, documentsCount: evidenceItems.length,
        verificationsCount: 0, caseStudiesCount: 0,
        evidenceItems, versions, journeyEvents,
      });
      setLoading(false);
    })();
  }, [user]);

  const scrollTo = (id) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  if (loading) {
    return (<div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>);
  }

  const S = PORTFOLIO_SECTIONS;
  const vis = (id) => isSectionVisible(id, viewMode);
  const completeness = computeCompleteness(data);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PortfolioHero user={user} data={data} />
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link to="/resume-import" className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-xl p-4 hover:border-indigo-500/40 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
            <UploadCloud size={18} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">AI Resume Auto-Population Engine™</div>
            <div className="text-xs text-white/40">Upload your resume to auto-populate 80–90% of your Executive Profile</div>
          </div>
          <span className="text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">Start →</span>
        </Link>
      </div>
      <IdentityLayer data={data} completeness={completeness} />
      <PortfolioScoreboard data={data} completeness={completeness} />
      <RecommendationPanel data={data} completeness={completeness} />
      <PortfolioHealth data={data} />
      <PortfolioViews mode={viewMode} onChange={setViewMode} />
      <SectionNavigator sections={S.filter(s => vis(s.id))} active={active} onSelect={scrollTo} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {vis('snapshot') && <ExecutiveSnapshot user={user} data={data} />}
        {vis('story') && <ExecutiveStory user={user} data={data} />}
        {vis('timeline') && <ExecutiveTimeline data={data} />}
        {vis('leadership-dna') && <LeadershipDNASection data={data} />}
        {vis('journey') && <ExecutiveJourney data={data} />}
        {vis('achievements') && <VerifiedAchievements data={data} />}
        {vis('evidence') && <EvidenceVault user={user} data={data} />}
        <LinkSection section={{ id: 'credentials', number: 20, title: 'Executive Credentials™', icon: Award, color: '#f59e0b' }} link="/executive-credentials" description="Verified leadership credentials earned through evidence-based achievement. Cannot be purchased — only earned." />
        {vis('case-studies') && <LinkSection section={S[5]} link="/legacy-library" description="Professional leadership stories with situation, challenge, actions, results, and lessons learned." icon={BookOpen} />}
        {vis('reputation') && <LinkSection section={S[6]} link="/reputation" description="Your executive reputation score, trend, community contributions, and thought leadership." icon={Star} />}
        {vis('trust') && <ExecutiveTrust data={data} />}
        {vis('learning') && <LearningRecord data={data} />}
        {vis('simulations') && <SimulationHistory data={data} />}
        {vis('journal') && <LeadershipJournal data={data} />}
        {vis('insights') && <ExecutiveInsights user={user} data={data} />}
        {vis('career-assets') && <CareerAssets data={data} />}
        {vis('documents') && <LinkSection section={S[13]} link="/security" description="Encrypted, access-logged, permission-controlled document vault with download audit." icon={FileCheck} />}
        {vis('network') && <LinkSection section={S[14]} link="/network" description="Mentors, coaches, peers, recruiters, organizations, recommendations, and testimonials." icon={Users} />}
        {vis('public-profile') && <LinkSection section={S[15]} link={`/u/${user?.data?.username || user?.id || ''}`} description="Your public profile at execlead.ai/u/username with per-section visibility controls." icon={Globe} />}
        {vis('impact') && <ImpactDashboard data={data} />}
        {vis('analytics') && <PortfolioAnalytics data={data} />}
        {vis('legacy') && <LinkSection section={S[17]} link="/executive-legacy" description="Leadership philosophy, personal mission, vision, core values, and mentoring legacy." icon={Landmark} />}
        {viewMode === 'private' && <VersionHistory data={data} />}
      </div>
    </div>
  );
}