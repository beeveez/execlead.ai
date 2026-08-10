import React, { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Lock, ScrollText, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import IntegrationCard from "@/components/enterprise-integrations/IntegrationCard";
import IntegrationSummary from "@/components/enterprise-integrations/IntegrationSummary";

const SEED = [
  { integration_key: "google_drive", display_name: "Google Drive", phase: "phase_1", category: "productivity", platform_connector_type: "googledrive", connection_status: "available", oauth_scopes: "drive.file", least_privilege_notes: "drive.file is the narrowest scope — app-created and user-selected files only; never blanket Drive access.", data_classification: "Confidential", compliance_tags: "SOC 2, GDPR-ready", webhook_supported: true, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Attach executive briefings, leadership portfolios, and evidence documents from Drive into executive workflows." },
  { integration_key: "microsoft_365", display_name: "Microsoft 365", phase: "phase_1", category: "productivity", platform_connector_type: "outlook,one_drive,share_point", connection_status: "available", oauth_scopes: "Files.ReadWrite.All, Sites.ReadWrite.All, User.Read, Mail.Read", least_privilege_notes: "Read/write scoped to files and sites; no tenant-wide admin consent by default.", data_classification: "Confidential", compliance_tags: "SOC 2, GDPR-ready, ISO 27001", webhook_supported: true, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Sync Outlook mail/calendar, OneDrive files, and SharePoint content into the executive operating system." },
  { integration_key: "azure_ad", display_name: "Azure AD / Entra ID", phase: "phase_1", category: "identity", platform_connector_type: "custom", connection_status: "custom_required", oauth_scopes: "Custom — Graph API (SCIM provisioning, group membership)", least_privilege_notes: "Custom integration required — no Base44 platform connector. Provisioned via backend function + secrets with least-privilege app registration.", data_classification: "Restricted", compliance_tags: "SOC 2, ISO 27001, HIPAA-eligible", webhook_supported: false, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Enterprise SSO, SCIM user provisioning, and group-based access control for executive identity governance." },
  { integration_key: "slack", display_name: "Slack", phase: "phase_1", category: "collaboration", platform_connector_type: "slack", connection_status: "available", oauth_scopes: "chat:write, channels:read, groups:read", least_privilege_notes: "User-scoped token; posting and reading only — no admin or workspace-wide scopes.", data_classification: "Confidential", compliance_tags: "SOC 2, GDPR-ready", webhook_supported: true, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Deliver executive briefings, readiness alerts, and council recommendations into Slack channels." },
  { integration_key: "microsoft_teams", display_name: "Microsoft Teams", phase: "phase_1", category: "collaboration", platform_connector_type: "microsoft_teams", connection_status: "available", oauth_scopes: "ChannelMessage.Send, Team.ReadBasic.All, Chat.ReadWrite", least_privilege_notes: "Scoped to channel messaging and basic team read; no tenant admin scopes.", data_classification: "Confidential", compliance_tags: "SOC 2, GDPR-ready", webhook_supported: false, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Post executive briefings and meeting summaries into Teams channels and chats." },
  { integration_key: "airtable", display_name: "Airtable", phase: "phase_2", category: "database", platform_connector_type: "airtable", connection_status: "connected", oauth_scopes: "data.records:read, data.records:write, schema.bases:read", least_privilege_notes: "Record read/write + base schema read only; no workspace admin scopes.", data_classification: "Internal", compliance_tags: "SOC 2", webhook_supported: true, connection_owner: "Platform Admin", last_synchronized: "2026-08-07T00:00:00.000Z", security_status: "verified", scope_review_status: "current", last_scope_review: "2026-08-01", value_proposition: "Two-way sync of CRM, commercial intelligence, and customer lifecycle data with Airtable bases." },
  { integration_key: "workday", display_name: "Workday", phase: "phase_2", category: "hris", platform_connector_type: "custom", connection_status: "custom_required", oauth_scopes: "Custom — Workday REST API (scoped integration account)", least_privilege_notes: "Custom integration required — no Base44 platform connector. Scoped Workday integration account with read-only access to talent/leadership reports.", data_classification: "Restricted", compliance_tags: "SOC 2, ISO 27001, HIPAA-eligible", webhook_supported: false, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Ingest leadership population, succession candidates, and talent data for executive readiness and succession intelligence." },
  { integration_key: "sap_successfactors", display_name: "SAP SuccessFactors", phase: "phase_2", category: "hris", platform_connector_type: "custom", connection_status: "custom_required", oauth_scopes: "Custom — SAP SuccessFactors OData API (scoped role)", least_privilege_notes: "Custom integration required — no Base44 platform connector. Scoped API role with least-privilege talent data access.", data_classification: "Restricted", compliance_tags: "SOC 2, ISO 27001", webhook_supported: false, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Sync employee leadership profiles, learning records, and performance data into executive development workflows." },
  { integration_key: "bamboohr", display_name: "BambooHR", phase: "phase_2", category: "hris", platform_connector_type: "bamboohr", connection_status: "available", oauth_scopes: "read:employees, read:reports", least_privilege_notes: "Read-only employee and report access; no write or admin scopes.", data_classification: "Confidential", compliance_tags: "SOC 2, GDPR-ready", webhook_supported: false, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Pull leadership population, department structure, and performance data for HR-driven executive development." },
  { integration_key: "greenhouse", display_name: "Greenhouse", phase: "phase_2", category: "ats", platform_connector_type: "custom", connection_status: "custom_required", oauth_scopes: "Custom — Greenhouse Harvest API (scoped API key)", least_privilege_notes: "Custom integration required — no Base44 platform connector. Scoped Harvest API key with read-only application and candidate access.", data_classification: "Confidential", compliance_tags: "SOC 2", webhook_supported: false, security_status: "pending_review", scope_review_status: "pending", value_proposition: "Sync executive candidate pipeline and interview data into succession and hiring intelligence." },
];

export default function EnterpriseIntegrationsCenter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      let list = await base44.entities.EnterpriseIntegration.list("-phase", 50);
      if (!list || list.length === 0) {
        list = await base44.entities.EnterpriseIntegration.bulkCreate(SEED);
      }
      setItems(list);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (item) => {
    try {
      const updated = await base44.entities.EnterpriseIntegration.update(item.id, { enterprise_enabled: !item.enterprise_enabled });
      setItems((p) => p.map((i) => (i.id === item.id ? updated : i)));
    } catch {}
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.phase === filter);

  return (
    <div className="min-h-screen bg-[#08080d] text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-3">
          <ShieldCheck size={13} /> Enterprise MCP Strategy™ · Enterprise Integrations Center™
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Enterprise Integrations Center™</h1>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 mb-5 flex items-start gap-3">
          <Lock size={16} className="text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            EXECLEAD.AI intentionally enables a curated set of enterprise integrations to maintain security, governance, and auditability for executive leadership and talent intelligence workflows. Fewer, governed integrations is a <span className="font-semibold text-emerald-300">security and enterprise trust advantage</span> — not a limitation. Every connector enforces OAuth scope review, least-privilege permissions, connection owner tracking, last-used timestamps, audit logging, an enterprise disable switch, and data classification.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-white/40" /></div>
        ) : (
          <>
            <IntegrationSummary items={items} />

            <div className="flex items-center gap-2 my-5">
              <Filter size={13} className="text-white/40" />
              {[
                { key: "all", label: "All" },
                { key: "phase_1", label: "Phase 1 (P0)" },
                { key: "phase_2", label: "Phase 2 (P1)" },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f.key ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 hover:text-white/70 border border-transparent"}`}>{f.label}</button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-5">
              <div className="flex items-center gap-2 mb-3"><span className="text-white text-sm font-semibold">Connected Integrations</span></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.filter((i) => i.connection_status === "connected").map((i) => <IntegrationCard key={i.id} item={i} onToggle={toggle} />)}
              </div>
              {filtered.filter((i) => i.connection_status === "connected").length === 0 && <p className="text-white/40 text-xs">No connected integrations in this phase yet.</p>}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-5">
              <div className="flex items-center gap-2 mb-3"><span className="text-white text-sm font-semibold">Available Enterprise Integrations</span></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.filter((i) => i.connection_status !== "connected").map((i) => <IntegrationCard key={i.id} item={i} onToggle={toggle} />)}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-start gap-3">
              <ScrollText size={15} className="text-white/50 mt-0.5 shrink-0" />
              <div>
                <div className="text-white text-sm font-semibold mb-1">Governance & Auditability</div>
                <p className="text-xs text-white/55 leading-relaxed">Every connector records a connection owner, last-used timestamp, last scope review date, data classification, and compliance tags. The enterprise disable switch allows administrators to instantly revoke any integration across all workflows. Audit logging captures connection, sync, and configuration events for security review. Integrations marked <span className="text-amber-400 font-medium">Custom Integration</span> require a backend function with scoped secrets — they are not enabled until built and reviewed.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}