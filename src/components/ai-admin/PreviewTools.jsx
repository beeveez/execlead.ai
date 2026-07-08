import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { PlayCircle, Send, Loader2 } from "lucide-react";
import { AI_AGENTS } from "@/lib/aiAgents";

export default function PreviewTools() {
  const [prompt, setPrompt] = useState('');
  const [agentId, setAgentId] = useState('executive_chief_of_staff');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('aiWorkforce', { action: 'execute_task', agent_id: agentId, description: prompt });
      setResult(res.data?.result || 'No result returned');
    } catch (e) {
      setResult(`Error: ${e.response?.data?.error || e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Preview Tools</h2>
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
          <PlayCircle size={16} className="text-emerald-400" />
          Prompt Playground
        </div>
        <select
          value={agentId}
          onChange={e => setAgentId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
        >
          {AI_AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter a test prompt for the selected agent..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 resize-none"
        />
        <button
          onClick={handleTest}
          disabled={loading || !prompt.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-30 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? 'Executing...' : 'Test Agent'}
        </button>
        {result && (
          <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-lg p-3 max-h-64 overflow-y-auto">
            <pre className="text-white/60 text-xs whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}