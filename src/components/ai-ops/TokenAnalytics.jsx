import React from "react";
import Panel, { StatRow } from "./Panel";
import { Coins } from "lucide-react";
import { fmtNum, fmtCost } from "@/lib/aiOperations";

export default function TokenAnalytics({ analytics }) {
  const { totals, projection, peakDay, lowDay } = analytics;
  return (
    <Panel title="Token Analytics" icon={Coins}>
      <StatRow label="Today's Tokens" value={fmtNum(totals.todayTokens)} accent="text-yellow-400" />
      <StatRow label="Yesterday's Tokens" value={fmtNum(totals.yesterdayTokens)} />
      <StatRow label="This Week" value={fmtNum(totals.weekTokens)} />
      <StatRow label="This Month" value={fmtNum(totals.monthTokens)} accent="text-cyan-400" />
      <StatRow label="Last Month" value={fmtNum(totals.lastMonthTokens)} />
      <StatRow label="Average Daily Tokens" value={fmtNum(projection.avgDailyTokens)} />
      <StatRow label="Peak Usage Day" value={peakDay ? new Date(peakDay.date).toLocaleDateString("en", { month: "short", day: "numeric" }) + ` (${fmtNum(peakDay.tokens)})` : "—"} accent="text-emerald-400" />
      <StatRow label="Lowest Usage Day" value={lowDay ? new Date(lowDay.date).toLocaleDateString("en", { month: "short", day: "numeric" }) + ` (${fmtNum(lowDay.tokens)})` : "—"} accent="text-white/50" />
    </Panel>
  );
}