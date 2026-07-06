import React from "react";
import { TextField, SelectField, SectionCard } from "./FormFields";
import { Camera, Loader2, Mail, Lock } from "lucide-react";
import { COUNTRIES } from "@/lib/payments";

const TIMEZONES = [
  { value: "UTC-8", label: "Pacific Time (UTC-8)" },
  { value: "UTC-7", label: "Mountain Time (UTC-7)" },
  { value: "UTC-6", label: "Central Time (UTC-6)" },
  { value: "UTC-5", label: "Eastern Time (UTC-5)" },
  { value: "UTC+0", label: "GMT (UTC+0)" },
  { value: "UTC+1", label: "Central European (UTC+1)" },
  { value: "UTC+5:30", label: "India (UTC+5:30)" },
  { value: "UTC+8", label: "China/Singapore (UTC+8)" },
  { value: "UTC+9", label: "Japan (UTC+9)" },
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Mandarin", "Japanese", "Hindi", "Arabic"];

export default function PersonalInfoSection({ form, setField, user, onPhotoUpload, uploadingPhoto }) {
  return (
    <SectionCard title="Personal Information" description="Your identity across the platform." icon={Camera}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl font-bold text-indigo-400 overflow-hidden">
            {form.profile_photo ? <img src={form.profile_photo} alt="" className="w-full h-full object-cover" /> : (form.first_name || "U").charAt(0)}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors">
            {uploadingPhoto ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
            <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
          </label>
        </div>
        <div className="text-white/30 text-xs">Click the camera to update your photo.</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="First Name" value={form.first_name} onChange={v => setField("first_name", v)} placeholder="John" />
        <TextField label="Last Name" value={form.last_name} onChange={v => setField("last_name", v)} placeholder="Smith" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Display Name" value={form.display_name} onChange={v => setField("display_name", v)} placeholder="John Smith" />
        <TextField label="Preferred Name" value={form.preferred_name} onChange={v => setField("preferred_name", v)} placeholder="Johnny" />
      </div>
      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Email Address</label>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
          <Mail size={14} className="text-white/30" />
          <span className="text-sm text-white/60 flex-1">{user?.email || "—"}</span>
          <Lock size={12} className="text-white/20" />
        </div>
        <p className="text-white/20 text-xs mt-1">Email changes require verification. Contact support to update.</p>
      </div>
      <TextField label="Mobile Number" value={form.mobile_number} onChange={v => setField("mobile_number", v)} placeholder="+1 (555) 000-0000" type="tel" />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Country" value={form.country} onChange={v => setField("country", v)} options={COUNTRIES.map(c => ({ value: c.name, label: c.name }))} />
        <TextField label="City" value={form.city} onChange={v => setField("city", v)} placeholder="San Francisco" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Time Zone" value={form.timezone} onChange={v => setField("timezone", v)} options={TIMEZONES} />
        <SelectField label="Language" value={form.language} onChange={v => setField("language", v)} options={LANGUAGES} />
      </div>
    </SectionCard>
  );
}