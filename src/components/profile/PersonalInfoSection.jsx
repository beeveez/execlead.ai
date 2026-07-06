import React from "react";
import { TextField, SelectField, SectionCard } from "./FormFields";
import CountrySelect from "@/components/common/CountrySelect";
import { getCountryByName, timezoneLabel } from "@/lib/locations";
import { Camera, Loader2, Mail, Lock } from "lucide-react";

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Mandarin", "Japanese", "Hindi", "Arabic", "Russian", "Korean", "Italian", "Dutch", "Swedish", "Vietnamese", "Indonesian", "Tagalog"];

const DEFAULT_TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Shanghai", "Asia/Singapore", "Asia/Manila", "Asia/Tokyo", "Australia/Sydney", "UTC",
];

export default function PersonalInfoSection({ form, setField, user, onPhotoUpload, uploadingPhoto }) {
  const country = getCountryByName(form.country);
  const timezones = country?.timezones || [];
  const dialCode = country?.dialCode;
  const tzOptions = timezones.length > 0 ? timezones : DEFAULT_TIMEZONES;

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
          <select value={form.timezone || ""} onChange={e => setField("timezone", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
            <option value="" className="bg-[#0d0d14]">Select...</option>
            {tzOptions.map(tz => <option key={tz} value={tz} className="bg-[#0d0d14]">{timezoneLabel(tz)}</option>)}
          </select>
          {timezones.length > 1 && <p className="text-white/20 text-xs mt-1">{timezones.length} time zones available</p>}
        </div>
        <SelectField label="Language" value={form.language} onChange={v => setField("language", v)} options={LANGUAGES} />
      </div>
    </SectionCard>
  );
}