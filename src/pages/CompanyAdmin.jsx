import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { calculateQualityScore, COMPANY_CATEGORIES, COMPANY_STATUSES, exportCompanies, logAudit, saveVersionSnapshot } from "@/lib/companyAdmin";
import CompanyForm from "@/components/company-admin/CompanyForm";
import ImportModal from "@/components/company-admin/ImportModal";
import VersionHistory from "@/components/company-admin/VersionHistory";
import { Building2, Plus, Upload, Download, Search, Edit2, Copy, Archive, RotateCcw, Trash2, History, Loader2, Database, X, CheckCircle, Clock, Globe, Briefcase, FileText, AlertTriangle, ChevronDown } from "lucide-react";
import CompanyLogo from "@/components/companies/CompanyLogo";
import LogoReliabilityDashboard from "@/components/company-admin/LogoReliabilityDashboard";
import LogoRepairPanel from "@/components/company-admin/LogoRepairPanel";
import { assessLogoStatusSync } from "@/lib/companyLogo";

const StatusBadge = ({ status }) => {
  const s = status || "approved";
  const colors = { draft: "bg-blue-500/10 text-blue-400", review: "bg-amber-500/10 text-amber-400", approved: "bg-emerald-500/10 text-emerald-400", archived: "bg-slate-500/10 text-slate-400" };
  return <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${colors[s] || colors.approved}`}>{s}</span>;
};

const QualityBar = ({ score }) => (
  <div className="flex items-center gap-2">
    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${score >= 90 ? "bg-emerald-500" : score >= 80 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} /></div>
    <span className="text-xs text-white/60">{score}%</span>
  </div>
);

export default function CompanyAdmin() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fIndustry, setFIndustry] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fQuality, setFQuality] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [historyCo, setHistoryCo] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [exportMenu, setExportMenu] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [repairCompany, setRepairCompany] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUserName(u?.full_name || u?.email || "Admin")).catch(() => {});
  }, []);

  const loadCompanies = useCallback(async () => {
    try { const list = await base44.entities.Company.list("-updated_date", 1000); setCompanies(list); } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const stats = useMemo(() => ({
    total: companies.length,
    industries: new Set(companies.map(c => c.industry).filter(Boolean)).size,
    countries: new Set(companies.map(c => c.country).filter(Boolean)).size,
    active: companies.filter(c => !c.status || c.status === "approved").length,
    archived: companies.filter(c => c.status === "archived").length,
    pending: companies.filter(c => c.status === "review").length,
    drafts: companies.filter(c => c.status === "draft").length,
    needsImprovement: companies.filter(c => (c.quality_score || 0) < 80).length,
  }), [companies]);

  const countries = useMemo(() => [...new Set(companies.map(c => c.country).filter(Boolean))].sort(), [companies]);

  const filtered = useMemo(() => companies.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      if (![c.name, c.industry, c.country, c.ceo, c.tags?.join(" ")].some(v => String(v || "").toLowerCase().includes(q))) return false;
    }
    if (fIndustry && c.industry !== fIndustry) return false;
    if (fCountry && c.country !== fCountry) return false;
    if (fStatus && (c.status || "approved") !== fStatus) return false;
    if (fQuality === "needs" && (c.quality_score || 0) >= 80) return false;
    if (fQuality === "good" && ((c.quality_score || 0) < 80 || (c.quality_score || 0) >= 90)) return false;
    if (fQuality === "excellent" && (c.quality_score || 0) < 90) return false;
    return true;
  }), [companies, search, fIndustry, fCountry, fStatus, fQuality]);

  const handleSave = async (data) => {
    const isArchived = data.status === "archived";
    const logoAssessment = assessLogoStatusSync(data.logo_url);
    const payload = { ...data, is_archived: isArchived, quality_score: calculateQualityScore(data), logo_status: logoAssessment.status, logo_error: logoAssessment.error };
    if (editing) {
      await saveVersionSnapshot(editing, userName, `Version ${editing.version_number || 1} before edit`);
      const { id, created_date, updated_date, created_by_id, ...updateData } = payload;
      const updated = await base44.entities.Company.update(editing.id, { ...updateData, version_number: (editing.version_number || 1) + 1 });
      setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
      await logAudit("update", updated, editing, updated, userName);
    } else {
      const created = await base44.entities.Company.create({ ...payload, version_number: 1 });
      setCompanies(prev => [created, ...prev]);
      await logAudit("create", created, null, created, userName);
    }
    setShowForm(false); setEditing(null);
  };

  const handleDuplicate = async (company) => {
    const { id, created_date, updated_date, created_by_id, version_number, ...rest } = company;
    const dup = await base44.entities.Company.create({ ...rest, name: company.name + " (Copy)", status: "draft", version_number: 1 });
    setCompanies(prev => [dup, ...prev]);
    await logAudit("duplicate", dup, company, dup, userName, `Duplicated from ${company.name}`);
  };

  const handleArchive = async (company) => {
    const updated = await base44.entities.Company.update(company.id, { status: "archived", is_archived: true });
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    await logAudit("archive", updated, company, updated, userName);
  };

  const handleRestore = async (company) => {
    const updated = await base44.entities.Company.update(company.id, { status: "approved", is_archived: false });
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    await logAudit("restore", updated, company, updated, userName);
  };

  const handleDelete = async (company) => {
    if (!confirm(`Permanently delete "${company.name}"? This cannot be undone.`)) return;
    await base44.entities.Company.delete(company.id);
    setCompanies(prev => prev.filter(c => c.id !== company.id));
    await logAudit("delete", company, company, null, userName);
  };

  const handleRestoreVersion = async (snapshot, company) => {
    const data = JSON.parse(snapshot.snapshot_json);
    await saveVersionSnapshot(company, userName, `Version ${company.version_number || 1} before restore`);
    const { id, created_date, updated_date, created_by_id, ...updateData } = data;
    const updated = await base44.entities.Company.update(company.id, { ...updateData, version_number: (company.version_number || 1) + 1 });
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    await logAudit("restore_version", updated, company, updated, userName, `Restored version ${snapshot.version_number}`);
    setHistoryCo(null);
  };

  const loadAuditLogs = async () => {
    try { const logs = await base44.entities.CompanyAuditLog.list("-created_date", 50); setAuditLogs(logs); } catch (e) {}
    setShowAudit(true);
  };

  const STAT_CARDS = [
    { label: "Total Companies", value: stats.total, icon: Building2, color: "text-indigo-400" },
    { label: "Industries", value: stats.industries, icon: Briefcase, color: "text-cyan-400" },
    { label: "Countries", value: stats.countries, icon: Globe, color: "text-emerald-400" },
    { label: "Active", value: stats.active, icon: CheckCircle, color: "text-green-400" },
    { label: "Archived", value: stats.archived, icon: Archive, color: "text-slate-400" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-400" },
    { label: "Drafts", value: stats.drafts, icon: FileText, color: "text-blue-400" },
    { label: "Needs Improvement", value: stats.needsImprovement, icon: AlertTriangle, color: "text-red-400" },
  ];

  const selectClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2"><Database size={12} className="text-indigo-400" /> Company Intelligence Admin</div>
          <h1 className="text-2xl font-bold text-white">Company Management System</h1>
          <p className="text-white/40 text-sm mt-1">Manage the library that powers AI personalization across all modules</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAuditLogs} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm"><History size={14} /> Audit Log</button>
          <div className="relative">
            <button onClick={() => setExportMenu(!exportMenu)} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm"><Download size={14} /> Export <ChevronDown size={12} /></button>
            {exportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-[#0d0d14] border border-white/10 rounded-lg shadow-2xl z-50 p-1">
                  <button onClick={() => { exportCompanies(filtered, "csv"); setExportMenu(false); }} className="w-full text-left px-3 py-1.5 rounded text-sm text-white/60 hover:bg-white/5">CSV</button>
                  <button onClick={() => { exportCompanies(filtered, "json"); setExportMenu(false); }} className="w-full text-left px-3 py-1.5 rounded text-sm text-white/60 hover:bg-white/5">JSON</button>
                  <button onClick={() => { exportCompanies(filtered, "pdf"); setExportMenu(false); }} className="w-full text-left px-3 py-1.5 rounded text-sm text-white/60 hover:bg-white/5">PDF Summary</button>
                </div>
              </>
            )}
          </div>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm"><Upload size={14} /> Import</button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium"><Plus size={14} /> New Company</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><s.icon size={16} className={s.color} /><span className="text-xl font-bold text-white">{s.value}</span></div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <LogoReliabilityDashboard companies={companies} onUpdated={loadCompanies} onRepair={setRepairCompany} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, industry, country, CEO, tags..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        </div>
        <select value={fIndustry} onChange={e => setFIndustry(e.target.value)} className={selectClass}><option value="">All Industries</option>{COMPANY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={fCountry} onChange={e => setFCountry(e.target.value)} className={selectClass}><option value="">All Countries</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className={selectClass}><option value="">All Statuses</option>{COMPANY_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
        <select value={fQuality} onChange={e => setFQuality(e.target.value)} className={selectClass}><option value="">All Quality</option><option value="needs">Needs Improvement</option><option value="good">Good (80-89%)</option><option value="excellent">Excellent (90%+)</option></select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center"><Building2 size={24} className="mx-auto text-white/20 mb-2" /><p className="text-white/30 text-sm">No companies match your filters.</p></div>
      ) : (
        <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]"><tr>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Company</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Industry</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Country</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Quality</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Updated</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => {
                const isArchived = c.status === "archived";
                return (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link to={`/companies/${c.id}`} className="flex items-center gap-2">
                        <CompanyLogo company={c} size="xs" showSkeleton={false} />
                        <span className="text-white/80 font-medium hover:text-indigo-400">{c.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/50">{c.industry || "—"}</td>
                    <td className="px-4 py-3 text-white/50">{c.country || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><QualityBar score={c.quality_score || 0} /></td>
                    <td className="px-4 py-3 text-white/30 text-xs">{new Date(c.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-white/30 hover:text-indigo-400" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDuplicate(c)} className="p-1.5 text-white/30 hover:text-cyan-400" title="Duplicate"><Copy size={14} /></button>
                        <button onClick={() => setHistoryCo(c)} className="p-1.5 text-white/30 hover:text-amber-400" title="Version History"><History size={14} /></button>
                        {isArchived ? (
                          <button onClick={() => handleRestore(c)} className="p-1.5 text-white/30 hover:text-emerald-400" title="Restore"><RotateCcw size={14} /></button>
                        ) : (
                          <button onClick={() => handleArchive(c)} className="p-1.5 text-white/30 hover:text-amber-400" title="Archive"><Archive size={14} /></button>
                        )}
                        <button onClick={() => handleDelete(c)} className="p-1.5 text-white/30 hover:text-red-400" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <CompanyForm company={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
      {showImport && <ImportModal existingCompanies={companies} userName={userName} onComplete={loadCompanies} onClose={() => setShowImport(false)} />}
      {historyCo && <VersionHistory company={historyCo} onRestore={(v) => handleRestoreVersion(v, historyCo)} onClose={() => setHistoryCo(null)} />}
      {repairCompany && <LogoRepairPanel company={repairCompany} onUpdated={(updated) => { setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c)); }} onClose={() => setRepairCompany(null)} />}

      {showAudit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAudit(false)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5"><h3 className="text-lg font-bold text-white">Audit Log</h3><button onClick={() => setShowAudit(false)} className="text-white/30 hover:text-white/60"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto p-5">
              {auditLogs.length === 0 ? <p className="text-white/30 text-sm text-center py-8">No audit logs yet.</p> : (
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 capitalize">{log.action.replace("_", " ")}</span><span className="text-white/70 text-sm">{log.entity_name || "—"}</span></div>
                        <div className="text-xs text-white/30">{log.performed_by_name} · {new Date(log.created_date).toLocaleString()}</div>
                        {log.details && <div className="text-xs text-white/40 mt-1">{log.details}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}