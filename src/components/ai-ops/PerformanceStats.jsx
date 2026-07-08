import React from "react";
import Panel, { StatRow } from "./Panel";
import { Gauge } from "lucide-react";
import { fmtMs } from "@/lib/aiOperations";

export default function PerformanceStats({ analytics }) {
  const { latency } = analytics;
  return (
    <Panel title="AI Performance" icon={Gauge}>
      <StatRow label="Average Response Time" value={fmtMs(latency.avg)} accent="text-blue-400" />
      <StatRow label="Median Response Time" value={fmtMs(latency.median)} />
      <StatRow label="95th Percentile" value={fmtMs(latency.p95)} accent="text-amber-400" />
      <StatRow label="99th Percentile" value={fmtMs(latency.p99)} accent="text-orange-400" />
      <StatRow label="Fastest Response" value={fmtMs(latency.fastest)} accent="text-emerald-400" />
      <StatRow label="Slowest Response" value={fmtMs(latency.slowest)} accent="text-red-400" />
    </Panel>
  );
}