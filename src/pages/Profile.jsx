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
import ProfileCompleteness from "@/components/profile/ProfileCompleteness";
import ResumeSyncModal from "@/components/profile/ResumeSyncModal";
import { extractResumeIdentity, saveResumeVersion } from "@/lib/resumeSync";
import DataManagementSection from "@/components/profile/DataManagementSection";
import { createSnapshot, averageConfidence } from "@/lib/identityVersioning";
import { Loader2, Save, UserCircle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useSubscription();
  const [form, setForm] = useState(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [syncFileName, setSyncFileName] = useState("");
  const [syncFileUrl, setSyncFileUrl] = useState("");

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
        languages: safeParse(profile.languages_json, []),
        projects: safeParse(profile.projects_json, []),
        awards: safeParse(profile.awards_json, []),
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
      toast({ title: "Resume Uploaded", description: "Extracting data to populate your identity..." });

      const extracted = await extractResumeIdentity(file_url);
      if (extracted) {
        await saveResumeVersion(file_url, file.name, extracted);
        setSyncData(extracted);
        setSyncFileName(file.name);
        setSyncFileUrl(file_url);
      } else {
        toast({ title: "Extraction Failed", description: "Could not parse resume data.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Upload Failed", description: "Could not upload resume.", variant: "destructive" });
    }
    setUploadingResume(false);
  };

  const handleSyncApply = async (syncedForm) => {
    setSaving(true);
    setSyncData(null);
    try {
      const hasExisting = form?.experience?.length > 0 || form?.education?.length > 0 || form?.skills?.length > 0 || !!form?.professional_headline;
      if (hasExisting) {
        try {
          await createSnapshot(form, {
            source_resume_url: syncFileUrl,
            source_resume_name: syncFileName,
            confidence_score: averageConfidence(syncData?._confidence),
            import_source: "resume_parser",
            imported_by: "Resume Parser",
            change_summary: "Snapshot before resume import",
          });
        } catch (snapErr) { /* non-blocking */ }
      }
      setForm(syncedForm);
      await persistForm(syncedForm);
      toast({ title: "Identity Updated", description: "Your Executive Identity has been populated. A version snapshot was saved for recovery." });
    } catch (e) {
      toast({ title: "Save Failed", description: "Could not persist identity.", variant: "destructive" });
    }
    setSaving(false);
  };

  const persistForm = async (formData) => {
    if (!profile) return;
    const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(" ") || formData.full_name;
    await base44.entities.UserProfile.update(profile.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      full_name: fullName,
      display_name: formData.display_name,
      preferred_name: formData.preferred_name,
      mobile_number: formData.mobile_number,
      country: formData.country,
      city: formData.city,
      timezone: formData.timezone,
      language: formData.language,
      professional_headline: formData.professional_headline,
      bio: formData.bio,
      current_company: formData.current_company,
      current_role: formData.current_role,
      industry: formData.industry,
      years_experience: formData.years_experience ? Number(formData.years_experience) : null,
      target_company: formData.target_company,
      target_role: formData.target_role,
      target_country: formData.target_country,
      expected_salary: formData.expected_salary ? Number(formData.expected_salary) : null,
      preferred_industry: formData.preferred_industry,
      work_preference: formData.work_preference,
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url,
      portfolio_url: formData.portfolio_url,
      website_url: formData.website_url,
      privacy_profile: formData.privacy_profile,
      hide_salary: formData.hide_salary,
      hide_resume: formData.hide_resume,
      hide_email: formData.hide_email,
      skills: formData.skills,
      experience_json: JSON.stringify(formData.experience),
      education_json: JSON.stringify(formData.education),
      certifications_json: JSON.stringify(formData.certifications),
      languages_json: JSON.stringify(formData.languages || []),
      projects_json: JSON.stringify(formData.projects || []),
      awards_json: JSON.stringify(formData.awards || []),
    });
    await refreshProfile();
  };

  const handleSave = async () => {
    if (!form || !profile) return;
    setSaving(true);
    try {
      await persistForm(form);
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
    } catch (e) {
      toast({ title: "Save Failed", description: "Could not save your changes.", variant: "destructive" });
    }
    setSaving(false);
  };

  const applyFormChange = async (newForm, message) => {
    setForm(newForm);
    setSaving(true);
    try {
      await persistForm(newForm);
      toast({ title: "Success", description: message });
    } catch (e) {
      toast({ title: "Action Failed", description: "Could not save changes.", variant: "destructive" });
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
    data: <DataManagementSection form={form} profile={profile} onApplyForm={applyFormChange} onResumeFile={(file) => handleResumeUpload({ target: { files: [file] } })} />,
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
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <ProfileSidebar active={activeSection} onSelect={setActiveSection} />
          <ProfileCompleteness form={form} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="lg:hidden mb-4">
            <ProfileCompleteness form={form} />
          </div>
          {sections[activeSection]}
        </div>
      </div>

      {syncData && (
        <ResumeSyncModal
          extractedForm={syncData}
          currentForm={form}
          fileName={syncFileName}
          onApply={handleSyncApply}
          onClose={() => setSyncData(null)}
        />
      )}
    </div>
  );
}