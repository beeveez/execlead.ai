import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Building2, AlertCircle } from "lucide-react";
import CommercialKPIs from "@/components/commercial/CommercialKPIs";
import CommercialFunnel from "@/components/commercial/CommercialFunnel";
import GrowthIntelligence from "@/components/commercial/GrowthIntelligence";
import RevenueIntelligence from "@/components/commercial/RevenueIntelligence";
import FounderInsights from "@/components/commercial/FounderInsights";
import CommercialAlerts from "@/components/commercial/CommercialAlerts";
import CommercialAI from "@/components/commercial/CommercialAI";

export default function CommercialCommandCenter() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("commercialIntelligence", {});
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load commercial intelligence data");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/60 text-sm max-w-md text-center">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Commercial Command Center</h1>
            <p className="text-white/40 text-sm">EXECLEAD Commercial Intelligence™ — Airtable CRM data source</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">{data.meta?.recordCount || 0} records synced</span>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="command" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="command">Command Center</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>
        <TabsContent value="command" className="mt-6"><CommercialKPIs kpis={data.kpis} /></TabsContent>
        <TabsContent value="funnel" className="mt-6"><CommercialFunnel funnel={data.funnel} /></TabsContent>
        <TabsContent value="growth" className="mt-6"><GrowthIntelligence growth={data.growth} /></TabsContent>
        <TabsContent value="revenue" className="mt-6"><RevenueIntelligence revenue={data.revenue} kpis={data.kpis} /></TabsContent>
        <TabsContent value="insights" className="mt-6"><FounderInsights data={data} /></TabsContent>
        <TabsContent value="alerts" className="mt-6"><CommercialAlerts alerts={data.alerts} /></TabsContent>
        <TabsContent value="ai" className="mt-6"><CommercialAI data={data} /></TabsContent>
      </Tabs>
    </div>
  );
}