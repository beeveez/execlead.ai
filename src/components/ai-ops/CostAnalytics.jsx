import React from "react";
import Panel, { StatRow } from "./Panel";
import { DollarSign } from "lucide-react";
import { fmtCost, fmtNum } from "@/lib/aiOperations";

export default function CostAnalytics({ analytics }) {
  const { totals, projection } = analytics;
  const avgPerRequest = totals.totalRequests ? totals.totalCost / totals.totalRequests : 0;
  const avgPerUser = analytics.byUser.length ? totals.totalCost / analytics.byUser.length : 0;
  const avgPerModule = analytics.byModule.length ? totals.totalCost / analytics.byModule.length : 0;
  return (
    <Panel title="Cost Analytics" icon={DollarSign}>
      <StatRow label="Today's Cost" value={fmtCost(totals.todayCost)} accent="text-emerald-400" />
      <StatRow label="Yesterday's Cost" value={fmtCost(totals.yesterdayCost)} />
      <StatRow label="Weekly Cost" value={fmtCost(totals.weekCost)} />
      <StatRow label="Monthly Cost" value={fmtCost(totals.monthCost)} accent="text-emerald-400" />
      <StatRow label="Projected Monthly Cost" value={fmtCost(projection.projectedMonthlyCost)} accent="text-purple-400" />
      <StatRow label="Projected Annual Cost" value={fmtCost(projection.projectedAnnualCost)} accent="text-pink-400" />
      <StatRow label="Average Cost / Request" value={fmtCost(avgPerRequest)} />
      <StatRow label="Average Cost / User" value={fmtCost(avgPerUser)} />
      <StatRow label="Average Cost / Module" value={fmtCost(avgPerModule)} />
    </Panel>
  );
}