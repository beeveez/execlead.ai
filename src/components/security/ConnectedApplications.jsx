import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Key, RefreshCw, Loader2, Check, X, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CONNECTOR_INFO = [
  { type: "airtable", name: "Airtable", scopes: ["data.records:read", "data.records:write"] },
  { type: "gmail", name: "Gmail", scopes: ["gmail.send", "email"] },
];

export default function ConnectedApplications() {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Static list based on known authorized connectors
    setConnections(CONNECTOR_INFO.map(c => ({ ...c, connected: true })));
    setLoading(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/80">Connected Applications</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {connections.map(conn => (
            <div key={conn.type} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/60 uppercase">
                {conn.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70 font-medium">{conn.name}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {conn.scopes.map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs ${conn.connected ? "text-emerald-400" : "text-white/30"}`}>
                {conn.connected ? <Check size={14} /> : <X size={14} />}
                {conn.connected ? "Connected" : "Not connected"}
              </div>
            </div>
          ))}
          <Link to="/connected-accounts" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2">
            <ExternalLink size={12} /> Manage connected accounts
          </Link>
        </div>
      )}
    </div>
  );
}