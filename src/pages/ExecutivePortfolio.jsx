import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { PORTFOLIO_SECTIONS, computeCompleteness } from '@/lib/portfolioEngine';
import SectionNavigator from '@/components/portfolio/SectionNavigator';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import PortfolioScoreboard from '@/components/portfolio/PortfolioScoreboard';
import PortfolioSection from '@/components/portfolio/PortfolioSection';
import ExecutiveSnapshot from '@/components/portfolio/ExecutiveSnapshot';
import ExecutiveTimeline from '@/components/portfolio/ExecutiveTimeline';
import LeadershipDNASection from '@/components/portfolio/LeadershipDNASection';
import ExecutiveJourney from '@/components/portfolio/ExecutiveJourney';
import VerifiedAchievements from '@/components/portfolio/VerifiedAchievements';
import LinkSection from '@/components/portfolio/LinkSection';
import ExecutiveTrust from '@/components/portfolio/ExecutiveTrust';
import LearningRecord from '@/components/portfolio/LearningRecord';
import SimulationHistory from '@/components/portfolio/SimulationHistory';
import LeadershipJournal from '@/components/portfolio/LeadershipJournal';
import ExecutiveInsights from '@/components/portfolio/ExecutiveInsights';
import CareerAssets from '@/components/portfolio/CareerAssets';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import { BookOpen, Star, FileCheck, Users, Globe, Landmark } from 'lucide-react';

export default function ExecutivePortfolio() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [active, setActive] = useState('snapshot');

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
      ]);
      const [achievements, certificates, simulations, journalEntries, lessons, profileViews, connections, resumes, journeyEvents] =
        results.map(r => r.status === 'fulfilled' ? r.value : []);
      setData({
        achievements, certificates, simulations, journalEntries, lessons, profileViews, connections, resumes, journeyEvents,
        achievementsCount: achievements.length,
        certificatesCount: certificates.length,
        simulationsCount: simulations.length,
        journalCount: journalEntries.length,
        lessonsCount: lessons.length,
        connectionsCount: connections.length,
        profileViewsCount: profileViews.length,
        timelineCount: achievements.length + certificates.length,
        journeyCount: journeyEvents.length,
        hasResume: resumes.length > 0,
        hasSummary: !!user?.data?.executive_summary,
        hasDNA: false,
        hasReputation: false,
        hasLegacy: false,
        hasInsights: false,
        profileVisible: true,
        documentsCount: 0,
        verificationsCount: 0,
        caseStudiesCount: 0,
      });
      setLoading(false);
    })();
  }, [user]);

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  const S = PORTFOLIO_SECTIONS;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PortfolioHero user={user} data={data} />
      <PortfolioScoreboard data={data} completeness={computeCompleteness(data)} />
      <SectionNavigator sections={S} active={active} onSelect={scrollTo} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <ExecutiveSnapshot user={user} data={data} />
        <ExecutiveTimeline data={data} />
        <LeadershipDNASection data={data} />
        <ExecutiveJourney data={data} />
        <VerifiedAchievements data={data} />
        <LinkSection section={S[5]} link="/legacy-library" description="Professional leadership stories with situation, challenge, actions, results, and lessons learned." icon={BookOpen} />
        <LinkSection section={S[6]} link="/reputation" description="Your executive reputation score, trend, community contributions, and thought leadership." icon={Star} />
        <ExecutiveTrust data={data} />
        <LearningRecord data={data} />
        <SimulationHistory data={data} />
        <LeadershipJournal data={data} />
        <ExecutiveInsights user={user} data={data} />
        <CareerAssets data={data} />
        <LinkSection section={S[13]} link="/security" description="Encrypted, access-logged, permission-controlled document vault with download audit." icon={FileCheck} />
        <LinkSection section={S[14]} link="/network" description="Mentors, coaches, peers, recruiters, organizations, recommendations, and testimonials." icon={Users} />
        <LinkSection section={S[15]} link={`/u/${user?.data?.username || user?.id || ''}`} description="Your public profile at execlead.ai/u/username with per-section visibility controls." icon={Globe} />
        <PortfolioAnalytics data={data} />
        <LinkSection section={S[17]} link="/executive-legacy" description="Leadership philosophy, personal mission, vision, core values, and mentoring legacy." icon={Landmark} />
      </div>
    </div>
  );
}