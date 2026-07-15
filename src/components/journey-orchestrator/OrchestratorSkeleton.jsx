import React from "react";

export default function OrchestratorSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-pulse">
      <div className="h-32 bg-white/5 border border-white/5 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-28 bg-white/5 border border-white/5 rounded-xl" />
          <div className="h-40 bg-white/5 border border-white/5 rounded-xl" />
          <div className="h-32 bg-white/5 border border-white/5 rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="h-28 bg-white/5 border border-white/5 rounded-xl" />
          <div className="h-28 bg-white/5 border border-white/5 rounded-xl" />
          <div className="h-28 bg-white/5 border border-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}