import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import { safeParse } from "@/components/profile/FormFields";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import ExecutiveProfileSection from "@/components/profile/ExecutiveProfileSection";
import TargetCareerSection from "@/components/profile/TargetCareerSection";
import ResumeSection from "@/components/profile/ResumeSection";
import SocialLinksSection from "@/components/profile/SocialLinksSection";
import CertificationsSection from "@/components/profile/CertificationsSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import PrivacySection from "@/components/profile/PrivacySection";
import AccountSection from "@/components/profile/AccountSection";
import { Loader2, Save, UserCircle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useSubscription();
  const [form, setForm] = useState(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        display_name: profile.display_name || "",
        preferred_name: profile.preferred_name || "",
        mobile_number: profile.mobile_number || "",
        city: profile.city || "",
        timezone: profile.timezone || "",
        language: profile.language || "",
        professional_headline: profile.professional_headline || "",
        target_country: profile.target_country || "",
        expected_salary: profile.expected_salary ?? null,
        preferred_industry: profile.preferred_industry || "",
        work_preference: profile.work_preference || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
        website_url: profile.website_url || "",
        privacy_profile: profile.privacy_profile || "private",
        hide_salary: profile.hide_salary || false,
        hide_resume: profile.hide_resume || false,
        hide_email: profile.hide_email || false,
        experience: safeParse(profile.experience_json, []),
        education: safeParse(profile.education_json, []),
        certifications: safeParse(profile.certifications_json, []),
        skills: profile.skills || [],
      });
    }
  }, [profile?.id]);

  const setField = (field, value) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { profile_photo: file_url });
      setForm(prev => prev ? { ...prev, profile_photo: file_url } : prev);
      await refreshProfile();
      toast({ title: "Photo Updated", description: "Your profile photo has been updated." });
    } catch (e) {
      toast({ title: "Upload Failed", description: "Could not upload photo.", variant: "destructive" });
    }
    setUploadingPhoto(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    setUploadingResume(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { resume_url: file_url });
      setForm(prev => prev ? { ...prev, resume_url: file_url } : prev);
      await refreshProfile();
      toast({ title: "Resume Uploaded", description: "Your resume has been updated." });
    } catch (e) {
      toast({ title: "Upload Failed", description: "Could not upload resume.", variant: "destructive" });
    }
    setUploadingResume(false);
  };

  const handleSave = async () => {
    if (!form || !profile) return;
    setSaving(true);
    try {
      const fullName = [form.first_name, form.last_name].filter(Boolean).join(" ") || form.full_name;
      await base44.entities.UserProfile.update(profile.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: fullName,
        display_name: form.display_name,
        preferred_name: form.preferred_name,
        mobile_number: form.mobile_number,
        country: form.country,
        city: form.city,
        timezone: form.timezone,
        language: form.language,
        professional_headline: form.professional_headline,
        bio: form.bio,
        current_company: form.current_company,
        current_role: form.current_role,
        industry: form.industry,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        target_company: form.target_company,
        target_role: form.target_role,
        target_country: form.target_country,
        expected_salary: form.expected_salary ? Number(form.expected_salary) : null,
        preferred_industry: form.preferred_industry,
        work_preference: form.work_preference,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        portfolio_url: form.portfolio_url,
        website_url: form.website_url,
        privacy_profile: form.privacy_profile,
        hide_salary: form.hide_salary,
        hide_resume: form.hide_resume,
        hide_email: form.hide_email,
        skills: form.skills,
        experience_json: JSON.stringify(form.experience),
        education_json: JSON.stringify(form.education),
        certifications_json: JSON.stringify(form.certifications),
      });
      await refreshProfile();
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
    } catch (e) {
      toast({ title: "Save Failed", description: "Could not save your changes.", variant: "destructive" });
    }
    setSaving(false);
  };

  if (!form || !profile) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  const displayName = form.display_name || form.full_name || "Executive";
  const headline = form.professional_headline || form.current_role || "";

  const sections = {
    personal: <PersonalInfoSection form={form} setField={setField} user={user} onPhotoUpload={handlePhotoUpload} uploadingPhoto={uploadingPhoto} />,
    executive: <ExecutiveProfileSection form={form} setField={setField} />,
    target: <TargetCareerSection form={form} setField={setField} />,
    resume: <ResumeSection resumeUrl={form.resume_url} onResumeUpload={handleResumeUpload} uploadingResume={uploadingResume} />,
    social: <SocialLinksSection form={form} setField={setField} />,
    certifications: <CertificationsSection items={form.certifications} onChange={arr => setField("certifications", arr)} />,
    skills: <SkillsSection skills={form.skills} onChange={arr => setField("skills", arr)} />,
    experience: <ExperienceSection items={form.experience} onChange={arr => setField("experience", arr)} />,
    education: <EducationSection items={form.education} onChange={arr => setField("education", arr)} />,
    privacy: <PrivacySection form={form} setField={setField} />,
    account: <AccountSection user={user} />,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-lg font-bold text-indigo-400 overflow-hidden">
            {form.profile_photo ? <img src={form.profile_photo} alt="" className="w-full h-full object-cover" /> : displayName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-0.5">
              <UserCircle size={12} className="text-indigo-400" /> Executive Identity Center
            </div>
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            {headline && <p className="text-white/40 text-sm">{headline}</p>}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="flex gap-8">
        <ProfileSidebar active={activeSection} onSelect={setActiveSection} />
        <div className="flex-1 min-w-0">
          {sections[activeSection]}
        </div>
      </div>
    </div>
  );
}