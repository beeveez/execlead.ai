import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useOperationalExcellence from '@/hooks/useOperationalExcellence';
import ScoreHero from '@/components/operational-excellence/ScoreHero';
import DmaicPipeline from '@/components/operational-excellence/DmaicPipeline';
import ProjectForm from '@/components/operational-excellence/ProjectForm';
import ProjectBoard from '@/components/operational-excellence/ProjectBoard';
import RootCauseForm from '@/components/operational-excellence/RootCauseForm';
import QualityControlPanel from '@/components/operational-excellence/QualityControlPanel';
import WastePanel from '@/components/operational-excellence/WastePanel';
import ImprovementActions from '@/components/operational-excellence/ImprovementActions';

export default function OperationalExcellence() {
  const { data, loading, error, run } = useOperationalExcellence(); const [showProject, setShowProject] = useState(false); const [analysisProject, setAnalysisProject] = useState(null); const [refreshing, setRefreshing] = useState(false);
  if (loading && !data) return <div className="p-8 text-sm text-white/40">Loading operational intelligence…</div>;
  if (error && !data) return <div className="p-8 text-sm text-rose-400">{error}</div>;
  const refresh = async () => { setRefreshing(true); try { await run('refreshMetrics'); } finally { setRefreshing(false); } };
  return <div className="mx-auto max-w-7xl space-y-7 p-4 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-[10px] uppercase tracking-widest text-white/30">Operations · Product Intelligence · Business Intelligence · Governance</div><h1 className="mt-1 text-2xl font-bold text-white">Operational Excellence™</h1><p className="mt-1 max-w-2xl text-sm text-white/40">Lean Six Sigma continuous improvement powered by existing EXECLEAD.AI intelligence and governance signals.</p></div><button onClick={() => setShowProject(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white"><Plus size={16} />New project</button></div><ScoreHero score={data.operationalScore} onRefresh={refresh} refreshing={refreshing} />{showProject && <ProjectForm onSubmit={async (project) => { await run('createProject', { project }); setShowProject(false); }} onCancel={() => setShowProject(false)} />}<DmaicPipeline projects={data.projects} /><ProjectBoard projects={data.activeProjects} analyses={data.analyses} onMeasure={(project) => run('captureBaseline', { projectId: project.projectId, baselineValue: project.baselineValue })} onAnalyze={setAnalysisProject} onApprove={(analysis) => run('approveRootCause', { analysisId: analysis.id })} onGenerate={(analysis) => run('generateActions', { analysisId: analysis.analysisId })} />{analysisProject && <RootCauseForm project={analysisProject} onSubmit={async (analysis) => { await run('createRootCause', { analysis }); setAnalysisProject(null); }} onCancel={() => setAnalysisProject(null)} />}<QualityControlPanel metrics={data.metrics} alerts={data.qualityAlerts} /><WastePanel hotspots={data.wasteHotspots} projects={data.projects} onSubmit={(waste) => run('tagWaste', { waste })} /><ImprovementActions actions={data.improvements} /></div>;
}