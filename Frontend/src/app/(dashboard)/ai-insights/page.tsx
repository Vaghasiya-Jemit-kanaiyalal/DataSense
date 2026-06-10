import { Suspense } from 'react';
import { AIInsightsPanel } from '@/features/ai-insights';

export const metadata = {
  title: 'DataSense — AI Insights',
};

export default function AIInsightsPage() {
  return (
    <Suspense fallback={null}>
      <AIInsightsPanel />
    </Suspense>
  );
}
