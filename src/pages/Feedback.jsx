import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { getEffectiveRole } from "@/lib/roles";
import { MessageSquare, Plus, List, Users, Shield } from "lucide-react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackList from "@/components/feedback/FeedbackList";
import FeedbackDetail from "@/components/feedback/FeedbackDetail";
import FeedbackAdmin from "@/components/feedback/FeedbackAdmin";

const ADMIN_ROLES = ["developer", "super_admin", "platform_admin", "enterprise_admin", "organization_owner", "support"];

export default function Feedback() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [tab, setTab] = useState("submit");
  const [selectedId, setSelectedId] = useState(null);

  const effectiveRole = getEffectiveRole(user?.role, profile);
  const canViewAdmin = ADMIN_ROLES.includes(effectiveRole);

  const tabs = [
    { id: "submit", label: "Submit", icon: Plus },
    { id: "mine", label: "My Feedback", icon: List },
    { id: "browse", label: "Browse", icon: Users },
  ];
  if (canViewAdmin) tabs.push({ id: "admin", label: "Admin", icon: Shield });

  if (selectedId) {
    return (
      <div className="max-w-4xl mx-auto">
        <FeedbackDetail feedbackId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <MessageSquare size={12} className="text-indigo-400" /> Feedback Center
        </div>
        <h1 className="text-2xl font-bold text-white">Product Feedback</h1>
        <p className="text-white/40 text-sm mt-1">Report bugs, request features, and help shape EXECLEAD.AI — your input goes directly to the product team.</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "submit" && <FeedbackForm onSubmitted={() => setTab("mine")} />}
      {tab === "mine" && <FeedbackList mode="mine" onSelect={setSelectedId} />}
      {tab === "browse" && <FeedbackList mode="all" onSelect={setSelectedId} />}
      {tab === "admin" && canViewAdmin && <FeedbackAdmin onSelect={setSelectedId} />}
    </div>
  );
}