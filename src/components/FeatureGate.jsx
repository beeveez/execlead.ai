import React from "react";
import { Loader2 } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";
import LockedFeatureCard from "@/components/LockedFeatureCard";

export default function FeatureGate({ featureId, children, title }) {
  const { hasAccess, loading } = useEntitlements();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (hasAccess(featureId)) return children;

  return <LockedFeatureCard featureId={featureId} title={title} />;
}