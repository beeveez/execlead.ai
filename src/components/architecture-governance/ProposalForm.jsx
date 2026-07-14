import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PROPOSAL_TYPE_META,
} from "@/lib/architectureGovernanceEngine";
import { X } from "lucide-react";

const PROPOSAL_TYPES = Object.entries(PROPOSAL_TYPE_META).map(([key, meta]) => ({
  key,
  label: meta.label,
}));

const IMPACT_FIELDS = [
  { key: "business_justification",       label: "Business Justification",       placeholder: "Why is this change needed?" },
  { key: "user_personas_affected",       label: "User Personas Affected",       placeholder: "Comma-separated roles/personas affected" },
  { key: "dependencies",                 label: "Dependencies",                 placeholder: "Dependencies that must exist first" },
  { key: "existing_capabilities_reviewed", label: "Existing Capabilities Reviewed", placeholder: "What existing capabilities were reviewed?" },
  { key: "alternative_solutions",       label: "Alternative Solutions Considered", placeholder: "Alternatives and why they were rejected" },
  { key: "impact_navigation_registry",  label: "Impact on Navigation Registry™",  placeholder: "New routes, sections, workspaces?" },
  { key: "impact_feature_flags",        label: "Impact on Feature Flags",        placeholder: "New flags needed? Rollout strategy?" },
  { key: "impact_security",             label: "Impact on Security",            placeholder: "Security implications and mitigations" },
  { key: "impact_privacy",              label: "Impact on Privacy",             placeholder: "PII, consent, data retention implications" },
  { key: "impact_release_readiness",    label: "Impact on Release Readiness",   placeholder: "How does this affect launch readiness?" },
  { key: "estimated_maintenance_cost",  label: "Estimated Maintenance Cost",     placeholder: "Hours/week, infra cost, ongoing burden" },
];

export default function ProposalForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    proposal_type: "new_entity",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.proposal_type) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-white">New Architecture Proposal</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label className="text-xs text-white/40">Proposal Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Add Executive Coaching AI Engine"
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-white/40">Proposal Type *</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {PROPOSAL_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => update("proposal_type", t.key)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                    form.proposal_type === t.key
                      ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                      : "border-white/5 bg-white/[0.02] text-white/40 hover:text-white/60 hover:border-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {IMPACT_FIELDS.map((field) => (
            <div key={field.key}>
              <Label className="text-xs text-white/40">{field.label}</Label>
              <Textarea
                value={form[field.key] || ""}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[60px] text-sm"
              />
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-[#0d0d14] border-t border-white/5 px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-white/40 hover:text-white/60">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.title.trim() || submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {submitting ? "Submitting..." : "Submit Proposal"}
          </Button>
        </div>
      </div>
    </div>
  );
}