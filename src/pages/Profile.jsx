import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import CompetenciesSection from "@/components/competencies/CompetenciesSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import PrivacySection from "@/components/profile/PrivacySection";
import AccountSection from "@/components/profile/AccountSection";
import ProfileCompleteness from "@/components/profile/ProfileCompleteness";
import ResumeSyncModal from "@/components/profile/ResumeSyncModal";
import { extractResumeIdentity, saveResumeVersion, PARSER_VERSION } from "@/lib/resumeSync";
import DataManagementSection from "@/components/profile/DataManagementSection";
import MembershipSection from "@/components/profile/MembershipSection";
import PublicProfileSection from "@/components/profile/PublicProfileSection";
import { createSnapshot, averageConfidence } from "@/lib/identityVersioning";
import { setCachedCareerIntelligenceForm } from "@/lib/careerIntelligence/contextCache";
import { Loader2, Save, UserCircle, Globe, Lock } from "lucide-react";
import ExecutiveMark from "@/components/layout/ExecutiveMark";

export default function Profile() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useSubscription();
  const [form, setForm] = useState(null);
  const [activeSection, setActiveSectionState] = useState(() => {
    // Restore the section the user was last editing — never default back to
    // Personal Information after a save-induced data reload / remount.
    try { return sessionStorage.getItem("profile_active_section") || "personal"; } catch { return "personal"; }
  });
  const setActiveSection = useCallback((section) => {
    setActiveSectionState(section);
    try { sessionStorage.setItem("profile_active_section", section); } catch {}
  }, []);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [syncFileName, setSyncFileName] = useState("");
  const [syncFileUrl, setSyncFileUrl] = useState("");
  // Snapshot of the last persisted form — used for dirty tracking and Cancel/Reset.
  const savedFormRef = useRef(null);

  const buildFormFromProfile = useCallback((p) => ({
    ...p,
    first_name: p.first_name || "",
    last_name: p.last_name || "",
    display_name: p.display_name || "",
    preferred_name: p.preferred_name || "",
    mobile_number: p.mobile_number || "",
    country: p.country || "",
    city: p.city || "",
    timezone: p.timezone || "",
    language: p.language || "",
    professional_headline: p.professional_headline || "",
    target_country: p.target_country || "",
    expected_salary: p.expected_salary ?? null,
    preferred_industry: p.preferred_industry || "",
    work_preference: safeParse(p.work_preference, p.work_preference || ""),
    salary_currency: p.salary_currency || "USD",
    github_url: p.github_url || "",
    portfolio_url: p.portfolio_url || "",
    website_url: p.website_url || "",
    privacy_profile: p.privacy_profile || "private",
    hide_salary: p.hide_salary || false,
    hide_resume: p.hide_resume || false,
    hide_email: p.hide_email || false,
    public_username: p.public_username || "",
    public_profile_enabled: p.public_profile_enabled || false,
    public_visibility: p.public_visibility || "private",
    public_content_json: p.public_content_json || "",
    public_hide_email: p.public_hide_email ?? true,
    public_hide_phone: p.public_hide_phone ?? true,
    public_hide_address: p.public_hide_address ?? true,
    public_hide_salary: p.public_hide_salary ?? true,
    public_hide_notes: p.public_hide_notes ?? true,
    allow_search_indexing: p.allow_search_indexing || false,
    experience: safeParse(p.experience_json, []),
    education: safeParse(p.education_json, []),
    certifications: safeParse(p.certifications_json, []),
    skills: p.skills || [],
    languages: safeParse(p.languages_json, []),
    projects: safeParse(p.projects_json, []),
    awards: safeParse(p.awards_json, []),
  }), []);

  // Only initialize form once (on first load). Never re-run on background refreshProfile()
  // calls — that would reset activeSection and scroll position mid-edit.
  useEffect(() => {
    if (profile && !form) {
      const built = buildFormFromProfile(profile);
      setForm(built);
      savedFormRef.current = built;
    }
  }, [profile?.id, form, buildFormFromProfile]);

  // Dirty tracking — compares working form against last persisted snapshot.
  const isDirty = useMemo(() => {
    if (!form || !savedFormRef.current) return false;
    return JSON.stringify(form) !== JSON.stringify(savedFormRef.current);
  }, [form]);

  // Sync Career Intelligence™ cache so all EXEC™ AI modules (Coach, Simulator,
  // Debate, Resume, Academy, Council) receive role/industry/country/salary
  // personalization automatically via callAI.
  useEffect(() => {
    if (!form) return;
    setCachedCareerIntelligenceForm({
      target_company: form.target_company,
      target_role: form.target_role,
      preferred_industry: form.preferred_industry,
      target_country: form.target_country,
      expected_salary: form.expected_salary,
      salary_currency: form.salary_currency,
      work_preference: form.work_preference,
    });
  }, [form?.target_company, form?.target_role, form?.preferred_industry, form?.target_country, form?.expected_salary, form?.salary_currency, form?.work_preference]);

  // Warn before navigating away / closing tab when there are unsaved edits.
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const setField = (field, value) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
  };

  // Explicit save only — no auto-save, no debounce on Work Experience.
  const handleExperienceChange = useCallback((arr) => {
    setForm(prev => prev ? { ...prev, experience: arr } : prev);
  }, []);



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
      savedFormRef.current = syncedForm;
      toast({ title: "Identity Updated", description: "Your Executive Identity has been populated. A version snapshot was saved for recovery." });
    } catch (e) {
      toast({ title: "Save Failed", description: "Could not persist identity.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleCreateVersion = async (versionForm) => {
    const fileName = syncFileName;
    const fileUrl = syncFileUrl;
    const confidence = averageConfidence(syncData?._confidence);
    setSyncData(null);
    setSaving(true);
    try {
      await createSnapshot(versionForm, {
        label: `Resume Import — ${fileName}`,
        source_resume_url: fileUrl,
        source_resume_name: fileName,
        confidence_score: confidence,
        import_source: "resume_parser",
        parser_version: PARSER_VERSION,
        imported_by: "Resume Parser",
        change_summary: `New version created from resume import: ${fileName}`,
      });
      toast({ title: "Version Created", description: "A new Executive Identity version has been saved. Your current profile is unchanged — restore it anytime from Version History." });
    } catch (e) {
      toast({ title: "Version Failed", description: "Could not create the version.", variant: "destructive" });
    }
    setSaving(false);
  };

  const persistForm = async (formData) => {
    if (!profile) return;
    const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(" ") || formData.full_name;
    const payload = {
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
      work_preference: Array.isArray(formData.work_preference) ? JSON.stringify(formData.work_preference) : formData.work_preference,
      salary_currency: formData.salary_currency || "USD",
      career_intelligence_json: JSON.stringify({
        target_company: formData.target_company,
        target_role: formData.target_role,
        preferred_industry: formData.preferred_industry,
        target_country: formData.target_country,
        expected_salary: formData.expected_salary,
        salary_currency: formData.salary_currency || "USD",
        work_preference: formData.work_preference,
      }),
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url,
      portfolio_url: formData.portfolio_url,
      website_url: formData.website_url,
      privacy_profile: formData.privacy_profile,
      hide_salary: formData.hide_salary,
      hide_resume: formData.hide_resume,
      hide_email: formData.hide_email,
      public_username: formData.public_username,
      public_profile_enabled: formData.public_profile_enabled,
      public_visibility: formData.public_visibility,
      public_content_json: formData.public_content_json,
      public_hide_email: formData.public_hide_email,
      public_hide_phone: formData.public_hide_phone,
      public_hide_address: formData.public_hide_address,
      public_hide_salary: formData.public_hide_salary,
      public_hide_notes: formData.public_hide_notes,
      allow_search_indexing: formData.allow_search_indexing,
      skills: formData.skills,
      experience_json: JSON.stringify(formData.experience),
      education_json: JSON.stringify(formData.education),
      certifications_json: JSON.stringify(formData.certifications),
      languages_json: JSON.stringify(formData.languages || []),
      projects_json: JSON.stringify(formData.projects || []),
      awards_json: JSON.stringify(formData.awards || []),
    };

    const t0 = performance.now();
    console.info("[Profile] persistForm — write", {
      userId: user?.id,
      profileId: profile.id,
      fieldCount: Object.keys(payload).length,
    });

    await base44.entities.UserProfile.update(profile.id, payload);

    // ── Read-back verification: confirm DB actually persisted the data ──
    const readBack = await base44.entities.UserProfile.get(profile.id);
    const writeMs = Math.round(performance.now() - t0);
    console.info("[Profile] persistForm — read-back", {
      userId: user?.id,
      profileId: profile.id,
      loadedProfileId: readBack?.id,
      loadedUserId: readBack?.created_by_id,
      writeMs,
    });

    // Verify critical Personal Information fields round-tripped correctly
    const verifyFields = [
      "first_name", "last_name", "display_name", "preferred_name",
      "mobile_number", "country", "city", "timezone", "language",
    ];
    const mismatches = verifyFields.filter(
      (f) => String(readBack?.[f] ?? "") !== String(payload[f] ?? "")
    );

    if (mismatches.length > 0) {
      console.error("[Profile] persistForm — VERIFICATION FAILED", {
        userId: user?.id,
        profileId: profile.id,
        mismatches: mismatches.map((f) => ({
          field: f,
          sent: payload[f],
          readBack: readBack?.[f],
        })),
        writeMs,
      });
      throw new Error(
        `Database verification failed. The following fields did not persist correctly: ${mismatches.join(", ")}`
      );
    }

    console.info("[Profile] persistForm — verified OK", { userId: user?.id, profileId: profile.id, writeMs });
    await refreshProfile();
  };

  const handleSave = async () => {
    if (!form || !profile) return;
    setSaving(true);
    const t0 = performance.now();
    try {
      await persistForm(form);
      savedFormRef.current = form;
      console.info("[Profile] handleSave — success", {
        userId: user?.id,
        profileId: profile.id,
        totalMs: Math.round(performance.now() - t0),
      });
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
    } catch (e) {
      console.error("[Profile] handleSave — FAILED", {
        userId: user?.id,
        profileId: profile.id,
        error: e?.message,
        totalMs: Math.round(performance.now() - t0),
      });
      const reason = e?.message || "An unexpected error occurred.";
      toast({
        title: "Unable to save Personal Information",
        description: `${reason} Please try again.`,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  // Restore the last persisted values — discard unsaved edits without navigating.
  const handleCancel = () => {
    if (savedFormRef.current) {
      setForm(savedFormRef.current);
    }
  };

  const applyFormChange = async (newForm, message) => {
    setForm(newForm);
    setSaving(true);
    try {
      await persistForm(newForm);
      savedFormRef.current = newForm;
      toast({ title: "Success", description: message });
    } catch (e) {
      toast({ title: "Action Failed", description: "Could not save changes.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handlePublish = async (published) => {
    if (!profile) return;
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { public_profile_enabled: published });
      setField("public_profile_enabled", published);
      await refreshProfile();
      toast({ title: published ? "Profile Published" : "Profile Unpublished", description: published ? "Your executive profile is now live." : "Your profile is now private." });
    } catch (e) {
      toast({ title: "Action Failed", description: "Could not update profile status.", variant: "destructive" });
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
    skills: <CompetenciesSection userId={user?.id} targetRole={form.target_role} onSkillsChange={arr => setField("skills", arr)} />,
    experience: <ExperienceSection items={form.experience} onChange={handleExperienceChange} />,
    education: <EducationSection items={form.education} onChange={arr => setField("education", arr)} />,
    privacy: <PrivacySection form={form} setField={setField} />,
    public: <PublicProfileSection form={form} setField={setField} profile={profile} onPublish={handlePublish} />,
    data: <DataManagementSection form={form} profile={profile} onApplyForm={applyFormChange} onResumeFile={(file) => handleResumeUpload({ target: { files: [file] } })} />,
    account: <AccountSection user={user} />,
    memberships: <MembershipSection userId={user?.id} />,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
            {form.profile_photo ? <img src={form.profile_photo} alt="" className="w-full h-full rounded-full object-cover" /> : <ExecutiveMark size={48} className="rounded-xl" />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-0.5">
              <UserCircle size={12} className="text-indigo-400" /> Executive Identity Center
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{displayName}</h1>
              {form.public_profile_enabled ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe size={9} /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/10">
                  <Lock size={9} /> Private
                </span>
              )}
            </div>
            {headline && <p className="text-white/40 text-sm">{headline}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved Changes
            </span>
          )}
          {isDirty && (
            <button onClick={handleCancel} disabled={saving} className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-40">
              Cancel
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !isDirty} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 flex flex-col gap-4">
            <ProfileSidebar active={activeSection} onSelect={setActiveSection} />
            <ProfileCompleteness form={form} />
          </div>
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
          onCreateVersion={handleCreateVersion}
          onClose={() => setSyncData(null)}
        />
      )}
    </div>
  );
}