/**
 * PlatformStatusProvider™
 * ============================================================
 * Dynamically determines Platform Status™ title, subtitle, and
 * metrics based on the active workspace, subscription plan,
 * and role.
 *
 * Never hardcodes a status type — always determined automatically.
 *
 * Priority: super_admin > developer workspace > enterprise workspace > plan-based
 */
import {
  Boxes, GraduationCap, Cpu, TrendingUp, Activity, Gauge, Target,
  Brain, Heart, Building2, Users, ShieldCheck, Shield, DollarSign,
  CreditCard, Rocket,
} from "lucide-react";

export const PLATFORM_STATUS_CONFIGS = {
  free: {
    title: "Free Platform Status™",
    subtitle: "Your free leadership workspace.",
    accent: "text-white/60",
    metrics: [
      { key: "core_features", label: "Core Features", icon: Boxes },
      { key: "learning_progress", label: "Learning Progress", icon: GraduationCap },
      { key: "ai_usage", label: "AI Usage", icon: Cpu },
      { key: "upgrade_opportunities", label: "Upgrade Opportunities", icon: TrendingUp },
      { key: "platform_health", label: "Platform Health", icon: Activity },
    ],
  },
  professional: {
    title: "Professional Platform Status™",
    subtitle: "Professional leadership development workspace.",
    accent: "text-cyan-400",
    metrics: [
      { key: "professional_readiness", label: "Professional Readiness™", icon: Gauge },
      { key: "career_growth", label: "Career Growth™", icon: TrendingUp },
      { key: "ai_usage", label: "AI Usage", icon: Cpu },
      { key: "learning_progress", label: "Learning Progress", icon: GraduationCap },
      { key: "professional_features", label: "Professional Features", icon: Boxes },
    ],
  },
  executive: {
    title: "Executive Platform Status™",
    subtitle: "Executive Leadership Operating System™",
    accent: "text-indigo-400",
    metrics: [
      { key: "executive_readiness", label: "Executive Readiness™", icon: Target },
      { key: "career_momentum", label: "Career Momentum™", icon: Activity },
      { key: "leadership_intelligence", label: "Leadership Intelligence™", icon: Brain },
      { key: "executive_health", label: "Executive Health™", icon: Heart },
      { key: "platform_health", label: "Platform Health", icon: Activity },
    ],
  },
  enterprise: {
    title: "Enterprise Platform Status™",
    subtitle: "Enterprise Leadership Platform™",
    accent: "text-cyan-400",
    metrics: [
      { key: "organization_health", label: "Organization Health", icon: Building2 },
      { key: "license_usage", label: "License Usage", icon: Users },
      { key: "compliance", label: "Compliance", icon: ShieldCheck },
      { key: "security", label: "Security", icon: Shield },
      { key: "platform_health", label: "Platform Health", icon: Activity },
      { key: "ai_usage", label: "AI Usage", icon: Cpu },
    ],
  },
  developer: {
    title: "Developer Platform Status™",
    subtitle: "Platform Engineering Workspace™",
    accent: "text-emerald-400",
    metrics: [
      { key: "platform_health", label: "Platform Health™", icon: Activity },
      { key: "foundation_certification", label: "Foundation Certification™", icon: ShieldCheck },
      { key: "deployment_readiness", label: "Deployment Readiness™", icon: Rocket },
      { key: "architecture_health", label: "Architecture Health™", icon: Building2 },
      { key: "ai_infrastructure", label: "AI Infrastructure™", icon: Cpu },
    ],
  },
  super_admin: {
    title: "Platform Governance Status™",
    subtitle: "Global Platform Administration",
    accent: "text-amber-400",
    metrics: [
      { key: "organizations", label: "Organizations", icon: Building2 },
      { key: "users", label: "Users", icon: Users },
      { key: "platform_health", label: "Platform Health", icon: Activity },
      { key: "security", label: "Security", icon: Shield },
      { key: "commercial", label: "Commercial", icon: DollarSign },
      { key: "billing", label: "Billing", icon: CreditCard },
      { key: "ai", label: "AI", icon: Cpu },
      { key: "compliance", label: "Compliance", icon: ShieldCheck },
    ],
  },
};

/**
 * Determines the Platform Status™ configuration based on role, plan, and workspace.
 * Priority: super_admin > developer workspace/role > enterprise workspace > plan-based
 */
export function getPlatformStatusConfig(role, plan, workspace) {
  const r = (role || "").toLowerCase();

  if (r === "super_admin") {
    return PLATFORM_STATUS_CONFIGS.super_admin;
  }

  if (workspace === "developer" || r === "developer") {
    return PLATFORM_STATUS_CONFIGS.developer;
  }

  if (workspace === "enterprise") {
    return PLATFORM_STATUS_CONFIGS.enterprise;
  }

  const planKey = (plan || "free").toLowerCase();
  if (PLATFORM_STATUS_CONFIGS[planKey]) {
    return PLATFORM_STATUS_CONFIGS[planKey];
  }

  return PLATFORM_STATUS_CONFIGS.free;
}