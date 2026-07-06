import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft, MapPin, Users, Crown, Target, Loader2, Check,
  Compass, Eye, Heart, Layers, Cpu, Package, Swords, Trophy, Globe, Network,
  Brain, Cloud, Leaf, Users2, GraduationCap, Briefcase, HelpCircle, BookOpen,
  DollarSign, Sparkles, MessageSquare, Award, TrendingUp
} from "lucide-react";
import CompanySection, { ListBlock } from "@/components/companies/CompanySection";

function parseLearningPaths(json) {
  try { return JSON.parse(json); } catch { return null; }
}

function TextSection({ icon, title, text }) {
  if (!text) return null;
  return (
    <CompanySection icon={icon} title={title}>
      <p className="text-sm text-white/70 leading-relaxed">{text}</p>
    </CompanySection>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useSubscription();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setCompany(await base44.entities.Company.get(id)); } catch (e) {}
      setLoading(false);
    };
    load();
  }, [id]);

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

  const lp = parseLearningPaths(company.learning_paths_json);
  const isTarget = profile?.target_company === company.name;
  const stats = [
    { label: "Size", value: company.company_size, icon: Users },
    { label: "Revenue", value: company.revenue, icon: DollarSign },
    { label: "Employees", value: company.employee_count ? company.employee_count.toLocaleString() : null, icon: Briefcase },
    { label: "Global Rank", value: company.global_ranking, icon: Globe },
  ].filter(s => s.value);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate("/companies")} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Library
      </button>

      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10 rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-xl object-contain bg-white/5 p-2" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-xl">{company.name.slice(0, 2).toUpperCase()}</div>
          )}
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/50">
              {company.industry && <span>{company.industry}</span>}
              {company.headquarters && <span className="flex items-center gap-1"><MapPin size={12} /> {company.headquarters}</span>}
              {company.ceo && <span className="flex items-center gap-1"><Crown size={12} /> {company.ceo}</span>}
              {company.fortune_ranking && <span className="flex items-center gap-1"><Trophy size={12} /> {company.fortune_ranking}</span>}
            </div>
          </div>
          <button onClick={setTargetCompany} disabled={isTarget} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isTarget ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-violet-500 hover:bg-violet-600 text-white"}`}>
            {isTarget ? <><Check size={14} /> Target Company</> : <><Target size={14} /> Set as Target</>}
          </button>
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {stats.map(s => (
              <div key={s.label} className="bg-white/[0.03] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-1"><s.icon size={11} /> {s.label}</div>
                <div className="text-white text-sm font-medium">{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextSection icon={Compass} title="Mission" text={company.mission} />
        <TextSection icon={Eye} title="Vision" text={company.vision} />
      </div>

      {company.core_values?.length > 0 && (
        <CompanySection icon={Heart} title="Core Values">
          <div className="flex flex-wrap gap-2">
            {company.core_values.map((v, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">{v}</span>)}
          </div>
        </CompanySection>
      )}

      {company.leadership_principles?.length > 0 && (
        <CompanySection icon={Crown} title="Leadership Principles">
          <ListBlock items={company.leadership_principles} />
        </CompanySection>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextSection icon={Users2} title="Corporate Culture" text={company.corporate_culture} />
        <TextSection icon={Layers} title="Business Model" text={company.business_model} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {company.major_products?.length > 0 && (
          <CompanySection icon={Package} title="Major Products"><ListBlock items={company.major_products} /></CompanySection>
        )}
        {company.services?.length > 0 && (
          <CompanySection icon={Briefcase} title="Services"><ListBlock items={company.services} /></CompanySection>
        )}
        {company.technology_stack?.length > 0 && (
          <CompanySection icon={Cpu} title="Technology Stack">
            <div className="flex flex-wrap gap-2">
              {company.technology_stack.map((t, i) => <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60 border border-white/10">{t}</span>)}
            </div>
          </CompanySection>
        )}
        {company.competitors?.length > 0 && (
          <CompanySection icon={Swords} title="Competitors">
            <div className="flex flex-wrap gap-2">
              {company.competitors.map((c, i) => <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60 border border-white/10">{c}</span>)}
            </div>
          </CompanySection>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextSection icon={Globe} title="Global Presence" text={company.global_presence} />
        <TextSection icon={Network} title="Organizational Structure" text={company.organizational_structure} />
      </div>

      {company.interview_style && (
        <CompanySection icon={HelpCircle} title="Interview Style & Executive Expectations">
          <p className="text-sm text-white/70 leading-relaxed mb-4">{company.interview_style}</p>
          <ListBlock items={company.executive_expectations} />
        </CompanySection>
      )}

      {company.leadership_competencies?.length > 0 && (
        <CompanySection icon={Crown} title="Leadership Competencies">
          <ListBlock items={company.leadership_competencies} />
        </CompanySection>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextSection icon={Brain} title="Digital Transformation" text={company.digital_transformation_strategy} />
        <TextSection icon={Sparkles} title="AI Strategy" text={company.ai_strategy} />
        <TextSection icon={Cloud} title="Cloud Strategy" text={company.cloud_strategy} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextSection icon={Leaf} title="Sustainability Initiatives" text={company.sustainability_initiatives} />
        <TextSection icon={Users2} title="Diversity & Inclusion" text={company.diversity_inclusion} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {company.career_paths?.length > 0 && (
          <CompanySection icon={Briefcase} title="Career Paths"><ListBlock items={company.career_paths} /></CompanySection>
        )}
        {company.learning_recommendations?.length > 0 && (
          <CompanySection icon={GraduationCap} title="Learning Recommendations"><ListBlock items={company.learning_recommendations} /></CompanySection>
        )}
      </div>

      {company.common_interview_questions?.length > 0 && (
        <CompanySection icon={HelpCircle} title="Common Interview Questions"><ListBlock items={company.common_interview_questions} /></CompanySection>
      )}

      {company.executive_case_studies?.length > 0 && (
        <CompanySection icon={BookOpen} title="Executive Case Studies"><ListBlock items={company.executive_case_studies} /></CompanySection>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextSection icon={DollarSign} title="Salary Benchmarks" text={company.salary_benchmarks} />
        {company.benefits?.length > 0 && (
          <CompanySection icon={Heart} title="Benefits"><ListBlock items={company.benefits} /></CompanySection>
        )}
        <TextSection icon={TrendingUp} title="Growth Potential" text={company.growth_potential} />
      </div>

      {lp && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider flex items-center gap-2"><GraduationCap size={14} /> Company Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextSection icon={Target} title="Executive Interview Preparation" text={lp.executive_interview_preparation} />
            <TextSection icon={MessageSquare} title="Communication Style" text={lp.communication_style} />
            <TextSection icon={Sparkles} title="Presentation Style" text={lp.presentation_style} />
            {lp.executive_behaviors?.length > 0 && (
              <CompanySection icon={Crown} title="Executive Behaviors"><ListBlock items={lp.executive_behaviors} /></CompanySection>
            )}
            {lp.recommended_certifications?.length > 0 && (
              <CompanySection icon={Award} title="Recommended Certifications"><ListBlock items={lp.recommended_certifications} /></CompanySection>
            )}
            {lp.recommended_books?.length > 0 && (
              <CompanySection icon={BookOpen} title="Recommended Books"><ListBlock items={lp.recommended_books} /></CompanySection>
            )}
            {lp.recommended_courses?.length > 0 && (
              <CompanySection icon={GraduationCap} title="Recommended Courses"><ListBlock items={lp.recommended_courses} /></CompanySection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}