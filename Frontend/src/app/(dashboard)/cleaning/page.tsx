import { Suspense } from 'react';
import { CleaningPanel } from '@/features/cleaning';

export default function CleaningPage() {
  return (
    <Suspense fallback={null}>
      <CleaningPanel />
    </Suspense>
  );
}
