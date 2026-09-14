import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  hasPersonalizationConsent,
  getConsentState,
  grantConsent,
  loadConsentState,
} from "@/lib/consentService";

/**
 * AI Personalization Consent Prompt
 * ============================================================
 * A one-time, discoverable UX prompt that appears when an
 * authenticated user attempts to use a personalized AI
 * capability and `ai_personalization` consent is null (unknown).
 *
 * PRIVACY GUARANTEES:
 *   • Never auto-grants consent
 *   • Never infers consent from onboarding / terms / privacy
 *   • Never backfills existing users
 *   • Uses the EXISTING consentService.grantConsent mechanism
 *   • "Not Now" preserves fail-closed behavior (AI still works,
 *     just without personalized executive context)
 *   • Will NOT re-prompt after "Not Now" in the same session
 *   • Will NOT appear if consent is explicitly true (granted)
 *     or explicitly false (withdrawn/denied)
 *   • Fires an event after grant so the in-flight AI interaction
 *     can proceed with personalized context (when technically safe)
 */

// Session flag — prevents re-prompting after "Not Now" in the same tab
let _sessionDeferred = false;

export function isSessionDeferred() {
  return _sessionDeferred;
}

export function clearSessionDeferred() {
  _sessionDeferred = false;
}

// Event dispatched by callAI when a personalized request is blocked
// by missing consent. The prompt listens for this to show itself.
const PROMPT_EVENT = "execlead:ai-personalization-prompt-request";

export function requestAIPersonalizationPrompt() {
  window.dispatchEvent(new CustomEvent(PROMPT_EVENT));
}

export default function AIPersonalizationConsentPrompt() {
  const { isAuthenticated, user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState("");
  const pendingResolveRef = useRef(null);

  // Listen for prompt requests from callAI
  const handlePromptRequest = useCallback(() => {
    if (!isAuthenticated) return;
    // Only prompt if consent is genuinely unknown (null)
    // If already granted (true) or explicitly withdrawn (false), do nothing
    const state = getConsentState("ai_personalization");
    if (state !== null) return;
    if (_sessionDeferred) return;
    setVisible(true);
  }, [isAuthenticated]);

  useEffect(() => {
    window.addEventListener(PROMPT_EVENT, handlePromptRequest);
    return () => window.removeEventListener(PROMPT_EVENT, handlePromptRequest);
  }, [handlePromptRequest]);

  const handleGrant = async () => {
    setGranting(true);
    setError("");
    try {
      const success = await grantConsent("ai_personalization", "AI Personalization consent granted via discoverable prompt");
      if (success) {
        // Reload consent state to update the in-memory cache
        if (user?.email) {
          await loadConsentState(user.email);
        }
        setVisible(false);
        // Notify the pending AI interaction that consent was granted
        // so it can retry with personalized context (if still relevant)
        window.dispatchEvent(new CustomEvent("execlead:ai-personalization-granted"));
      } else {
        setError("We couldn't save your preference. Please try again or visit Privacy Settings.");
      }
    } catch (e) {
      setError("Something went wrong. Please try again or visit Privacy Settings.");
    } finally {
      setGranting(false);
    }
  };

  const handleNotNow = () => {
    _sessionDeferred = true;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md w-full bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">
                Personalize Your AI Experience
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                EXECLEAD.AI Executive Context Engine™
              </p>
            </div>
          </div>
          <button
            onClick={handleNotNow}
            className="text-white/30 hover:text-white/60 transition-colors p-1 -mr-1 -mt-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <p className="text-white/60 text-sm leading-relaxed">
            Enable <span className="text-indigo-400 font-medium">AI Personalization</span> to let EXECLEAD.AI use your executive profile — target role, career stage, leadership DNA, and goals — to tailor AI coaching, simulations, and recommendations to your specific journey.
          </p>
          <p className="text-white/40 text-xs mt-3 leading-relaxed">
            Your data stays private to your account. You can withdraw this consent at any time in Privacy Settings. AI features work without personalization — just with generic guidance.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 pb-2">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 p-5 pt-3">
          <button
            onClick={handleNotNow}
            disabled={granting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Not Now
          </button>
          <button
            onClick={handleGrant}
            disabled={granting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {granting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Grant AI Personalization
              </>
            )}
          </button>
        </div>

        {/* Trust footer */}
        <div className="flex items-center gap-2 px-5 pb-4 pt-1 border-t border-white/5">
          <ShieldCheck size={12} className="text-emerald-400/60" />
          <span className="text-white/30 text-xs">
            RA 10173 compliant · No data shared · Consent managed via Privacy Settings
          </span>
        </div>
      </div>
    </div>
  );
}