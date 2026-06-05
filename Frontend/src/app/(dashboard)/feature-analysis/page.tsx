import { Suspense } from 'react';
import { FeatureAnalysisPanel } from '@/features/feature-analysis';

export default function FeatureAnalysisPage() {
  return (
    <Suspense fallback={null}>
      <FeatureAnalysisPanel />
    </Suspense>
  );
}
