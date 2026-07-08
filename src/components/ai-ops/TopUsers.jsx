import React from "react";
import Panel from "./Panel";
import { Users } from "lucide-react";
import { fmtNum, fmtCost } from "@/lib/aiOperations";

export default function TopUsers({ analytics }) {
  const users = analytics.byUser.slice(0, 10);
  if (users.length === 0) return null;
  return (
    <Panel title="Top AI Users" icon={Users}>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">User</th>
              <th className="text-left font-medium px-2">Organization</th>
              <th className="text-right font-medium px-2">Requests</th>
              <th className="text-right font-medium px-2">Tokens</th>
              <th className="text-right font-medium px-2">Cost</th>
              <th className="text-right font-medium px-2">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-2 px-2 text-white font-medium">{u.userName}</td>
                <td className="px-2 text-white/50">{u.organization || "—"}</td>
                <td className="text-right text-white/60 px-2">{fmtNum(u.requests)}</td>
                <td className="text-right text-white/60 px-2">{fmtNum(u.tokens)}</td>
                <td className="text-right text-emerald-400/80 px-2">{fmtCost(u.cost)}</td>
                <td className="text-right text-white/40 px-2">{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}