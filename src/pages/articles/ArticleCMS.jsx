import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { canAccessDeveloperWorkspace } from '@/lib/roles';
import { Plus, Edit3, Trash2, X, Save, Eye, FileText, Search } from 'lucide-react';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/components/articles/ArticleCard';
import { toast } from '@/components/ui/use-toast';

const STATUS_COLORS = {
  draft: 'text-white/40 bg-white/5',
  published: 'text-emerald-400 bg-emerald-500/10',
  featured: 'text-amber-400 bg-amber-500/10',
};

const EMPTY_FORM = {
  title: '', slug: '', subtitle: '', category: 'leadership', difficulty: 'intermediate',
  status: 'draft', excerpt: '', content: '', author_name: '', author_role: '',
  featured_image_url: '', reading_time_minutes: 5, tags: '', featured: false,
  executive_summary: '', key_insights_json: '', leadership_lessons_json: '',
  recommended_actions_json: '', suggested_learning_path: '',
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseTags(str) {
  return str.split(',').map(t => t.trim()).filter(Boolean);
}

export default function ArticleCMS() {
  const { user } = useAuth();
  const canAccess = user && canAccessDeveloperWorkspace(user.role);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!canAccess) { setLoading(false); return; }
    fetchArticles();
  }, [canAccess]);

  const fetchArticles = async () => {
    try {
      const results = await base44.entities.ExecutiveInsight.list('-updated_date', 100);
      setArticles(results || []);
    } catch (e) {
      toast({ title: 'Failed to load articles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => { setEditing('new'); setForm(EMPTY_FORM); };
  const handleEdit = (article) => {
    setEditing(article.id);
    setForm({
      ...EMPTY_FORM,
      ...article,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      featured: article.featured || article.status === 'featured',
    });
  };
  const handleCancel = () => { setEditing(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!form.title || !form.category) {
      toast({ title: 'Title and category are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    const data = {
      ...form,
      slug,
      tags: parseTags(form.tags),
      reading_time_minutes: Number(form.reading_time_minutes) || 5,
      status: form.featured ? 'featured' : form.status,
      published_at: form.status !== 'draft' && !form.published_at ? new Date().toISOString() : form.published_at,
    };
    try {
      if (editing === 'new') {
        await base44.entities.ExecutiveInsight.create(data);
        toast({ title: 'Article created' });
      } else {
        await base44.entities.ExecutiveInsight.update(editing, data);
        toast({ title: 'Article updated' });
      }
      setEditing(null); setForm(EMPTY_FORM);
      fetchArticles();
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    try {
      await base44.entities.ExecutiveInsight.delete(id);
      toast({ title: 'Article deleted' });
      fetchArticles();
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const filtered = articles.filter(a =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.slug?.toLowerCase().includes(search.toLowerCase())
  );

  if (!canAccess) {
    return <div className="min-h-screen flex items-center justify-center text-white/40">Access restricted to developer and admin roles.</div>;
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Executive Insights CMS™</h1>
          <p className="text-white/40 text-sm">Manage articles, content, and publication status.</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-medium px-4 py-2 rounded-xl transition-all">
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" />
      </div>

      {/* Article List */}
      {loading ? (
        <div className="text-center py-12 text-white/40 text-sm">Loading articles...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
              <FileText size={16} className="text-white/30 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium truncate">{a.title}</div>
                <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
                  <span>{CATEGORY_LABELS[a.category] || a.category}</span>
                  <span>·</span>
                  <span>{a.reading_time_minutes || 5} min</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Eye size={10} /> {a.view_count || 0} views</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[a.status] || STATUS_COLORS.draft}`}>{a.status}</span>
              <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No articles found.</div>}
        </div>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0d0d14] border border-white/10 rounded-2xl my-8">
              <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h2 className="text-white font-semibold">{editing === 'new' ? 'New Article' : 'Edit Article'}</h2>
                <button onClick={handleCancel} className="text-white/30 hover:text-white/60"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <Field label="Title"><input value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: form.slug || slugify(e.target.value)})} className="cms-input" /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Slug"><input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="cms-input" /></Field>
                  <Field label="Subtitle"><input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="cms-input" /></Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Category"><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="cms-input">{Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
                  <Field label="Difficulty"><select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="cms-input">{Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
                  <Field label="Status"><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="cms-input"><option value="draft">Draft</option><option value="published">Published</option><option value="featured">Featured</option></select></Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Author Name"><input value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} className="cms-input" /></Field>
                  <Field label="Author Role"><input value={form.author_role} onChange={e => setForm({...form, author_role: e.target.value})} className="cms-input" /></Field>
                </div>
                <Field label="Excerpt"><textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={2} className="cms-input" /></Field>
                <Field label="Content (Markdown)"><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={10} className="cms-input font-mono text-xs" /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Featured Image URL"><input value={form.featured_image_url} onChange={e => setForm({...form, featured_image_url: e.target.value})} className="cms-input" /></Field>
                  <Field label="Reading Time (min)"><input type="number" value={form.reading_time_minutes} onChange={e => setForm({...form, reading_time_minutes: e.target.value})} className="cms-input" /></Field>
                </div>
                <Field label="Tags (comma-separated)"><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="cms-input" /></Field>
                <Field label="Executive Summary"><textarea value={form.executive_summary} onChange={e => setForm({...form, executive_summary: e.target.value})} rows={2} className="cms-input" /></Field>
                <Field label="Key Insights (JSON array)"><textarea value={form.key_insights_json} onChange={e => setForm({...form, key_insights_json: e.target.value})} rows={2} placeholder='["Insight 1", "Insight 2"]' className="cms-input font-mono text-xs" /></Field>
                <Field label="Leadership Lessons (JSON array)"><textarea value={form.leadership_lessons_json} onChange={e => setForm({...form, leadership_lessons_json: e.target.value})} rows={2} className="cms-input font-mono text-xs" /></Field>
                <Field label="Recommended Actions (JSON array)"><textarea value={form.recommended_actions_json} onChange={e => setForm({...form, recommended_actions_json: e.target.value})} rows={2} className="cms-input font-mono text-xs" /></Field>
                <Field label="Suggested Learning Path"><input value={form.suggested_learning_path} onChange={e => setForm({...form, suggested_learning_path: e.target.value})} className="cms-input" /></Field>
                <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" /> Featured Article
                </label>
              </div>
              <div className="sticky bottom-0 bg-[#0d0d14]/95 backdrop-blur border-t border-white/10 px-6 py-4 flex justify-end gap-2">
                <button onClick={handleCancel} className="px-4 py-2 text-white/50 hover:text-white/80 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-medium px-4 py-2 rounded-xl text-sm disabled:opacity-50">
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-white/40 text-xs font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}