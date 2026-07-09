import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ConciergeSidebar from "@/components/concierge/ConciergeSidebar";
import ConciergeChat from "@/components/concierge/ConciergeChat";
import { toast } from "@/components/ui/use-toast";

export default function Concierge() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: "executive_concierge" });
      setConversations(list || []);
      if (list && list.length > 0 && !activeId) setActiveId(list[0].id);
    } catch (e) {
      toast({ title: "Failed to load conversations", variant: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleNew = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "executive_concierge",
        metadata: { name: "New Conversation", description: "" },
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
    } catch (e) {
      toast({ title: "Failed to create conversation", variant: "error" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] border border-white/5 rounded-2xl overflow-hidden bg-[#0a0a0f]">
      <div className={`${activeId ? "hidden md:flex" : "flex"} flex-col`}>
        <ConciergeSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
          loading={loading}
        />
      </div>
      <div className={`flex-1 ${activeId ? "flex" : "hidden md:flex"} flex-col`}>
        {activeId ? (
          <>
            <div className="md:hidden p-2 border-b border-white/5">
              <button onClick={() => setActiveId(null)} className="text-xs text-white/50 hover:text-white/80">← Conversations</button>
            </div>
            <ConciergeChat conversationId={activeId} />
          </>
        ) : (
          <ConciergeChat conversationId={null} />
        )}
      </div>
    </div>
  );
}