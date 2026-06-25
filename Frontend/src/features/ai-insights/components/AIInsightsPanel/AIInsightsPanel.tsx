'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardFooter } from '@/components/layout';
import { useAuthHydrated } from '@/hooks';
import {
  getPreview,
  getAnalysis,
  resumeActiveDataset,
  setActiveDatasetId,
  type DatasetPayload,
  type AnalysisPayload,
} from '@/services/data';
import styles from './AIInsightsPanel.module.css';
import {
  ExecutiveSummary,
  QuickInsightCards,
  AIRecommendations,
  FeatureImportanceAnalysis,
  AnomalyDetectionReport,
  BusinessRiskAssessment,
  AInarrativeReport,
  ProcessingSummary,
  ExportReportSection,
} from '../sections';

const INSIGHTS_ROWS = 500;

export default function AIInsightsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthHydrated();
  const queryId = searchParams.get('datasetId');

  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<number | null>(null);

  const datasetId = useMemo(() => {
    if (queryId) return Number(queryId);
    return resolvedId;
  }, [queryId, resolvedId]);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const [data, analysisData] = await Promise.all([
        getPreview(id, INSIGHTS_ROWS, 1),
        getAnalysis(id).catch(() => null),
      ]);
      setPayload(data);
      setAnalysis(analysisData);
      setActiveDatasetId(data.dataset_id);
      setResolvedId(data.dataset_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    async function init() {
      if (queryId) {
        await load(Number(queryId));
        return;
      }
      const resumed = await resumeActiveDataset();
      if (resumed?.dataset_id) {
        setResolvedId(resumed.dataset_id);
        router.replace(`/ai-insights?datasetId=${resumed.dataset_id}`);
      }
    }
    init();
  }, [queryId, load, router, hydrated]);

  const handleRefresh = () => {
    if (datasetId) {
      load(datasetId);
    }
  };

  if (!datasetId && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.muted}>Upload and clean a dataset first to generate AI insights.</p>
          <button type="button" className={styles.primaryBtn} onClick={() => router.push('/upload')}>
            Go to Upload
          </button>
        </div>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sticky Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.headerTitle}>AI Insights</h1>
              <p className={styles.headerSubtitle}>AI-generated business intelligence from your dataset</p>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleRefresh}
                disabled={loading}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M13.5 2.5L12 1m0 0L13.5 2.5m-1.5-1L12 4m1 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
                Refresh Insights
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h6" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
        </header>

        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        {loading && !payload && (
          <div className={styles.loadingState}>
            <p>Analyzing your dataset...</p>
          </div>
        )}

        {payload && (
          <>
            {analysis && (
              <>
                <ExecutiveSummary payload={payload} analysis={analysis} />
                <QuickInsightCards payload={payload} analysis={analysis} />
                <AIRecommendations analysis={analysis} />
                <FeatureImportanceAnalysis analysis={analysis} />
                <AnomalyDetectionReport analysis={analysis} />
                <BusinessRiskAssessment analysis={analysis} />
                <AInarrativeReport analysis={analysis} />
                <ProcessingSummary payload={payload} analysis={analysis} />
                <ExportReportSection />
              </>
            )}
            {!analysis && (
              <>
                <ExecutiveSummary payload={payload} />
                <QuickInsightCards payload={payload} />
                <ProcessingSummary payload={payload} />
              </>
            )}
          </>
        )}
      </div>
      <DashboardFooter />
    </div>
  );
}
