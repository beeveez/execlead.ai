import React from "react";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { fmtCurrency, fmtNum } from "@/lib/enterpriseRoiEngine";

const PIE_COLORS = ["#6366f1", "#f97316", "#10b981", "#a855f7"];

function Chart({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">{title}</div>
      <div className="h-56">{children}</div>
    </div>
  );
}

export default function RoiCharts({ roi, inputs }) {
  const investmentVsValue = [1, 2, 3].map((y) => ({ year: `Year ${y}`, Investment: roi.annualPlatformInvestment * y, Value: roi.annualGrossValue * y }));
  const coverage = [{ name: "Current", leaders: roi.coverageCurrentLeaders }, { name: "With EXECLEAD", leaders: roi.coverageNewLeaders }];
  const assessment = [{ name: "Current", count: roi.currentAssessments }, { name: "New", count: roi.newAssessments }];
  const coaching = [{ name: "Current", leaders: roi.currentCoachingCapacity }, { name: "AI-Added", leaders: roi.aiCoachingCapacity }];
  const admin = [{ name: "Admin", hrs: roi.adminHoursSaved }, { name: "Reporting", hrs: roi.reportingHoursSaved }];
  const hiring = [{ name: "External Hires", count: roi.baselineExternalHires }, { name: "Avoided", count: roi.executiveHiringReduction }];
  const promotion = [{ name: "Internal Opportunity", leaders: roi.internalPromotionOpportunity }];
  const breakdown = [
    { name: "Productivity Value", value: roi.operationalProductivityValue },
    { name: "Hiring Savings", value: roi.executiveHiringSavings },
    { name: "Assessment Value", value: roi.assessmentValue },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Chart title="Investment vs Value (3-Year)">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={investmentVsValue}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="year" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="Investment" fill="#6366f1" /><Bar dataKey="Value" fill="#f97316" /></BarChart></ResponsiveContainer>
      </Chart>
      <Chart title="Leadership Coverage Growth">
        <ResponsiveContainer width="100%" height="100%"><AreaChart data={coverage}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Area dataKey="leaders" fill="#6366f1" stroke="#818cf8" /></AreaChart></ResponsiveContainer>
      </Chart>
      <Chart title="Assessment Capacity">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={assessment}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Bar dataKey="count" fill="#10b981" /></BarChart></ResponsiveContainer>
      </Chart>
      <Chart title="Executive Coaching Capacity">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={coaching}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Bar dataKey="leaders" fill="#a855f7" /></BarChart></ResponsiveContainer>
      </Chart>
      <Chart title="Administrative Time Saved (hrs)">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={admin}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Bar dataKey="hrs" fill="#f97316" /></BarChart></ResponsiveContainer>
      </Chart>
      <Chart title="Executive Hiring Comparison">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={hiring}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Bar dataKey="count" fill="#6366f1" /></BarChart></ResponsiveContainer>
      </Chart>
      <Chart title="Internal Promotion Opportunity">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={promotion}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={11} /><YAxis stroke="#94a3b8" fontSize={11} /><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Bar dataKey="leaders" fill="#10b981" /></BarChart></ResponsiveContainer>
      </Chart>
      <Chart title="Business Impact Breakdown">
        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 10, fill: "#94a3b8" }}>{breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20" }} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>
      </Chart>
    </div>
  );
}