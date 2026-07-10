import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, Activity, BookOpen, MessageSquare, Zap, TrendingUp, Clock, CheckCircle, ArrowLeft, BarChart3 } from "lucide-react";
import {
  EXEC_PERSONA,
  EXEC_WELCOME_MESSAGE,
  EXEC_QUICK_ACTIONS,
  EXEC_TASKS,
  EXEC_KNOWLEDGE_BASE,
  ANONYMOUS_STARTERS,
  AUTHENTICATED_STARTERS,
  ENTERPRISE_STARTERS,
} from "@/lib/execConciergeConfig";

export default function ExecAdmin() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const logs = await base44.entities.UsageLog.filter({ module: "exec_concierge" }, "-created_date", 100);
      const logList = logs.data || logs || [];
      const arr = Array.isArray(logList) ? logList : [];
      const total = arr.length;
      const totalTokens = arr.reduce((s, l) => s + (l.tokens_estimated || 0), 0);
      const avgLatency = total > 0 ? Math.round(arr.reduce((s, l) => s + (l.response_time_ms || 0), 0) / total) : 0;
      const successCount = arr.filter((l) => l.status === "success").length;
      const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
      setAnalytics({ total, totalTokens, avgLatency, successRate });
    } catch (e) {
      setAnalytics(null);
    }
    setLoading(false);
  };

  if (user?.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Sparkles size={32} className="text-amber-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-foreground mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground text-sm mb-6">You need administrator privileges to access the EXEC™ Management Console.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" /> EXEC™ Management Console
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">AI Executive Concierge Configuration & Analytics</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Identity */}
        <Section icon={Sparkles} title="AI Identity">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={EXEC_PERSONA.name} />
            <Field label="Subtitle" value={EXEC_PERSONA.subtitle} />
          </div>
          <Field label="Welcome Message" value={EXEC_WELCOME_MESSAGE} multiline />
        </Section>

        {/* Analytics */}
        <Section icon={BarChart3} title="Usage Analytics">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading analytics…</p>
          ) : analytics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Activity} label="Conversations" value={analytics.total} />
              <StatCard icon={Zap} label="Total Tokens" value={analytics.totalTokens.toLocaleString()} />
              <StatCard icon={Clock} label="Avg Response" value={`${analytics.avgLatency}ms`} />
              <StatCard icon={CheckCircle} label="Success Rate" value={`${analytics.successRate}%`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No analytics data available yet.</p>
          )}
        </Section>

        {/* Knowledge Base */}
        <Section icon={BookOpen} title="Knowledge Base">
          <p className="text-sm text-muted-foreground mb-3">EXEC™ is trained on the following platform areas:</p>
          <div className="flex flex-wrap gap-2">
            {EXEC_KNOWLEDGE_BASE.map((area) => (
              <span key={area} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-medium text-foreground">
                {area}
              </span>
            ))}
          </div>
        </Section>

        {/* Conversation Starters */}
        <Section icon={MessageSquare} title="Conversation Starters">
          <div className="space-y-4">
            <StarterGroup label="Anonymous Visitors" starters={ANONYMOUS_STARTERS} />
            <StarterGroup label="Logged-in Users" starters={AUTHENTICATED_STARTERS} />
            <StarterGroup label="Enterprise Visitors" starters={ENTERPRISE_STARTERS} />
          </div>
        </Section>

        {/* Quick Actions */}
        <Section icon={Zap} title="Quick Actions">
          <div className="grid sm:grid-cols-2 gap-2">
            {EXEC_QUICK_ACTIONS.map((action) => (
              <div key={action.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                <action.icon size={16} className="text-amber-500" />
                <span className="text-sm text-foreground">{action.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Tasks */}
        <Section icon={TrendingUp} title="Executive Tasks">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
            {EXEC_TASKS.map((task) => (
              <div key={task.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                <task.icon size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-foreground">{task.label}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  const SectionIcon = icon;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <SectionIcon size={18} className="text-amber-500" />
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, multiline }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className={`px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  const StatIcon = icon;
  return (
    <div className="bg-muted border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <StatIcon size={16} className="text-amber-500" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function StarterGroup({ label, starters }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {starters.map((s) => (
          <span key={s} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}