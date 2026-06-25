'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import aiInsightImg from '@/assets/ai_isngiht.jpg';
import { useAuthHydrated } from '@/hooks';
import {
  getPreview,
  getAnalysis,
  resumeActiveDataset,
  setActiveDatasetId,
  getDatasetName,
  type DatasetPayload,
  type AnalysisPayload,
} from '@/services/data';
import styles from './AIInsightsPanel.module.css';
import {
  ExecutiveSummary,
  QuickInsightCards,
  ComprehensiveDataSummary,
  FeatureImportanceAnalysis,
  AnomalyDetectionReport,
  BusinessRiskAssessment,
  DataStoryBoard,
  ProcessingSummary,
  ExportReportSection,
} from '../sections';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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
      setActiveDatasetId(data.dataset_id, data.original_filename);
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

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    try {
      setIsGeneratingPDF(true);
      
      // Allow state to update and apply print styles if needed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`AI_Insights_Report_${datasetId || 'data'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      setError('Failed to generate PDF report.');
    } finally {
      setIsGeneratingPDF(false);
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
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sticky Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeftSection}>
              <Image
                src={aiInsightImg}
                alt=""
                width={80}
                height={80}
                className={styles.headerArt}
                priority
              />
              <div>
                <h1 className={styles.headerTitle}>AI Insights</h1>
                <p className={styles.headerSubtitle}>
                  AI-generated business intelligence from your dataset
                  {payload?.original_filename ? ` · ${payload.original_filename}` : (datasetId ? ` · ${getDatasetName(datasetId)}` : '')}
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleGeneratePDF}
                disabled={loading || isGeneratingPDF}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h6" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
                {isGeneratingPDF ? 'Generating...' : 'Generate Report'}
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
          <div ref={reportRef} className={`${styles.reportContainer} ${isGeneratingPDF ? styles.pdfMode : ''}`}>
            {isGeneratingPDF && (
              <>
                <h1 className={styles.pdfTitle}>DataSense AI Insights Report</h1>
                {payload.original_filename && (
                  <p className={styles.pdfDatasetName}>Dataset: {payload.original_filename}</p>
                )}
                <p className={styles.pdfSubtitle}>Automated intelligence generated for your dataset</p>
              </>
            )}
            {analysis && (
              <>
                <DataStoryBoard payload={payload} analysis={analysis} />
                <ExecutiveSummary payload={payload} analysis={analysis} />
                <QuickInsightCards payload={payload} analysis={analysis} />
                <ComprehensiveDataSummary payload={payload} analysis={analysis} />
                <FeatureImportanceAnalysis analysis={analysis} />
                <AnomalyDetectionReport analysis={analysis} />
                <BusinessRiskAssessment analysis={analysis} />
                <ProcessingSummary payload={payload} analysis={analysis} />
                <div className={styles.noPrint}>
                  <ExportReportSection onGeneratePDF={handleGeneratePDF} isGenerating={isGeneratingPDF} />
                </div>
              </>
            )}
            {!analysis && (
              <>
                <DataStoryBoard payload={payload} />
                <ExecutiveSummary payload={payload} />
                <QuickInsightCards payload={payload} />
                <ProcessingSummary payload={payload} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
