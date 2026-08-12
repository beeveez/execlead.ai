import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FoundingCalibrationHeader from '@/components/founding-calibration/FoundingCalibrationHeader';
import FoundingCalibrationKpis from '@/components/founding-calibration/FoundingCalibrationKpis';
import ConfidenceAdjustments from '@/components/founding-calibration/ConfidenceAdjustments';
import SignalReliabilityMatrix from '@/components/founding-calibration/SignalReliabilityMatrix';
import PredictorStabilityReport from '@/components/founding-calibration/PredictorStabilityReport';
import BenchmarkReadiness from '@/components/founding-calibration/BenchmarkReadiness';
import ManualMismatchReview from '@/components/founding-calibration/ManualMismatchReview';

export default function FoundingCohortCalibration() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const load = useCallback(() => { setError(''); base44.functions.invoke('getIntelligenceCalibration', { mode: 'founding' }).then((res) => setData(res.data)).catch(() => setError('Founding Cohort calibration is available to platform administrators only.')); }, []);
  useEffect(() => { load(); }, [load]);
  if (error) return <div className="max-w-7xl mx-auto p-6 text-sm text-white/45">{error}</div>;
  if (!data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-400" /></div>;
  return <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5"><FoundingCalibrationHeader data={data} /><FoundingCalibrationKpis data={data} /><ConfidenceAdjustments adjustments={data.confidenceThresholdAdjustments} bands={data.reflectionBands} /><SignalReliabilityMatrix rows={data.reliabilityMatrix} /><PredictorStabilityReport stability={data.predictorStability} paths={data.recommendationCompletionByPath} /><BenchmarkReadiness benchmark={data.benchmarkDistribution} enterprise={data.enterpriseReadiness} /><ManualMismatchReview items={data.manualReviewQueue} onSaved={load} /></div>;
}