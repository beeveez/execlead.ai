import React from 'react';
import MetricCard from '@/components/shared/MetricCard';
import { useNavigate } from 'react-router-dom';
import {
  Building2, CreditCard, GraduationCap, TrendingUp, ShieldCheck,
  Lock, BookOpen, Sparkles, AlertTriangle, ArrowRight,
} from 'lucide-react';

const ALERTS = [
  { label: '3 licenses expiring within 30 days', severity: 'medium' },
  { label: '2 departments below learning target', severity: 'low' },
  { label: 'SSO configuration pending for 1 organization', severity: 'high' },
];

const DOMAIN_LINKS = [
  { label: 'Organization', path: '/enterprise/organization-domain', icon: Building2, color: 'text-cyan-400' },
  { label: 'Workforce Development', path: '/enterprise/workforce', icon: GraduationCap, color: 'text-violet-400' },
  { label: 'Governance', path: '/enterprise/governance-domain', icon: ShieldCheck, color: 'text-amber-400' },
  { label: 'Security & Identity', path: '/enterprise/security-identity', icon: Lock, color: 'text-rose-400' },
  { label: 'Procurement', path: '/enterprise/procurement-domain', icon: CreditCard, color: 'text-emerald-400' },
  { label: 'Reporting', path: '/enterprise/reporting', icon: TrendingUp, color: 'text-indigo-400' },
];

export default function EnterpriseCommandCenter() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">How is my organization performing?</div>
        <h1 className="text-2xl font-bold text-white">Enterprise Command Center™</h1>
        <p className="text-white/40 text-sm mt-1 max-w-2xl">
          Unified view of organization health, workforce development, governance, security, and procurement.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard icon={Building2} label="Organization Health™" value="91" suffix="%" trend="up" color="cyan" description="Overall organizational health" />
        <MetricCard icon={CreditCard} label="License Usage™" value="78" suffix="%" trend="up" color="indigo" description="Licenses used vs. purchased" />
        <MetricCard icon={GraduationCap} label="Team Readiness™" value="73" suffix="%" trend="up" color="violet" description="Average team readiness score" />
        <MetricCard icon={TrendingUp} label="Leadership Readiness™" value="68" suffix="%" trend="up" color="amber" description="Leadership pipeline readiness" />
        <MetricCard icon={ShieldCheck} label="Compliance™" value="95" suffix="%" trend="up" color="emerald" description="Compliance posture" />
        <MetricCard icon={Lock} label="Security™" value="88" suffix="%" trend="up" color="rose" description="Security score" />
        <MetricCard icon={BookOpen} label="Learning™" value="82" suffix="%" trend="up" color="indigo" description="Learning completion rate" />
        <MetricCard icon={Building2} label="Organizations™" value="12" color="cyan" description="Active organizations" />
      </div>

      {/* Executive Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Executive Summary™</h2>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          Organization health is strong at 91%. Compliance posture is excellent at 95%. License usage at 78%
          indicates room for growth. Team readiness (73%) and leadership readiness (68%) are the primary
          development areas. Learning completion is tracking well at 82%.
        </p>
      </div>

      {/* Organization Alerts */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Organization Alerts™</h2>
        </div>
        <div className="space-y-3">
          {ALERTS.map((a) => (
            <div key={a.label} className="flex items-center justify-between text-xs">
              <span className="text-white/60">{a.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  a.severity === 'high'
                    ? 'bg-rose-500/10 text-rose-400'
                    : a.severity === 'medium'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {a.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Enterprise Domains</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_LINKS.map((d) => (
            <div
              key={d.path}
              onClick={() => navigate(d.path)}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <d.icon size={18} className={d.color} />
                  </div>
                  <span className="text-sm font-medium text-white">{d.label}</span>
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}