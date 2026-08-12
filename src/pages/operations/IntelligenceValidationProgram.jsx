import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ValidationHeader from '@/components/validation/ValidationHeader';
import ValidationKpis from '@/components/validation/ValidationKpis';
import OutcomeAlignmentTable from '@/components/validation/OutcomeAlignmentTable';
import ValidationInsights from '@/components/validation/ValidationInsights';
import OutcomeCoverage from '@/components/validation/OutcomeCoverage';

export default function IntelligenceValidationProgram() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { base44.functions.invoke('getIntelligenceValidation', {}).then((res) => setData(res.data)).catch(() => setError('Validation intelligence is available to platform administrators only.')); }, []);
  if (error) return <div className="max-w-7xl mx-auto p-6 text-sm text-white/45">{error}</div>;
  if (!data) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-400" /></div>;
  return <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5"><ValidationHeader data={data} /><ValidationKpis summary={data.summary} /><ValidationInsights data={data} /><OutcomeAlignmentTable correlations={data.correlations} /><OutcomeCoverage outcomes={data.outcomeTracking} /></div>;
}