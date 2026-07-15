import React from "react";

export default function BriefingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <div className="shimmer-bg rounded-2xl h-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="shimmer-bg rounded-xl h-32" />
        <div className="shimmer-bg rounded-xl h-32" />
        <div className="shimmer-bg rounded-xl h-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="shimmer-bg rounded-xl h-64" />
        <div className="shimmer-bg rounded-xl h-64" />
      </div>
      <div className="shimmer-bg rounded-xl h-40" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="shimmer-bg rounded-xl h-48" />
        <div className="shimmer-bg rounded-xl h-48" />
      </div>
      <div className="shimmer-bg rounded-xl h-32" />
    </div>
  );
}