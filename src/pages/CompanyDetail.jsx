import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft, MapPin, Crown, Target, Loader2, Check,
  Compass, Eye, Heart, Layers, Cpu, Package, Swords, Trophy, Globe, Network,
  Brain, Cloud, Leaf, Users2, GraduationCap, Briefcase, HelpCircle, BookOpen,
  DollarSign, Sparkles, MessageSquare, Award, TrendingUp,
  CalendarClock, Landmark, GitBranch, Crosshair, AlertTriangle, UserPlus,
  FileText, Server, Shield, BadgeCheck, Flag, ExternalLink, Info,
} from "lucide-react";
import CompanySection, { ListBlock } from "@/components/companies/CompanySection";
import CompanyEnrichButton from "@/components/companies/CompanyEnrichButton";
import CompanyAvatar from "@/components/companies/CompanyAvatar";
import ProfileStatusBadge from "@/components/companies/ProfileStatusBadge";
import ComplianceDisclaimer from "@/components/companies/ComplianceDisclaimer";
import DataQualityBadge from "@/components/companies/DataQualityBadge";
import TransparencyPanel from "@/components/companies/TransparencyPanel";
import ClaimCompanyModal from "@/components/companies/ClaimCompanyModal";
import ReportCompanyModal from "@/components/companies/ReportCompanyModal";

function parseJson(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
}

function TextSection({ icon: Icon, title, text }) {
  if (!text) return null;
  return (
    <CompanySection icon={Icon} title={title}>
      <p className="text-sm text-white/70 leading-relaxed">{text}</p>
    </CompanySection>
  );
}

function SectionLabel({ type }) {
  if (type === "public") {
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">PUBLIC INFO</span>;
  }
  return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">EXECLEAD ANALYSIS</span>;
}

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isPublic = useLocation().pathname.startsWith("/company-library");
  const { profile, refreshProfile } = useSubscription();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const loadCompany = useCallback(async () => {
    try { setCompany(await base44.entities.Company.get(id)); } catch (e) {}
    setLoading(false);
  }, [id]);

  useEffect(() => { loadCompany(); }, [loadCompany]);

  const setTargetCompany = async () => {
    if (!profile?.id || !company) return;
    try {
      await base44.entities.UserProfile.update(profile.id, { target_company: company.name });
      await refreshProfile();
      toast({ title: "Target company set", description: `${company.name} is now your target — AI modules will personalize to its culture.` });
    } catch (e) {
      toast({ title: "Could not set target company", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
  if (!company) return <div className="text-center py-20 text-white/40">Company not found.</div>;

  const lp = parseJson(company.learning_paths_json, null);
  const leadershipTeam = parseJson(company.leadership_team_json, null);
  const sourceAttributions = parseJson(company.source_attributions_json, null);
  const isTarget = profile?.target_company === company.name;
  const isClaimed = company.profile_status === "verified" || company.profile_status === "official_partner" || company.profile_status === "strategic_partner";

  const publicStats = [
    { label: "Founded", value: company.founded, icon: CalendarClock },
    { label: "Revenue", value: company.revenue, icon: DollarSign },
    { label: "Market Cap", value: company.market_cap, icon: TrendingUp },
    { label: "Employees", value: company.employee_count ? company.employee_count.toLocaleString() : null, icon: Briefcase },
    { label: "Countries", value: company.countries_count ? company.countries_count.toLocaleString() : null, icon: Globe },
    { label: "Global Rank", value: company.global_ranking, icon: Trophy },
  ].filter(s => s.value);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(isPublic ? "/company-library" : "/companies")} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Library
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10 rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <CompanyAvatar company={company} size="lg" />
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <ProfileStatusBadge status={company.profile_status} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/50">
              {company.industry && <span>{company.industry}</span>}
              {company.headquarters && <span className="flex items-center gap-1"><MapPin size={12} /> {company.headquarters}</span>}
              {company.ceo && <span className="flex items-center gap-1"><Crown size={12} /> {company.ceo}</span>}
              {company.fortune_ranking && <span className="flex items-center gap-1"><Trophy size={12} /> {company.fortune_ranking}</span>}
              {company.stock_symbol && <span className="flex items-center gap-1"><DollarSign size={12} /> {company.stock_symbol}</span>}
            </div>
            {company.official_website && (
              <a href={company.official_website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300">
                <ExternalLink size={11} /> Official Website
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CompanyEnrichButton company={company} onEnriched={loadCompany} />
            <button onClick={setTargetCompany} disabled={isTarget} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isTarget ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-violet-500 hover:bg-violet-600 text-white"}`}>
              {isTarget ? <><Check size={14} /> Target Company</> : <><Target size={14} /> Set as Target</>}
            </button>
          </div>
        </div>

        {publicStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            {publicStats.map(s => (
              <div key={s.label} className="bg-white/[0.03] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-1"><s.icon size={11} /> {s.label}</div>
                <div className="text-white text-sm font-medium">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <DataQualityBadge company={company} className="mt-5" />

        {company.last_updated && (
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-white/30">
            <CalendarClock size={10} /> Last updated: {company.last_updated} · v{company.version_number || 1}
          </div>
        )}
      </div>

      {/* Compliance Disclaimer */}
      <ComplianceDisclaimer variant="full" />

      <TransparencyPanel />

      {/* PUBLIC INFORMATION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-blue-400" />
          <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Public Information</h2>
          <span className="text-[10px] text-white/30">— Compiled from publicly available sources</span>
        </div>

        {company.description && <TextSection icon={Compass} title="Company Overview" text={company.description} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextSection icon={Compass} title="Mission" text={company.mission} />
          <TextSection icon={Eye} title="Vision" text={company.vision} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.major_products?.length > 0 && <CompanySection icon={Package} title="Major Products"><ListBlock items={company.major_products} /></CompanySection>}
          {company.services?.length > 0 && <CompanySection icon={Briefcase} title="Services"><ListBlock items={company.services} /></CompanySection>}
          {company.global_presence && <TextSection icon={Globe} title="Global Presence" text={company.global_presence} />}
          {company.organizational_structure && <TextSection icon={Network} title="Organizational Structure" text={company.organizational_structure} />}
        </div>

        {leadershipTeam?.length > 0 && (
          <CompanySection icon={Users2} title="Leadership Team">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leadershipTeam.map((exec, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0">
                    {exec.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white/80 font-medium truncate">{exec.name}</div>
                    <div className="text-xs text-white/40 truncate">{exec.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </CompanySection>
        )}

        {/* Source Attribution */}
        <div className="flex items-center gap-2 text-[10px] text-white/30 px-1">
          <Info size={10} />
          <span>Sources: {sourceAttributions ? Object.values(sourceAttributions).filter(Boolean).join(", ") : "Company Annual Report, SEC Filing, Corporate Website, Investor Relations, Public Press Release"}</span>
        </div>
      </div>

      {/* EXECLEAD ANALYSIS */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <h2 className="text-sm font-medium text-violet-400 uppercase tracking-wider">EXECLEAD Analysis</h2>
          <span className="text-[10px] text-white/30">— Proprietary executive intelligence by EXECLEAD.AI</span>
        </div>

        {company.core_values?.length > 0 && (
          <CompanySection icon={Heart} title="Core Values">
            <div className="flex flex-wrap gap-2">
              {company.core_values.map((v, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">{v}</span>)}
            </div>
          </CompanySection>
        )}

        {company.leadership_principles?.length > 0 && (
          <CompanySection icon={Crown} title="Leadership Principles"><ListBlock items={company.leadership_principles} /></CompanySection>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextSection icon={Users2} title="Corporate Culture" text={company.corporate_culture} />
          <TextSection icon={Layers} title="Business Model" text={company.business_model} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.technology_stack?.length > 0 && (
            <CompanySection icon={Cpu} title="Technology Stack">
              <div className="flex flex-wrap gap-2">{company.technology_stack.map((t, i) => <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60 border border-white/10">{t}</span>)}</div>
            </CompanySection>
          )}
          {company.competitors?.length > 0 && (
            <CompanySection icon={Swords} title="Competitors">
              <div className="flex flex-wrap gap-2">{company.competitors.map((c, i) => <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60 border border-white/10">{c}</span>)}</div>
            </CompanySection>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextSection icon={Server} title="Technology Landscape" text={company.technology_landscape} />
          <TextSection icon={Crosshair} title="Competitive Position" text={company.competitive_position} />
          <TextSection icon={AlertTriangle} title="Risk Profile" text={company.risk_profile} />
          <TextSection icon={Shield} title="Board Expectations" text={company.board_expectations} />
        </div>

        {company.interview_style && (
          <CompanySection icon={HelpCircle} title="Interview Style & Executive Expectations">
            <p className="text-sm text-white/70 leading-relaxed mb-4">{company.interview_style}</p>
            <ListBlock items={company.executive_expectations} />
          </CompanySection>
        )}

        {company.hiring_practices && <TextSection icon={UserPlus} title="Hiring Practices" text={company.hiring_practices} />}
        {company.executive_resume_insights && <TextSection icon={FileText} title="Executive Resume Insights" text={company.executive_resume_insights} />}
        {company.leadership_competencies?.length > 0 && <CompanySection icon={Crown} title="Leadership Competencies"><ListBlock items={company.leadership_competencies} /></CompanySection>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.transformation_initiatives?.length > 0 && <CompanySection icon={GitBranch} title="Transformation Initiatives"><ListBlock items={company.transformation_initiatives} /></CompanySection>}
          {company.major_acquisitions?.length > 0 && <CompanySection icon={Landmark} title="Major Acquisitions"><ListBlock items={company.major_acquisitions} /></CompanySection>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextSection icon={Brain} title="Digital Transformation" text={company.digital_transformation_strategy} />
          <TextSection icon={Sparkles} title="AI Strategy" text={company.ai_strategy} />
          <TextSection icon={Cloud} title="Cloud Strategy" text={company.cloud_strategy} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextSection icon={Leaf} title="Sustainability Initiatives" text={company.sustainability_initiatives} />
          <TextSection icon={Users2} title="Diversity & Inclusion" text={company.diversity_inclusion} />
        </div>

        {company.strategic_priorities && <TextSection icon={Target} title="Strategic Priorities" text={company.strategic_priorities} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.career_paths?.length > 0 && <CompanySection icon={Briefcase} title="Career Paths"><ListBlock items={company.career_paths} /></CompanySection>}
          {company.learning_recommendations?.length > 0 && <CompanySection icon={GraduationCap} title="Learning Recommendations"><ListBlock items={company.learning_recommendations} /></CompanySection>}
        </div>

        {company.common_interview_questions?.length > 0 && <CompanySection icon={HelpCircle} title="Common Interview Questions"><ListBlock items={company.common_interview_questions} /></CompanySection>}
        {company.executive_case_studies?.length > 0 && <CompanySection icon={BookOpen} title="Executive Case Studies"><ListBlock items={company.executive_case_studies} /></CompanySection>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextSection icon={DollarSign} title="Salary Benchmarks" text={company.salary_benchmarks} />
          {company.benefits?.length > 0 && <CompanySection icon={Heart} title="Benefits"><ListBlock items={company.benefits} /></CompanySection>}
          <TextSection icon={TrendingUp} title="Growth Potential" text={company.growth_potential} />
        </div>

        {company.promotion_expectations && <TextSection icon={Crown} title="Promotion Culture" text={company.promotion_expectations} />}

        {lp && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-violet-400/60 uppercase tracking-wider flex items-center gap-2"><GraduationCap size={14} /> Company Learning Paths</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextSection icon={Target} title="Executive Interview Preparation" text={lp.executive_interview_preparation} />
              <TextSection icon={MessageSquare} title="Communication Style" text={lp.communication_style} />
              <TextSection icon={Sparkles} title="Presentation Style" text={lp.presentation_style} />
              {lp.executive_behaviors?.length > 0 && <CompanySection icon={Crown} title="Executive Behaviors"><ListBlock items={lp.executive_behaviors} /></CompanySection>}
              {lp.recommended_certifications?.length > 0 && <CompanySection icon={Award} title="Recommended Certifications"><ListBlock items={lp.recommended_certifications} /></CompanySection>}
              {lp.recommended_books?.length > 0 && <CompanySection icon={BookOpen} title="Recommended Books"><ListBlock items={lp.recommended_books} /></CompanySection>}
              {lp.recommended_courses?.length > 0 && <CompanySection icon={GraduationCap} title="Recommended Courses"><ListBlock items={lp.recommended_courses} /></CompanySection>}
            </div>
          </div>
        )}
      </div>

      {/* Claim & Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setShowClaim(true)}
          disabled={isClaimed}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            isClaimed
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
              : "bg-white/[0.02] text-white/60 border-white/10 hover:bg-white/5 hover:text-white/80"
          }`}
        >
          <BadgeCheck size={16} />
          {isClaimed ? "Profile Verified" : "Claim Company Profile"}
        </button>
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5 hover:text-white/80 text-sm font-medium transition-colors"
        >
          <Flag size={16} />
          Report / Request Update
        </button>
      </div>

      <div className="text-center">
        <Link to="/request-tracking" className="text-xs text-white/30 hover:text-white/50 transition-colors">
          Track your correction requests →
        </Link>
      </div>

      {showClaim && <ClaimCompanyModal company={company} onClose={() => setShowClaim(false)} />}
      {showReport && <ReportCompanyModal company={company} onClose={() => setShowReport(false)} />}

      {/* Bottom Disclaimer */}
      <ComplianceDisclaimer variant="compact" />
    </div>
  );
}