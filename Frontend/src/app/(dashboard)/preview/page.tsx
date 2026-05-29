import { Suspense } from 'react';
import { PreviewPanel } from '@/features/preview';

export default function DatasetPreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPanel />
    </Suspense>
  );
}
