import React, { useState, useMemo } from "react";
import { GitBranch, Database } from "lucide-react";
import { MIGRATIONS, searchMigrations, filterMigrations, validateAuditIntegrity, getCapability } from "@/lib/migrationLedgerEngine";
import MigrationFilters from "@/components/developer/migrations/MigrationFilters";
import MigrationCard from "@/components/developer/migrations/MigrationCard";
import AuditIntegrityBanner from "@/components/developer/migrations/AuditIntegrityBanner";

export default function MigrationHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [activeCerts, setActiveCerts] = useState([]);
  const [activeWorkspaces, setActiveWorkspaces] = useState([]);

  const integrity = useMemo(() => validateAuditIntegrity(), []);

  const filteredMigrations = useMemo(() => {
    let result = MIGRATIONS;
    if (searchQuery.trim()) {
      result = searchMigrations(searchQuery);
    }
    if (activeStatuses.length || activeCerts.length || activeWorkspaces.length) {
      const filteredIds = new Set(filterMigrations({ statuses: activeStatuses, certifications: activeCerts, workspaces: activeWorkspaces }).map((m) => m.migration_id));
      result = result.filter((m) => filteredIds.has(m.migration_id));
    }
    return result;
  }, [searchQuery, activeStatuses, activeCerts, activeWorkspaces]);

  const toggle = (list, setter, value) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleClear = () => {
    setSearchQuery("");
    setActiveStatuses([]);
    setActiveCerts([]);
    setActiveWorkspaces([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <GitBranch size={12} className="text-indigo-400" /> Developer · Engineering
        </div>
        <h1 className="text-2xl font-bold text-white">Migration History™</h1>
        <p className="text-white/40 text-xs mt-1">Engineering audit ledger — single source of truth for platform evolution.</p>
      </div>

      {/* Audit integrity */}
      <AuditIntegrityBanner integrity={integrity} />

      {/* Search + Filters */}
      <MigrationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStatuses={activeStatuses}
        onToggleStatus={(v) => toggle(activeStatuses, setActiveStatuses, v)}
        activeCerts={activeCerts}
        onToggleCert={(v) => toggle(activeCerts, setActiveCerts, v)}
        activeWorkspaces={activeWorkspaces}
        onToggleWorkspace={(v) => toggle(activeWorkspaces, setActiveWorkspaces, v)}
        onClear={handleClear}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-[11px]">
          {filteredMigrations.length} {filteredMigrations.length === 1 ? "migration" : "migrations"}
          {filteredMigrations.length !== MIGRATIONS.length && ` of ${MIGRATIONS.length}`}
        </span>
      </div>

      {/* Migration list */}
      {filteredMigrations.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Database size={28} className="text-white/20 mx-auto mb-3" />
          {MIGRATIONS.length === 0 ? (
            <p className="text-white/40 text-sm">No migrations have been applied yet.</p>
          ) : (
            <p className="text-white/40 text-sm">No migrations match the current filters.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMigrations.map((m) => (
            <MigrationCard key={m.migration_id} migration={m} />
          ))}
        </div>
      )}
    </div>
  );
}