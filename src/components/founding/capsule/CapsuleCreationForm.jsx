import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Upload, X, ArrowRight, ArrowLeft, Check, Loader2, Clock, Globe, ImageIcon, Video, Mic, FileText, Shield } from "lucide-react";

const LOCK_OPTIONS = [
  { value: "1_year", label: "1 Year", desc: "A quick reflection" },
  { value: "3_years", label: "3 Years", desc: "Short-term vision" },
  { value: "5_years", label: "5 Years", desc: "Recommended" },
  { value: "10_years", label: "10 Years", desc: "A decade of growth" },
  { value: "15_years", label: "15 Years", desc: "Mid-career reflection" },
  { value: "20_years", label: "20 Years", desc: "A generation" },
  { value: "custom", label: "Custom Date", desc: "Choose your date" },
];

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", desc: "Only you can see your capsule", icon: "🔒" },
  { value: "friends", label: "Friends Only", desc: "Your connections", icon: "👥" },
  { value: "founders", label: "Founders Only", desc: "Fellow founding members", icon: "🏰" },
  { value: "public", label: "Public", desc: "Displayed on the Founders Wall", icon: "🌍" },
];

function FormField({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-white/80 text-sm font-medium mb-2">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
      />
    </div>
  );
}

function MediaUploader({ label, field, accept, icon: Icon, form, setForm, uploading, onUpload, onRemove }) {
  const url = form[field];
  const isUploading = uploading === field;

  return (
    <div>
      <label className="block text-white/60 text-xs font-medium mb-2">{label}</label>
      {url ? (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <Icon size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-400/80 text-xs truncate flex-1">Uploaded</span>
          <button onClick={() => onRemove(field)} className="text-white/30 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className={`flex items-center gap-2 bg-white/5 border border-dashed border-white/10 rounded-lg px-3 py-3 cursor-pointer hover:border-amber-500/30 transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
          {isUploading ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <Upload size={14} className="text-white/30" />}
          <span className="text-white/30 text-xs">{isUploading ? "Uploading..." : "Click to upload"}</span>
          <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0], field)} />
        </label>
      )}
    </div>
  );
}

export default function CapsuleCreationForm({ founderNumber, existingDraft, onSealed }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(null);
  const [sealing, setSealing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    why_joined: existingDraft?.why_joined || "",
    career_goals_today: existingDraft?.career_goals_today || "",
    hope_5_years: existingDraft?.hope_5_years || "",
    hope_10_years: existingDraft?.hope_10_years || "",
    hope_20_years: existingDraft?.hope_20_years || "",
    advice_future_self: existingDraft?.advice_future_self || "",
    belief_execlead_future: existingDraft?.belief_execlead_future || "",
    leadership_principle: existingDraft?.leadership_principle || "",
    photo_url: existingDraft?.photo_url || "",
    video_url: existingDraft?.video_url || "",
    audio_url: existingDraft?.audio_url || "",
    document_url: existingDraft?.document_url || "",
    lock_period: existingDraft?.lock_period || "5_years",
    custom_unlock_date: existingDraft?.custom_unlock_date || "",
    legacy_visibility: existingDraft?.legacy_visibility || "private",
  });

  const set = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));

  const handleUpload = async (file, field) => {
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum 25MB", variant: "destructive" });
      return;
    }
    setUploading(field);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const file_url = result.file_url;
      set(field)(file_url);
      toast({ title: "Upload complete" });
    } catch (e) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(null);
  };

  const handleRemove = (field) => set(field)("");

  const handleSeal = async () => {
    setShowConfirm(false);
    setSealing(true);
    try {
      const res = await base44.functions.invoke("manageTimeCapsule", { action: "seal", ...form });
      const d = res.data || res;
      if (d.success) {
        onSealed(d.capsule);
      } else {
        toast({ title: d.error || "Failed to seal capsule", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Failed to seal capsule", variant: "destructive" });
    }
    setSealing(false);
  };

  const steps = [
    { title: "Welcome", icon: Shield },
    { title: "Your Story", icon: Clock },
    { title: "Future Vision", icon: Globe },
    { title: "Media", icon: ImageIcon },
    { title: "Lock & Legacy", icon: Lock },
    { title: "Review & Seal", icon: Check },
  ];

  const canProceed = () => {
    if (step === 1) return form.why_joined.trim().length > 0;
    if (step === 4 && form.lock_period === "custom") return form.custom_unlock_date.length > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${i === step ? "bg-amber-500 text-white" : i < step ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/20"}`}>
                {i < step ? <Check size={16} /> : <s.icon size={16} />}
              </div>
              <span className={`text-[10px] ${i === step ? "text-amber-400" : "text-white/20"}`}>{s.title}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? "bg-amber-500/30" : "bg-white/5"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Lock size={28} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Create Your Founder Time Capsule</h2>
                <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed mb-6">
                  Leave a message for your future self and future generations of EXECLEAD.AI founders. Your capsule becomes part of EXECLEAD.AI history — sealed today, opened on your chosen date.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                    <Clock size={16} className="text-amber-400 mx-auto mb-1" />
                    <div className="text-white/40 text-xs">You choose</div>
                    <div className="text-white/70 text-xs font-medium">Unlock Date</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                    <Shield size={16} className="text-amber-400 mx-auto mb-1" />
                    <div className="text-white/40 text-xs">Permanently</div>
                    <div className="text-white/70 text-xs font-medium">Sealed & Signed</div>
                  </div>
                </div>
                {founderNumber && (
                  <div className="mt-4 text-amber-400/60 text-xs">Founder Number: {founderNumber}</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 1: Your Story */}
          {step === 1 && (
            <motion.div key="story" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h2 className="text-xl font-bold mb-1">Your Story</h2>
              <p className="text-white/40 text-sm mb-4">Tell your future self who you are today.</p>
              <FormField label="Why did you join EXECLEAD.AI?" value={form.why_joined} onChange={set("why_joined")} placeholder="What drew you to this platform? What were you hoping to achieve?" required />
              <FormField label="What are your career goals today?" value={form.career_goals_today} onChange={set("career_goals_today")} placeholder="Where are you in your career? What are you working toward?" />
              <FormField label="What leadership principle defines you today?" value={form.leadership_principle} onChange={set("leadership_principle")} placeholder="e.g., Lead with empathy, Decisive action, Servant leadership..." />
            </motion.div>
          )}

          {/* Step 2: Future Vision */}
          {step === 2 && (
            <motion.div key="future" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h2 className="text-xl font-bold mb-1">Future Vision</h2>
              <p className="text-white/40 text-sm mb-4">Imagine your future and leave wisdom for yourself.</p>
              <FormField label="Where do you hope to be in 5 years?" value={form.hope_5_years} onChange={set("hope_5_years")} placeholder="Your 5-year vision..." />
              <FormField label="Where do you hope to be in 10 years?" value={form.hope_10_years} onChange={set("hope_10_years")} placeholder="Your 10-year vision..." />
              <FormField label="Where do you hope to be in 20 years?" value={form.hope_20_years} onChange={set("hope_20_years")} placeholder="Your 20-year vision..." />
              <FormField label="What advice would you give your future self?" value={form.advice_future_self} onChange={set("advice_future_self")} placeholder="Words of wisdom from the present you..." />
              <FormField label="What do you believe EXECLEAD.AI will become?" value={form.belief_execlead_future} onChange={set("belief_execlead_future")} placeholder="Your vision for this platform..." />
            </motion.div>
          )}

          {/* Step 3: Media */}
          {step === 3 && (
            <motion.div key="media" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h2 className="text-xl font-bold mb-1">Media <span className="text-white/30 text-sm font-normal">(Optional)</span></h2>
              <p className="text-white/40 text-sm mb-4">Attach photos, videos, audio, or documents to enrich your capsule.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MediaUploader label="Photo" field="photo_url" accept="image/*" icon={ImageIcon} form={form} setForm={setForm} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
                <MediaUploader label="Video" field="video_url" accept="video/*" icon={Video} form={form} setForm={setForm} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
                <MediaUploader label="Audio Message" field="audio_url" accept="audio/*" icon={Mic} form={form} setForm={setForm} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
                <MediaUploader label="Document (PDF)" field="document_url" accept=".pdf" icon={FileText} form={form} setForm={setForm} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
              </div>
            </motion.div>
          )}

          {/* Step 4: Lock & Legacy */}
          {step === 4 && (
            <motion.div key="lock" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Choose Your Lock Period</h2>
                <p className="text-white/40 text-sm mb-4">When should your capsule unlock?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LOCK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("lock_period")(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all ${form.lock_period === opt.value ? "bg-amber-500/10 border-amber-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                    >
                      <div className={`text-sm font-medium ${form.lock_period === opt.value ? "text-amber-400" : "text-white/70"}`}>{opt.label}</div>
                      <div className="text-white/30 text-xs mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {form.lock_period === "custom" && (
                  <div className="mt-3">
                    <input
                      type="date"
                      value={form.custom_unlock_date ? form.custom_unlock_date.split("T")[0] : ""}
                      onChange={(e) => set("custom_unlock_date")(e.target.value ? new Date(e.target.value).toISOString() : "")}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Legacy Visibility</h3>
                <p className="text-white/40 text-sm mb-4">Who can see your published capsule story?</p>
                <div className="space-y-2">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => set("legacy_visibility")(opt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${form.legacy_visibility === opt.value ? "bg-amber-500/10 border-amber-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <div className="text-left flex-1">
                        <div className={`text-sm font-medium ${form.legacy_visibility === opt.value ? "text-amber-400" : "text-white/70"}`}>{opt.label}</div>
                        <div className="text-white/30 text-xs">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review & Seal */}
          {step === 5 && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold mb-1">Review & Seal</h2>
              <p className="text-white/40 text-sm mb-4">Review your capsule before sealing. Once sealed, it cannot be edited.</p>

              <div className="space-y-3">
                {form.why_joined && <ReviewItem label="Why I joined" value={form.why_joined} />}
                {form.career_goals_today && <ReviewItem label="Career goals" value={form.career_goals_today} />}
                {form.leadership_principle && <ReviewItem label="Leadership principle" value={form.leadership_principle} />}
                {form.hope_5_years && <ReviewItem label="5-year hope" value={form.hope_5_years} />}
                {form.hope_10_years && <ReviewItem label="10-year hope" value={form.hope_10_years} />}
                {form.hope_20_years && <ReviewItem label="20-year hope" value={form.hope_20_years} />}
                {form.advice_future_self && <ReviewItem label="Advice to future self" value={form.advice_future_self} />}
                {form.belief_execlead_future && <ReviewItem label="Belief about EXECLEAD.AI" value={form.belief_execlead_future} />}
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-start gap-3">
                <Lock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-white/50 leading-relaxed">
                  <span className="text-amber-400 font-medium">Lock Period:</span> {LOCK_OPTIONS.find(o => o.value === form.lock_period)?.label}
                  {form.lock_period === "custom" && form.custom_unlock_date && ` (${new Date(form.custom_unlock_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})`}
                  <br />
                  <span className="text-amber-400 font-medium">Visibility:</span> {VISIBILITY_OPTIONS.find(v => v.value === form.legacy_visibility)?.label}
                  {(form.photo_url || form.video_url || form.audio_url || form.document_url) && (
                    <><br /><span className="text-amber-400 font-medium">Media:</span> {[form.photo_url && "Photo", form.video_url && "Video", form.audio_url && "Audio", form.document_url && "Document"].filter(Boolean).join(", ")}</>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={sealing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium py-3.5 rounded-xl transition-colors"
              >
                {sealing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {sealing ? "Sealing..." : "Seal Time Capsule"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className={`flex items-center gap-1.5 text-sm ${step === 0 ? "text-white/10" : "text-white/40 hover:text-white/70"}`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all ${canProceed() ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20" : "text-white/20"}`}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Seal Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#0d0d14] border border-amber-500/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock size={20} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-center mb-2">Seal Your Time Capsule?</h3>
              <p className="text-white/40 text-sm text-center leading-relaxed mb-6">
                Once sealed, your capsule cannot be edited, viewed, or deleted without confirmation. It will remain locked until your chosen unlock date.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/70 bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSeal} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 transition-colors">
                  Seal Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-amber-400/60 text-xs font-medium mb-1">{label}</div>
      <div className="text-white/60 text-sm line-clamp-2">{value}</div>
    </div>
  );
}