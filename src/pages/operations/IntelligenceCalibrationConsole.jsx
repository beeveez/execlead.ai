import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CalibrationHeader from '@/components/calibration/CalibrationHeader';
import CalibrationKpis from '@/components/calibration/CalibrationKpis';
import CalibrationAlerts from '@/components/calibration/CalibrationAlerts';
import ConfidenceDistribution from '@/components/calibration/ConfidenceDistribution';
import BehaviorCalibrationTable from '@/components/calibration/BehaviorCalibrationTable';
import RecommendationUsefulness from '@/components/calibration/RecommendationUsefulness';
import PrivacyCalibration from '@/components/calibration/PrivacyCalibration';

export default function IntelligenceCalibrationConsole() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { base44.functions.invoke('getIntelligenceCalibration', {}).then((res) => setData(res.data)).catch(() => setError('Calibration intelligence is available to platform administrators only.')); }, []);
  if (error) return <div className="max-w-7xl mx-auto p-6 text-sm text-white/45">{error}</div>;
  if (!data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" /></div>;
  return <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5"><CalibrationHeader data={data} /><CalibrationKpis summary={data.summary} /><CalibrationAlerts alerts={data.alerts} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><ConfidenceDistribution distribution={data.confidenceDistribution} /><RecommendationUsefulness recommendations={data.recommendations} /></div><BehaviorCalibrationTable behaviors={data.behaviorCalibration} /><PrivacyCalibration privacy={data.privacy} cohorts={data.cohortVariance} /></div>;
}