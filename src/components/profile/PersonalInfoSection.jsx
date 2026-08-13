import React, { useEffect } from "react";
import { TextField, SelectField, SectionCard } from "./FormFields";
import CountrySelect from "@/components/common/CountrySelect";
import TimezoneSelect from "@/components/common/TimezoneSelect";
import { getCountryByName } from "@/lib/locations";
import { detectBrowserTimezone } from "@/lib/timezones";
import { Camera, Loader2, Mail, Lock } from "lucide-react";
import ExecutiveMark from "@/components/layout/ExecutiveMark";

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Mandarin", "Japanese", "Hindi", "Arabic", "Russian", "Korean", "Italian", "Dutch", "Swedish", "Vietnamese", "Indonesian", "Tagalog"];

export default function PersonalInfoSection({ form, setField, user, onPhotoUpload, uploadingPhoto }) {
  const country = getCountryByName(form.country);
  const dialCode = country?.dialCode;

  // Auto-detect browser timezone on first load if none is set.
  useEffect(() => {
    if (!form.timezone) {
      const detected = detectBrowserTimezone();
      if (detected) setField("timezone", detected);
    }
  }, []);

  const handleCountryChange = (c) => {
    if (c.timezones?.length === 1) {
      setField("timezone", c.timezones[0]);
    } else if (c.timezones?.length > 1 && !c.timezones.includes(form.timezone)) {
      setField("timezone", c.timezones[0]);
    }
    if (c.dialCode && (!form.mobile_number || !form.mobile_number.trim())) {
      setField("mobile_number", c.dialCode + " ");
    }
  };

  return (
    <SectionCard title="Personal Information" description="Your identity across the platform." icon={Camera}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
            {form.profile_photo ? <img src={form.profile_photo} alt="" className="w-full h-full rounded-full object-cover" /> : <ExecutiveMark size={80} className="rounded-2xl" />}
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
      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Mobile Number</label>
        <div className="flex">
          {dialCode && (
            <div className="flex items-center gap-1.5 px-3 bg-white/5 border border-white/10 border-r-0 rounded-l-lg text-sm text-white/50">
              <span className="text-base leading-none">{country.flag}</span>
              <span>{dialCode}</span>
            </div>
          )}
          <input
            value={form.mobile_number || ""}
            onChange={e => setField("mobile_number", e.target.value)}
            placeholder="+1 (555) 000-0000"
            type="tel"
            className={`flex-1 bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${dialCode ? "rounded-r-lg" : "rounded-lg"}`}
          />
        </div>
        {country?.currency && <p className="text-white/20 text-xs mt-1">Currency: {country.currency}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Country</label>
          <CountrySelect value={form.country} onChange={v => setField("country", v)} onCountryChange={handleCountryChange} />
        </div>
        <TextField label="City" value={form.city} onChange={v => setField("city", v)} placeholder="San Francisco" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Time Zone</label>
          <TimezoneSelect value={form.timezone} onChange={v => setField("timezone", v)} country={form.country} />
        </div>
        <SelectField label="Language" value={form.language} onChange={v => setField("language", v)} options={LANGUAGES} />
      </div>
    </SectionCard>
  );
}