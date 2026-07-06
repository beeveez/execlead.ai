import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Network, Loader2, Building2 } from "lucide-react";

export default function OrganizationAdmin() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Organization.list("-created_date", 50)
      .then(setOrgs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Network size={12} className="text-indigo-400" /> System
        </div>
        <h1 className="text-2xl font-bold text-white">Organization Admin</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {orgs.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-white/30 text-sm bg-white/[0.02] border border-white/5 rounded-xl">No organizations found</div>
        ) : (
          orgs.map(org => (
            <div key={org.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-indigo-400" />
                <span className="text-white/80 text-sm font-medium">{org.name || "Unnamed"}</span>
              </div>
              <div className="text-white/30 text-xs">{org.industry || "—"}</div>
              <div className="text-white/20 text-xs mt-1">{org.employee_count || 0} employees</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}