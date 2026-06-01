'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import dataProcessingImg from '@/assets/data-processing.png';
import styles from './CleaningPanel.module.css';
import { useAuthHydrated } from '@/hooks';
import {
  cleanDataset,
  finalizeDataset,
  getActiveDatasetId,
  getPreview,
  resumeActiveDataset,
  setActiveDatasetId,
  undoStep,
  type DatasetPayload,
  type PipelineStepInfo,
} from '@/services/data';
import { CleaningPreviewModal } from '../CleaningPreviewModal';
import { getColumnStatus, totalCellCount } from '../../utils/columnStatus';
import { downloadDatasetCsv } from '../../utils/downloadCsv';

const CHAIN_COLORS = ['orange', 'blue', 'green'] as const;
const PAGE_SIZE = 20;

function sumMissing(stats: DatasetPayload['statistics']) {
  return Object.values(stats).reduce((a, s) => a + (s.missing_count || 0), 0);
}

function sumOutliers(stats: DatasetPayload['statistics']) {
  return Object.values(stats).reduce((a, s) => a + (s.outliers || 0), 0);
}

function isBooleanLike(name: string, statistics: DatasetPayload['statistics']) {
  const u = statistics[name]?.unique_count ?? 0;
  return u > 0 && u <= 2;
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
  const [showPreview, setShowPreview] = useState(false);
  const hydrated = useAuthHydrated();

  const queryId = searchParams.get('datasetId');

  const datasetId = useMemo(() => {
    if (queryId) return Number(queryId);
    return resolvedId ?? getActiveDatasetId();
  }, [queryId, resolvedId]);

  const isLocked = Boolean(payload?.finalized || payload?.pipeline_locked);

  const applyPayload = (data: DatasetPayload) => {
    setPayload(data);
    setStepHistory(data.pipeline_steps ?? []);
    setActiveDatasetId(data.dataset_id);
    setResolvedId(data.dataset_id);
  };

  useEffect(() => {
    if (payload?.finalized && datasetId) {
      router.replace(`/visualization?datasetId=${datasetId}`);
    }
  }, [payload?.finalized, datasetId, router]);

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

  const handleFinalize = async () => {
    if (!datasetId || isLocked) return;
    if (!window.confirm('Finalize this dataset? The cleaning pipeline will be locked and you will continue to Visualization.')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await finalizeDataset(datasetId);
      router.replace(`/visualization?datasetId=${datasetId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Finalize failed');
    } finally {
      setLoading(false);
    }
  };

  const runClean = async (body: Omit<Parameters<typeof cleanDataset>[0], 'dataset_id'>) => {
    if (!datasetId || isLocked) return;
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
    if (!datasetId || stepHistory.length === 0 || isLocked) return;
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
        { label: 'Columns', value: String(payload.columns), tone: 'purple', icon: 'columns' },
        { label: 'Total Values', value: totalCellCount(payload.rows, payload.columns).toLocaleString(), tone: 'blue', icon: 'values' },
        { label: 'Missing Values', value: String(sumMissing(payload.statistics)), tone: 'amber', icon: 'missing' },
        { label: 'Outliers', value: String(sumOutliers(payload.statistics)), tone: 'red', icon: 'outliers' },
        { label: 'Numeric', value: String(payload.numerical_columns.length), tone: 'blue', icon: 'numeric' },
        { label: 'Categorical', value: String(payload.categorical_columns.length), tone: 'green', icon: 'categorical' },
      ]
    : [];

  const allColumns = payload
    ? [...payload.numerical_columns, ...payload.categorical_columns]
    : [];

  const selectedIsCategorical = selectedColumn && payload
    ? payload.categorical_columns.includes(selectedColumn)
    : false;

  if (!datasetId && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Upload a dataset first, then return here to resume cleaning.</p>
          <button type="button" className={styles.finalizeBtn} onClick={() => router.push('/upload')}>
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
          <h1>Data Cleaning</h1>
          <p>
            Inspect, clean, and prepare your dataset.
            {datasetId ? ` · Dataset #${datasetId}` : ''}
            {loading ? ' · processing…' : ''}
          </p>
        </section>

        {error && <p className={styles.errorBanner} role="alert">{error}</p>}

        {payload && (
          <>
            <header className={styles.pageHeader}>
              <Image
                src={dataProcessingImg}
                alt=""
                width={112}
                height={112}
                className={styles.headerArt}
                priority
              />
              <div className={styles.headerMain}>
                <div className={styles.headerTitles}>
                  <span className={styles.headerKicker}>DataSense · Pipeline</span>
                  <h1 className={styles.headerTitle}>Data Cleaning Studio</h1>
                  <p className={styles.headerMeta}>
                    Inspect, transform, and prepare your dataset
                    {datasetId ? ` · Dataset #${datasetId}` : ''}
                    {loading ? ' · processing…' : ''}
                  </p>
                </div>
                <div className={styles.stepsSection}>
                  <div className={styles.stepsLabelRow}>
                    <span className={styles.stepsLabel}>Cleaning steps</span>
                    <span className={styles.stepCountBadge}>{stepHistory.length} applied</span>
                  </div>
                  <div className={styles.stepsTrack} aria-label="Cleaning step pipeline">
                    {stepHistory.length === 0 ? (
                      <p className={styles.stepsEmpty}>
                        No steps yet — run a cleaning action to build your pipeline
                      </p>
                    ) : (
                      stepHistory.map((step, i) => (
                        <Fragment key={step.step_index}>
                          <div className={`${styles.stepPill} ${styles[`stepTone_${CHAIN_COLORS[i % 3]}`]}`}>
                            <span className={styles.stepNum}>{i + 1}</span>
                            <div className={styles.stepText}>
                              <strong>{step.label}</strong>
                              <small>{step.detail}</small>
                            </div>
                          </div>
                          {i < stepHistory.length - 1 && (
                            <span className={styles.stepConnector} aria-hidden="true" />
                          )}
                        </Fragment>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </header>

            <section className={styles.statsGrid}>
              {stats.map((stat) => (
                <article key={stat.label} className={`${styles.statCard} ${styles[stat.tone]}`}>
                  <span className={`${styles.statIcon} ${styles[`icon_${stat.icon}`]}`} aria-hidden="true" />
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                  </div>
                </article>
              ))}
            </section>

            <section className={styles.mainGrid}>
              <article className={styles.panel}>
                <h2>Columns</h2>
                <div className={styles.columnList}>
                  {allColumns.map((name) => {
                    const isNum = payload.numerical_columns.includes(name);
                    const isBool = !isNum && isBooleanLike(name, payload.statistics);
                    const status = getColumnStatus(name, payload.statistics, isNum);
                    const selected = selectedColumn === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        className={[
                          styles.colCard,
                          status.clean ? styles.colClean : '',
                          selected ? styles.colSelected : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => setSelectedColumn(name)}
                      >
                        <div className={styles.colMain}>
                          <strong>{name}</strong>
                          <span className={isNum ? styles.typeNumeric : styles.typeCategorical}>
                            {isNum ? '# numeric' : isBool ? 'Aa boolean' : 'Aa categorical'}
                          </span>
                        </div>
                        <div className={styles.colActions}>
                          {status.issues.map((issue) => (
                            <span
                              key={issue.type}
                              className={`${styles.issueBadge} ${issue.type === 'missing' ? styles.issueMissing : styles.issueOutliers}`}
                              title={`${issue.label}: ${issue.count}`}
                            >
                              <span className={styles.issueType}>{issue.label}</span>
                              <span className={styles.issueCount}>{issue.count}</span>
                            </span>
                          ))}
                          {status.clean && (
                            <span className={styles.cleanBadge} title="Column is clean">
                              <CheckIcon />
                              Cleaned
                            </span>
                          )}
                          <button
                            type="button"
                            className={styles.colToolBtn}
                            title="Preview cleaned data"
                            aria-label={`Preview dataset including ${name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPreview(true);
                            }}
                          >
                            <PreviewIcon />
                          </button>
                          <button
                            type="button"
                            className={`${styles.colToolBtn} ${styles.colToolDanger}`}
                            title={`Drop column ${name}`}
                            aria-label={`Drop column ${name}`}
                            disabled={loading || isLocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!window.confirm(`Drop column "${name}"?`)) return;
                              runClean({ action: 'drop_column', columns: [name] });
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className={styles.panel}>
                <h2>Cleaning Actions</h2>
                <div className={styles.actionList}>
                  <ActionBtn
                    tone="blue"
                    icon="dup"
                    title="Drop Duplicates"
                    hint="Remove duplicate rows"
                    disabled={loading || isLocked}
                    onClick={() => runClean({ action: 'drop_duplicates', strategy: 'auto' })}
                  />
                  <ActionBtn
                    tone="green"
                    icon="replace"
                    title="Replace Values"
                    hint={selectedColumn ? `Column: ${selectedColumn}` : 'Select a column'}
                    disabled={loading || isLocked || !selectedColumn}
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
                  />
                  <ActionBtn
                    tone="amber"
                    icon="missing"
                    title="Handle Missing Values"
                    hint={selectedColumn ? `Mean · ${selectedColumn}` : 'Select a column'}
                    disabled={loading || isLocked || !selectedColumn}
                    onClick={() =>
                      selectedColumn &&
                      runClean({ action: 'missing_values', strategy: 'mean', columns: [selectedColumn] })
                    }
                  />
                  <ActionBtn
                    tone="purple"
                    icon="imbalance"
                    title="Handle Imbalance"
                    hint="Coming soon"
                    disabled
                    onClick={() => undefined}
                  />
                  <ActionBtn
                    tone="red"
                    icon="outliers"
                    title="Handle Outliers"
                    hint={selectedColumn ? `Cap · ${selectedColumn}` : 'Select a column'}
                    disabled={loading || isLocked || !selectedColumn || !payload.numerical_columns.includes(selectedColumn ?? '')}
                    onClick={() =>
                      selectedColumn &&
                      runClean({ action: 'outliers', strategy: 'cap', columns: [selectedColumn] })
                    }
                  />
                  <ActionBtn
                    tone="green"
                    icon="encoding"
                    title="Encoding"
                    hint={selectedIsCategorical ? `Label · ${selectedColumn}` : 'Select categorical column'}
                    disabled={loading || isLocked || !selectedIsCategorical}
                    onClick={() =>
                      selectedColumn &&
                      runClean({ action: 'encoding', strategy: 'label', columns: [selectedColumn] })
                    }
                  />
                  <ActionBtn
                    tone="blue"
                    icon="scale"
                    title="Feature Scaling"
                    hint="Coming soon"
                    disabled
                    onClick={() => undefined}
                  />
                </div>
              </article>

              <div className={styles.sideStack}>
                <article className={styles.panel}>
                  <h2>Utility Actions</h2>
                  <div className={styles.utilityList}>
                    <div className={styles.utilityBlock}>
                      <span className={`${styles.utilIcon} ${styles.utilDrop}`} aria-hidden="true" />
                      <div>
                        <strong>Drop Column</strong>
                        <button
                          type="button"
                          className={styles.dropColBtn}
                          disabled={loading || isLocked || !selectedColumn}
                          onClick={() => {
                            if (!selectedColumn) return;
                            if (!window.confirm(`Drop column "${selectedColumn}"?`)) return;
                            runClean({ action: 'drop_column', columns: [selectedColumn] });
                          }}
                        >
                          Drop {selectedColumn || 'column'}
                        </button>
                      </div>
                    </div>
                    <div className={styles.utilityBlock}>
                      <span className={`${styles.utilIcon} ${styles.utilPreview}`} aria-hidden="true" />
                      <div>
                        <strong>Preview Data</strong>
                        <button type="button" className={styles.utilBtn} onClick={() => setShowPreview(true)}>
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </article>

                <article className={styles.panel}>
                  <div className={styles.controlHeader}>
                    <h2>Dataset Controls</h2>
                    <span className={styles.stepBadge}>{stepHistory.length} steps</span>
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
                          <p className={styles.chainHint}>Steps appear here as you clean.</p>
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
                          type="button"
                          className={styles.undoBtn}
                          disabled={loading || isLocked || stepHistory.length === 0}
                          onClick={handleUndo}
                        >
                          Undo Last Step
                        </button>
                        <button
                          type="button"
                          className={styles.downloadBtn}
                          disabled={!payload.data?.length}
                          onClick={() =>
                            downloadDatasetCsv(
                              payload.data,
                              `dataset_${datasetId}_cleaned.csv`,
                            )
                          }
                        >
                          Download CSV
                        </button>
                        <button
                          type="button"
                          className={styles.finalizeBtn}
                          disabled={loading || isLocked}
                          onClick={handleFinalize}
                        >
                          Finalize Dataset
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <button
              className={styles.visualizeButton}
              type="button"
              onClick={() => router.push(`/visualization?datasetId=${datasetId}`)}
            >
              Let&apos;s Visualize It
            </button>
          </>
        )}
      </div>

      {showPreview && payload && !isLocked && (
        <CleaningPreviewModal
          payload={payload}
          onClose={() => setShowPreview(false)}
          onFinalize={handleFinalize}
          finalizing={loading}
        />
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PreviewIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 8s2.5-4.5 6-4.5 6 4.5 6 4.5-2.5 4.5-6 4.5S2 8 2 8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 5h10M6 5V3.5h4V5M5.5 5l.6 8h4.8l.6-8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionBtn({
  tone,
  icon,
  title,
  hint,
  disabled,
  onClick,
}: {
  tone: string;
  icon: string;
  title: string;
  hint: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.actionBtn} ${styles[`action_${tone}`]}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={`${styles.actionIcon} ${styles[`actionIcon_${icon}`]}`} aria-hidden="true" />
      <span className={styles.actionText}>
        <strong>{title}</strong>
        <small>{hint}</small>
      </span>
    </button>
  );
}
