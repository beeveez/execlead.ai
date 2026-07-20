import React from "react";
import { Bell, AlertTriangle, Mail, Calendar, UserCheck, Shield, Clock } from "lucide-react";
import { ALERT_SEVERITY } from "@/lib/admissionsOperationsEngine";

const ALERT_ICONS = {
  application_overdue: Clock,
  reviewer_overloaded: AlertTriangle,
  sla_breach: Shield,
  email_failure: Mail,
  interview_overdue: Calendar,
  invitation_not_accepted: UserCheck,
  activation_stalled: Bell,
};

export default function AlertEnginePanel({ alerts }) {
  const opsAlerts = alerts.filter((a) => a.target === "operations");
  const devAlerts = alerts.filter((a) => a.target === "developer");

  const renderAlerts = (list, title) => (
    <div className="space-y-2">
      <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{title} ({list.length})</h4>
      {list.length === 0 ? (
        <div className="text-center py-6"><Bell size={20} className="text-white/20 mx-auto mb-2" /><p className="text-xs text-white/30">No alerts</p></div>
      ) : (
        list.map((alert, i) => {
          const sev = ALERT_SEVERITY[alert.severity] || ALERT_SEVERITY.low;
          const Icon = ALERT_ICONS[alert.type] || Bell;
          return (
            <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border ${sev.badge}`}>
              <Icon size={12} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{alert.title}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full opacity-60">{sev.label}</span>
                </div>
                <p className="text-[10px] opacity-70 mt-0.5">{alert.message}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell size={14} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-white/70">Alert Engine™ — Operational Alerts</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderAlerts(opsAlerts, "Operations Workspace")}
        {renderAlerts(devAlerts, "Developer Workspace")}
      </div>
    </div>
  );
}