import React, { useState, useEffect, useCallback } from "react";
import { Rocket, RefreshCw, LayoutDashboard, Users, Mail, Lightbulb, Megaphone, Users2, Heart, Sparkles, GraduationCap, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { computeBetaOperations } from "@/lib/betaOperationsEngine";
import { Spinner } from "@/components/beta-ops/Shared";
import OperationsDashboard from "@/components/beta-ops/OperationsDashboard";
import ApplicationReview from "@/components/beta-ops/ApplicationReview";
import InvitationManagement from "@/components/beta-ops/InvitationManagement";
import FeedbackHub from "@/components/beta-ops/FeedbackHub";
import ReleaseCohorts from "@/components/beta-ops/ReleaseCohorts";
import BetaHealthEngine from "@/components/beta-ops/BetaHealthEngine";
import BetaCopilot from "@/components/beta-ops/BetaCopilot";
import GraduationCenter from "@/components/beta-ops/GraduationCenter";
import ReportEngine from "@/components/beta-ops/ReportEngine";
import CommunicationCenter from "@/components/beta-ops/CommunicationCenter";
import ParticipantProfileDrawer from "@/components/beta-ops/ParticipantProfileDrawer";

const TABS = [
  { id: "dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
  { id: "review", label: "Application Review", icon: Users },
  { id: "invitations", label: "Invitations", icon: Mail },
  { id: "feedback", label: "Feedback Hub", icon: Lightbulb },
  { id: "cohorts", label: "Release Cohorts", icon: Users2 },
  { id: "health", label: "Beta Health Engine", icon: Heart },
  { id: "copilot", label: "EXEC™ Beta Copilot", icon: Sparkles },
  { id: "graduation", label: "Graduation Center", icon: GraduationCap },
  { id: "comms", label: "Communication Center", icon: Megaphone },
  { id: "reports", label: "Report Engine", icon: FileText },
];

export default function BetaOperationsCenter() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        base44.entities.BetaApplication.list("-created_date", 500),
        base44.entities.BetaInvitation.list("-created_date", 200),
        base44.entities.BetaCohort.list("-created_date", 100),
        base44.entities.BetaCommunication.list("-created_date", 100),
        base44.entities.TelemetryEvent.list("-created_date", 1000),
        base44.entities.ProductInsight.list("-created_date", 200),
        base44.entities.Feedback.list("-created_date", 200),
        base44.entities.LessonProgress.list("-updated_date", 500),
        base44.entities.UsageLog.list("-created_date", 500),
      ]);
      const resolve = (r) => (r.status === "fulfilled" ? r.value : []);
      const raw = {
        applications: resolve(results[0]),
        invitations: resolve(results[1]),
        cohorts: resolve(results[2]),
        communications: resolve(results[3]),
        telemetryEvents: resolve(results[4]),
        productInsights: resolve(results[5]),
        feedback: resolve(results[6]),
        lessonProgress: resolve(results[7]),
        usageLogs: resolve(results[8]),
      };
      setRawData(raw);
      setData(computeBetaOperations(raw));
    } catch {
      setData(computeBetaOperations({}));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Rocket size={22} className="text-indigo-400" />
              Beta Operations Center™
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Founding Private Beta Operations™ — complete lifecycle management from invitation through graduation to GA
            </p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-indigo-400 text-indigo-400" : "border-transparent text-white/40 hover:text-white/60"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <Spinner />
        ) : (
          <>
            {tab === "dashboard" && <OperationsDashboard data={data} />}
            {tab === "review" && <ApplicationReview data={data} onAction={fetchData} onOpenProfile={setProfileUser} />}
            {tab === "invitations" && <InvitationManagement invitations={data.invitationStats} onAction={fetchData} user={user} />}
            {tab === "feedback" && <FeedbackHub productInsights={rawData.productInsights} feedback={rawData.feedback} onAction={fetchData} user={user} />}
            {tab === "cohorts" && <ReleaseCohorts cohorts={rawData.cohorts} data={data} onAction={fetchData} user={user} />}
            {tab === "health" && <BetaHealthEngine data={data} />}
            {tab === "copilot" && <BetaCopilot data={data} />}
            {tab === "graduation" && <GraduationCenter data={data} />}
            {tab === "comms" && <CommunicationCenter communications={rawData.communications} onAction={fetchData} user={user} />}
            {tab === "reports" && <ReportEngine data={data} />}
          </>
        )}
      </div>

      {profileUser && <ParticipantProfileDrawer participant={profileUser} onClose={() => setProfileUser(null)} />}
    </div>
  );
}