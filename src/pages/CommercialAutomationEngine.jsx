import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FounderDailyActions from "@/components/commercial-automation/FounderDailyActions";
import TaskQueue from "@/components/commercial-automation/TaskQueue";
import AutomationRules from "@/components/commercial-automation/AutomationRules";
import CommercialHealth from "@/components/commercial-automation/CommercialHealth";
import ExecPanel from "@/components/commercial-automation/ExecPanel";
import { Sunrise, ListChecks, Settings2, Heart, Sparkles, Zap } from "lucide-react";

export default function CommercialAutomationEngine() {
  const [tab, setTab] = useState("daily");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Zap size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Commercial Automation Engine™</h1>
            <p className="text-xs text-white/40">Transform commercial intelligence into operational execution.</p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/[0.02] border border-white/5 p-1 h-auto flex-wrap">
          <TabsTrigger value="daily" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50 text-xs px-3 py-1.5 rounded-lg"><Sunrise size={13} /> Daily Actions</TabsTrigger>
          <TabsTrigger value="queue" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50 text-xs px-3 py-1.5 rounded-lg"><ListChecks size={13} /> Task Queue</TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50 text-xs px-3 py-1.5 rounded-lg"><Settings2 size={13} /> Automation Rules</TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50 text-xs px-3 py-1.5 rounded-lg"><Heart size={13} /> Commercial Health</TabsTrigger>
          <TabsTrigger value="exec" className="gap-1.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50 text-xs px-3 py-1.5 rounded-lg"><Sparkles size={13} /> EXEC™</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6"><FounderDailyActions /></TabsContent>
        <TabsContent value="queue" className="mt-6"><TaskQueue /></TabsContent>
        <TabsContent value="rules" className="mt-6"><AutomationRules /></TabsContent>
        <TabsContent value="health" className="mt-6"><CommercialHealth /></TabsContent>
        <TabsContent value="exec" className="mt-6"><ExecPanel /></TabsContent>
      </Tabs>
    </div>
  );
}