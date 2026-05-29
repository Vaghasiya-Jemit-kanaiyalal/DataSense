'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './CleaningPanel.module.css';
import { useAuthHydrated } from '@/hooks';
import {
  cleanDataset,
  getActiveDatasetId,
  getPreview,
  resumeActiveDataset,
  setActiveDatasetId,
  undoStep,
  type DatasetPayload,
  type PipelineStepInfo,
} from '@/services/data';

const CHAIN_COLORS = ['orange', 'blue', 'green'] as const;
const PAGE_SIZE = 20;

function sumMissing(stats: DatasetPayload['statistics']) {
  return Object.values(stats).reduce((a, s) => a + (s.missing_count || 0), 0);
}

function sumOutliers(stats: DatasetPayload['statistics']) {
  return Object.values(stats).reduce((a, s) => a + (s.outliers || 0), 0);
}

export default function CleaningPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [stepHistory, setStepHistory] = useState<PipelineStepInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<number | null>(null);
  const hydrated = useAuthHydrated();

  const queryId = searchParams.get('datasetId');

  const datasetId = useMemo(() => {
    if (queryId) return Number(queryId);
    return resolvedId ?? getActiveDatasetId();
  }, [queryId, resolvedId]);

  const applyPayload = (data: DatasetPayload) => {
    setPayload(data);
    setStepHistory(data.pipeline_steps ?? []);
    setActiveDatasetId(data.dataset_id);
    setResolvedId(data.dataset_id);
  };

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreview(id, PAGE_SIZE, 1);
      applyPayload(data);
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
      if (resumed) {
        applyPayload(resumed);
        if (resumed.ml_ready === false && resumed.dataset_id) {
          await load(resumed.dataset_id);
        }
        router.replace(`/cleaning?datasetId=${resumed.dataset_id}`);
      }
    }
    init();
  }, [queryId, load, router, hydrated]);

  const runClean = async (body: Omit<Parameters<typeof cleanDataset>[0], 'dataset_id'>) => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cleanDataset({ dataset_id: datasetId, ...body });
      applyPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cleaning failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!datasetId || stepHistory.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await undoStep(datasetId);
      applyPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Undo failed');
    } finally {
      setLoading(false);
    }
  };

  const stats = payload
    ? [
        { label: 'Total Rows', value: payload.rows.toLocaleString(), tone: 'blue' },
        { label: 'Total Columns', value: String(payload.columns), tone: 'purple' },
        { label: 'Missing Values', value: String(sumMissing(payload.statistics)), tone: 'amber' },
        { label: 'Outliers', value: String(sumOutliers(payload.statistics)), tone: 'red' },
        { label: 'Numeric Columns', value: String(payload.numerical_columns.length), tone: 'teal' },
        { label: 'Categorical Columns', value: String(payload.categorical_columns.length), tone: 'green' },
      ]
    : [];

  const allColumns = payload
    ? [...payload.numerical_columns, ...payload.categorical_columns]
    : [];

  if (!datasetId && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Upload a dataset first, then return here to resume cleaning.</p>
          <button type="button" className={styles.finalizeButton} onClick={() => router.push('/upload')}>
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <h1>Data Cleaning</h1>
            <p>
              Inspect, clean, and prepare your dataset.
              {datasetId ? ` Dataset #${datasetId}` : ''}
              {loading ? ' · processing…' : ''}
            </p>
          </div>
        </section>

        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        {payload && (
          <>
            <section className={styles.statsGrid}>
              {stats.map((stat) => (
                <article key={stat.label} className={`${styles.statCard} ${styles[stat.tone]}`}>
                  <div><p>{stat.label}</p><strong>{stat.value}</strong></div>
                </article>
              ))}
            </section>

            <section className={styles.mainGrid}>
              <article className={styles.panel}>
                <h2>Columns Overview</h2>
                <div className={styles.list}>
                  {allColumns.map((name) => {
                    const colStats = payload.statistics[name];
                    const isNum = payload.numerical_columns.includes(name);
                    const missing = colStats?.missing_count ?? 0;
                    return (
                      <button
                        className={`${styles.rowButton} ${selectedColumn === name ? styles.rowSelected : ''}`}
                        type="button"
                        key={name}
                        onClick={() => setSelectedColumn(name)}
                      >
                        <span className={styles.rowText}>
                          <strong>{name}</strong>
                          <small className={isNum ? styles.blue : styles.green}>
                            {isNum ? 'Numeric' : 'Categorical'}
                          </small>
                        </span>
                        <span className={missing > 0 ? styles.alertText : styles.mutedText}>
                          {missing} missing
                          {isNum && colStats?.outliers ? ` · ${colStats.outliers} outliers` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className={styles.panel}>
                <h2>Cleaning Actions</h2>
                <div className={styles.list}>
                  <button
                    className={styles.rowButton}
                    type="button"
                    disabled={loading}
                    onClick={() => runClean({ action: 'drop_duplicates', strategy: 'auto' })}
                  >
                    <span className={styles.rowText}><strong>Drop Duplicates</strong></span>
                  </button>
                  <button
                    className={styles.rowButton}
                    type="button"
                    disabled={loading || !selectedColumn}
                    onClick={() =>
                      selectedColumn &&
                      runClean({ action: 'missing_values', strategy: 'mean', columns: [selectedColumn] })
                    }
                  >
                    <span className={styles.rowText}>
                      <strong>Handle Missing Values</strong>
                      <small>{selectedColumn ? `Mean · ${selectedColumn}` : 'Select a column'}</small>
                    </span>
                  </button>
                  <button
                    className={styles.rowButton}
                    type="button"
                    disabled={loading || !selectedColumn}
                    onClick={() =>
                      selectedColumn &&
                      runClean({ action: 'outliers', strategy: 'cap', columns: [selectedColumn] })
                    }
                  >
                    <span className={styles.rowText}>
                      <strong>Handle Outliers</strong>
                      <small>{selectedColumn || 'Select a column'}</small>
                    </span>
                  </button>
                  <button
                    className={styles.rowButton}
                    type="button"
                    disabled={loading || !selectedColumn}
                    onClick={() => {
                      if (!selectedColumn) return;
                      const oldVal = window.prompt('Value to replace:');
                      const newVal = window.prompt('Replace with:');
                      if (oldVal == null || newVal == null) return;
                      runClean({
                        action: 'replace_values',
                        columns: [selectedColumn],
                        old_value: oldVal,
                        new_value: newVal,
                      });
                    }}
                  >
                    <span className={styles.rowText}><strong>Replace Values</strong></span>
                  </button>
                </div>
              </article>

              <div className={styles.sideStack}>
                <article className={styles.panel}>
                  <div className={styles.controlHeader}>
                    <h2>Dataset Controls</h2>
                    <span>{stepHistory.length} Steps</span>
                  </div>
                  <div className={styles.controls}>
                    <div className={styles.controlRail} aria-label="Cleaning step chain">
                      {stepHistory.length === 0 ? (
                        <span className={styles.chainEmpty}>0</span>
                      ) : (
                        stepHistory.map((step, i) => (
                          <div key={step.step_index} className={styles.chainItem}>
                            <span className={styles[CHAIN_COLORS[i % 3]]}>{i + 1}</span>
                            {i < stepHistory.length - 1 && <i />}
                          </div>
                        ))
                      )}
                    </div>
                    <div className={styles.controlRight}>
                      <div className={styles.chainLabels}>
                        {stepHistory.length === 0 ? (
                          <p className={styles.chainHint}>Steps appear here as you clean (undo removes the last step only).</p>
                        ) : (
                          stepHistory.map((step) => (
                            <div key={step.step_index} className={styles.chainLabelRow}>
                              <strong>{step.label}</strong>
                              <small>{step.detail}</small>
                            </div>
                          ))
                        )}
                      </div>
                      <div className={styles.controlButtons}>
                      <button
                        className={styles.undoButton}
                        type="button"
                        disabled={loading || stepHistory.length === 0}
                        onClick={handleUndo}
                      >
                        Undo Last Step
                      </button>
                      <button
                        className={styles.downloadButton}
                        type="button"
                        onClick={() => router.push(`/preview?datasetId=${datasetId}`)}
                      >
                        Preview Data
                      </button>
                      <button
                        className={styles.finalizeButton}
                        type="button"
                        onClick={() => router.push(`/preview?datasetId=${datasetId}`)}
                      >
                        Finalize Dataset
                      </button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
