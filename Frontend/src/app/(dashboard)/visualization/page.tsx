import { Suspense } from 'react';
import { VisualizationPanel } from '@/features/visualization';

export default function VisualizationPage() {
  return (
    <Suspense fallback={null}>
      <VisualizationPanel />
    </Suspense>
  );
}
