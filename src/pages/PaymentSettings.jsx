import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Shield, Loader2, Save, Check, Lock, Key, Globe, Percent, Gift, Calendar,
  Webhook, CreditCard, AlertCircle, DollarSign
} from "lucide-react";
import {
  PAYMENT_PROVIDERS, CURRENCIES, COUNTRIES, TRIAL_DURATIONS, WEBHOOK_EVENTS,
  getPaymentSettings, savePaymentSettings,
} from "@/lib/payments";

export default function PaymentSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role === "admin") {
          const s = await getPaymentSettings();
          setSettings(s || defaultSettings());
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const defaultSettings = () => ({
    provider: "stripe",
    status: "disconnected",
    publishable_key: "",
    secret_key: "",
    webhook_secret: "",
    supported_currencies: ["USD"],
    supported_countries: ["US"],
    default_currency: "USD",
    tax_enabled: true,
    default_tax_rate: 0,
    trial_enabled: true,
    trial_duration_days: 14,
    min_coupon_value: 0,
    max_coupon_value: 100,
    refund_window_days: 30,
    is_active: true,
  });

  const update = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const toggleArrayItem = (field, item) => {
    const arr = settings[field] || [];
    update(field, arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const hasKeys = settings.publishable_key && settings.secret_key;
      await savePaymentSettings({
        ...settings,
        status: hasKeys ? "connected" : "disconnected",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Access Restricted</h2>
          <p className="text-white/30 text-sm">This area is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const isConnected = settings.status === "connected";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Lock size={12} className="text-emerald-400" /> Payment Settings
          </div>
          <h1 className="text-2xl font-bold text-white">Payment Infrastructure</h1>
          <p className="text-white/40 text-sm mt-1">Configure payment providers, currencies, tax, and billing rules.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
          {isConnected ? "Connected" : "Not Connected"}
        </div>
      </div>

      {/* Provider */}
      <Section icon={CreditCard} title="Payment Provider" subtitle="Select the active payment provider">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(PAYMENT_PROVIDERS).map((p) => (
            <button
              key={p.id}
              onClick={() => p.status === "active" && update("provider", p.id)}
              disabled={p.status === "coming_soon"}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl border transition-all ${
                settings.provider === p.id
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              } ${p.status === "coming_soon" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className="text-2xl">{p.icon || p.name[0]}</span>
              <span className="text-white/80 text-sm font-medium">{p.name}</span>
              {p.status === "coming_soon" && <span className="text-[10px] text-white/30">Coming Soon</span>}
            </button>
          ))}
        </div>
      </Section>

      {/* API Credentials */}
      <Section icon={Key} title="API Credentials" subtitle="Provider keys are stored securely and never exposed to the frontend">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Publishable Key</label>
            <input
              type="text"
              placeholder="pk_live_..."
              value={settings.publishable_key || ""}
              onChange={(e) => update("publishable_key", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Secret Key</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                placeholder="sk_live_..."
                value={settings.secret_key || ""}
                onChange={(e) => update("secret_key", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 pr-20 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white/60 px-2"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Webhook Secret</label>
            <div className="relative">
              <input
                type={showWebhook ? "text" : "password"}
                placeholder="whsec_..."
                value={settings.webhook_secret || ""}
                onChange={(e) => update("webhook_secret", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 pr-20 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
              <button
                onClick={() => setShowWebhook(!showWebhook)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white/60 px-2"
              >
                {showWebhook ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
              <AlertCircle size={10} /> Used to verify incoming webhook signatures
            </p>
          </div>
        </div>
      </Section>

      {/* Currencies & Countries */}
      <Section icon={Globe} title="Currencies & Countries" subtitle="Configure supported regions for checkout">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Supported Currencies</label>
            <div className="space-y-1.5">
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <label key={code} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.supported_currencies?.includes(code) || false}
                    onChange={() => toggleArrayItem("supported_currencies", code)}
                    className="rounded border-white/20 bg-white/5 text-indigo-500"
                  />
                  <span className="text-sm text-white/70">{c.symbol} {code} — {c.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Default Currency</label>
              <select
                value={settings.default_currency || "USD"}
                onChange={(e) => update("default_currency", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
              >
                {(settings.supported_currencies || ["USD"]).map((c) => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Supported Countries</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
              {COUNTRIES.map((c) => (
                <label key={c.code} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.supported_countries?.includes(c.code) || false}
                    onChange={() => toggleArrayItem("supported_countries", c.code)}
                    className="rounded border-white/20 bg-white/5 text-indigo-500"
                  />
                  <span className="text-sm text-white/70">{c.name}</span>
                  <span className="text-xs text-white/30 ml-auto">{c.currency}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Tax & Coupon Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section icon={Percent} title="Tax Configuration" subtitle="Automatic tax calculation">
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white/70">Enable Tax Calculation</span>
              <input
                type="checkbox"
                checked={settings.tax_enabled ?? true}
                onChange={(e) => update("tax_enabled", e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-indigo-500"
              />
            </label>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.default_tax_rate || 0}
                onChange={(e) => update("default_tax_rate", parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
              />
              <p className="text-xs text-white/30 mt-1">Used as fallback when country-specific rate is unavailable</p>
            </div>
          </div>
        </Section>

        <Section icon={Gift} title="Coupon Rules" subtitle="Limits for discount codes">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Min Discount Value</label>
              <input
                type="number"
                min="0"
                value={settings.min_coupon_value || 0}
                onChange={(e) => update("min_coupon_value", parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Max Discount Value</label>
              <input
                type="number"
                min="0"
                value={settings.max_coupon_value || 100}
                onChange={(e) => update("max_coupon_value", parseFloat(e.target.value) || 100)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        </Section>
      </div>

      {/* Trial & Refund */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section icon={Calendar} title="Trial Configuration" subtitle="Free trial settings">
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white/70">Enable Free Trials</span>
              <input
                type="checkbox"
                checked={settings.trial_enabled ?? true}
                onChange={(e) => update("trial_enabled", e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-indigo-500"
              />
            </label>
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Trial Duration (Days)</label>
              <select
                value={settings.trial_duration_days || 14}
                onChange={(e) => update("trial_duration_days", parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
              >
                {TRIAL_DURATIONS.map((t) => <option key={t.days} value={t.days} className="bg-[#0d0d14]">{t.label}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section icon={DollarSign} title="Refund Settings" subtitle="Refund window for customers">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Refund Window (Days)</label>
            <input
              type="number"
              min="0"
              max="365"
              value={settings.refund_window_days || 30}
              onChange={(e) => update("refund_window_days", parseInt(e.target.value) || 30)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
            />
            <p className="text-xs text-white/30 mt-1">Customers can request refunds within this period</p>
          </div>
        </Section>
      </div>

      {/* Webhook Events Documentation */}
      <Section icon={Webhook} title="Webhook Events" subtitle="Events that should be handled by the backend webhook endpoint">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.values(WEBHOOK_EVENTS).map((event) => (
            <div key={event} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              <Webhook size={12} className="text-indigo-400/50 flex-shrink-0" />
              <code className="text-xs text-white/50 font-mono">{event}</code>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-3 flex items-start gap-1.5">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          Webhook endpoints require a backend function (Builder+). Events are logged to the BillingEvent entity for audit purposes.
        </p>
      </Section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        {saved && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <Check size={14} /> Settings saved
          </motion.div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Settings
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <p className="text-white/30 text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}