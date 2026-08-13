import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import WelcomeOrientation from "@/components/onboarding/WelcomeOrientation";
import QuickReadinessBaseline from "@/components/onboarding/QuickReadinessBaseline";
import EnterpriseLaunch from "@/components/onboarding/EnterpriseLaunch";
import CalibrationCompleteScreen from "@/components/onboarding/CalibrationCompleteScreen";
import { completeOnboarding, detectOnboardingType, getOnboardingState, initializeReadinessState, prepareEnterpriseAssessment, saveOnboardingDraft, saveOnboardingProgress } from "@/lib/onboarding/onboardingOrchestrator";

export default function Onboarding() {
  const { user } = useAuth();
  const saved = getOnboardingState(user);
  const type = detectOnboardingType(user);
  const [step, setStep] = useState(type === "enterprise_assigned" ? 1 : saved.step || 1);
  const [baseline, setBaseline] = useState(saved.baseline || {});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (user?.id) initializeReadinessState(user).catch(() => setError("We couldn't initialize your setup. Please try again.")); }, [user?.id]);
  useEffect(() => { if (user?.id) saveOnboardingDraft(user, { step, baseline }); }, [baseline, step, user]);

  const go = async (next) => { setStep(next); await saveOnboardingProgress(user, next, baseline); };
  const later = async () => { await initializeReadinessState(user); await saveOnboardingProgress(user, step, baseline); window.location.href = "/dashboard"; };
  const complete = async () => { setSaving(true); setError(""); try { const data = await completeOnboarding(user, baseline); setResult(data); setStep(3); } catch { setError("Your progress is saved, but calibration could not finish. Please try again."); } finally { setSaving(false); } };
  const launchEnterprise = async () => { const track = await prepareEnterpriseAssessment(user); window.location.href = `/assessment?track=${encodeURIComponent(track)}&assigned=1`; };

  if (step === 3) return <CalibrationCompleteScreen readinessLevel={result?.readinessLevel} initialXp={result?.initialXp ?? result?.xp} firstMission={result?.firstMission} roadmapReady={result?.roadmapReady ?? true} onComplete={() => { window.location.href = "/dashboard"; }} />;

  return (<OnboardingShell step={type === "enterprise_assigned" ? 1 : step}>{error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{type === "enterprise_assigned" ? <EnterpriseLaunch user={user} onLaunch={launchEnterprise} /> : step === 1 ? <WelcomeOrientation onContinue={() => go(2)} onSkip={later} /> : <QuickReadinessBaseline baseline={baseline} onChange={setBaseline} onComplete={complete} onLater={later} saving={saving} />}</OnboardingShell>);
}