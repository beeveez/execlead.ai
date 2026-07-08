import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Loader2, BookOpen, Plus, X, ExternalLink, FileText } from "lucide-react";

export default function CommunityResources() {
  const { community, membership } = useOutletContext();
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.NetworkPost.filter(
          { community_id: community.id, post_type: "resource" }, "-created_date", 50
        );
        setResources(all);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setPosting(true);
    try {
      const newResource = await base44.entities.NetworkPost.create({
        author_name: profile?.full_name || user?.email || "Member",
        author_id: user?.id,
        author_role: profile?.current_role,
        author_company: profile?.current_company,
        author_photo: profile?.profile_photo,
        content: form.title.trim(),
        post_type: "resource",
        community_id: community.id,
        community_name: community.name,
        tags: form.url ? [form.url] : [],
        likes_count: 0,
        liked_by_json: "[]",
        comments_json: JSON.stringify(form.description ? [{ id: Date.now().toString(), author_name: profile?.full_name || "Member", author_id: user?.id, content: form.description, created_date: new Date().toISOString() }] : []),
        saved_by_json: "[]",
        pinned: false,
      });
      setResources((prev) => [newResource, ...prev]);
      setShowForm(false);
      setForm({ title: "", url: "", description: "" });
    } catch {}
    setPosting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-400" /> Resource Library
          </h1>
          <p className="text-white/40 text-sm mt-1">Articles, tools, and links shared by {community.name} members.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Share Resource"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Resource title"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL (https://...)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Why is this resource valuable?"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={posting || !form.title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Share Resource
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-emerald-400" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-12 text-center">
          <BookOpen size={28} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">No resources shared yet. Be the first to share a valuable resource!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((r) => {
            const url = r.tags?.[0] || "";
            const description = (() => {
              try { const c = JSON.parse(r.comments_json || "[]"); return c[0]?.content || ""; } catch { return ""; }
            })();
            return (
              <div key={r.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm">{r.content}</h3>
                    {description && <p className="text-white/40 text-xs mt-1 line-clamp-2">{description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-white/30">Shared by {r.author_name}</span>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <ExternalLink size={10} /> Open
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}