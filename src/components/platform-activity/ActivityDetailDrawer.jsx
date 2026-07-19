import React from 'react';
import { X, Clock, User, Server, Cpu, Tag, FileText } from 'lucide-react';
import { getCategoryConfig, getSeverityConfig, getStatusConfig, getImpactConfig } from '@/lib/platformActivityConfig';

export default function ActivityDetailDrawer({ activity, onClose }) {
  if (!activity) return null;

  const cat = getCategoryConfig(activity.category);
  const sev = getSeverityConfig(activity.severity);
  const status = getStatusConfig(activity.status);
  const impact = getImpactConfig(activity.business_impact);
  const CatIcon = cat.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d14] border-l border-white/10 h-full overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5">
              <CatIcon size={16} className={cat.color} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{activity.action}</h2>
              <p className="text-white/30 text-xs">{cat.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full ${sev.bg} ${sev.color}`}>{sev.label}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
            {activity.business_impact !== 'none' && (
              <span className={`text-xs px-2 py-1 rounded-full bg-white/5 ${impact.color}`}>Impact: {impact.label}</span>
            )}
            {activity.risk_score > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full bg-white/5 ${activity.risk_score > 60 ? 'text-red-400' : activity.risk_score > 30 ? 'text-amber-400' : 'text-white/40'}`}>
                Risk Score: {activity.risk_score}/100
              </span>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <Section icon={FileText} title="Description">
              <p className="text-white/60 text-sm leading-relaxed">{activity.description}</p>
            </Section>
          )}

          {/* Timestamps */}
          <Section icon={Clock} title="Timing">
            <Field label="Created" value={new Date(activity.created_date).toLocaleString()} />
            {activity.duration_ms > 0 && <Field label="Duration" value={`${activity.duration_ms} ms`} />}
            {activity.execution_time_ms > 0 && <Field label="Execution Time" value={`${activity.execution_time_ms} ms`} />}
          </Section>

          {/* Actor */}
          <Section icon={User} title="Performed By">
            <Field label="User" value={activity.performed_by_name || 'System'} />
            {activity.ip_address && <Field label="IP Address" value={activity.ip_address} />}
            {activity.browser && <Field label="Browser" value={activity.browser} />}
            {activity.device && <Field label="Device" value={activity.device} />}
            {activity.os && <Field label="OS" value={activity.os} />}
            {activity.location && <Field label="Location" value={activity.location} />}
            {activity.session_id && <Field label="Session ID" value={activity.session_id} />}
          </Section>

          {/* Target */}
          {(activity.target_entity || activity.target_user_name) && (
            <Section icon={Server} title="Target">
              {activity.target_user_name && <Field label="Target User" value={activity.target_user_name} />}
              {activity.target_entity && <Field label="Entity Type" value={activity.target_entity} />}
              {activity.target_entity_id && <Field label="Entity ID" value={activity.target_entity_id} />}
            </Section>
          )}

          {/* AI Details */}
          {(activity.model_used || activity.ai_credits_used > 0) && (
            <Section icon={Cpu} title="AI Execution">
              {activity.model_used && <Field label="Model" value={activity.model_used} />}
              {activity.provider && <Field label="Provider" value={activity.provider} />}
              {activity.ai_credits_used > 0 && <Field label="AI Credits" value={String(activity.ai_credits_used)} />}
              {activity.ai_cost > 0 && <Field label="AI Cost" value={`$${activity.ai_cost.toFixed(4)}`} />}
              <Field label="Cache Hit" value={activity.cache_hit ? 'Yes' : 'No'} />
              {activity.retry_count > 0 && <Field label="Retries" value={String(activity.retry_count)} />}
            </Section>
          )}

          {/* Correlation IDs */}
          <Section icon={Tag} title="Correlation">
            {activity.activity_id && <Field label="Activity ID" value={activity.activity_id} />}
            {activity.request_id && <Field label="Request ID" value={activity.request_id} />}
            {activity.correlation_id && <Field label="Correlation ID" value={activity.correlation_id} />}
            {activity.automation_id && <Field label="Automation ID" value={activity.automation_id} />}
            {activity.notification_id && <Field label="Notification ID" value={activity.notification_id} />}
            {activity.approval_id && <Field label="Approval ID" value={activity.approval_id} />}
          </Section>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <Section icon={Tag} title="Tags">
              <div className="flex gap-1.5 flex-wrap">
                {activity.tags.map((tag, i) => (
                  <span key={i} className="bg-white/5 px-2 py-1 rounded text-xs text-white/50">#{tag}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Metadata */}
          {activity.metadata_json && (
            <Section icon={FileText} title="Metadata">
              <pre className="bg-black/30 border border-white/5 rounded-lg p-3 text-xs text-white/50 overflow-x-auto max-h-48">
                {JSON.stringify(JSON.parse(activity.metadata_json || '{}'), null, 2)}
              </pre>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-white/30 text-xs uppercase tracking-wider mb-2">
        <Icon size={12} /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/30">{label}</span>
      <span className="text-white/70 text-right break-all">{value}</span>
    </div>
  );
}