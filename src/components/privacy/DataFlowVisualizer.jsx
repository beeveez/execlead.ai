import React, { useState } from "react";
import { ArrowDown, Lock, Database, Eye, Clock, Shield, FileText } from "lucide-react";
import { DATA_FLOW_NODES } from "@/lib/privacyEngine";

export default function DataFlowVisualizer() {
  const [selected, setSelected] = useState(DATA_FLOW_NODES[0].id);
  const node = DATA_FLOW_NODES.find((n) => n.id === selected);

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database size={18} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Data Flow Visualizer™</h3>
        </div>

        {/* Flow Diagram */}
        <div className="flex flex-col items-center gap-1">
          {DATA_FLOW_NODES.map((n, i) => (
            <React.Fragment key={n.id}>
              <button
                onClick={() => setSelected(n.id)}
                className={`w-full max-w-xs px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  selected === n.id
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                {n.label}
              </button>
              {i < DATA_FLOW_NODES.length - 1 && <ArrowDown size={14} className="text-white/20" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Node Detail */}
      {node && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">{node.label}</h3>
          <p className="text-white/40 text-xs mb-4">{node.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: Database, label: 'Collected Data', value: node.collected },
              { icon: FileText, label: 'Purpose', value: node.purpose },
              { icon: Clock, label: 'Retention', value: node.retention },
              { icon: Lock, label: 'Encryption', value: node.encryption },
              { icon: Eye, label: 'Access Control', value: node.access },
              { icon: Shield, label: 'Lawful Basis', value: node.lawful_basis },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2 px-3 py-2.5 bg-white/[0.02] rounded-lg">
                <item.icon size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white/30 text-[10px] uppercase tracking-wider">{item.label}</div>
                  <div className="text-white/60 text-xs mt-0.5">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}