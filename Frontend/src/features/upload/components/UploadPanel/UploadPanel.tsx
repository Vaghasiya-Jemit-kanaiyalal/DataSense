'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/services/api';
import {
  activateDataset,
  deleteDataset,
  isResumablePayload,
  listFinalizedDatasets,
  listResumableDatasets,
  reopenFinalizedDataset,
  resumeActiveDataset,
  setActiveDatasetId,
  type DatasetListItem,
  type DatasetPayload,
} from '@/services/data';
import { useAuthHydrated } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import styles from './UploadPanel.module.css';

type DatasetRow = DatasetListItem;

function fileTypeLabel(dataset: DatasetRow): string {
  const fromMime = dataset.mime?.split('/')?.[1]?.toUpperCase();
  if (fromMime) return fromMime;
  const ext = dataset.name.split('.').pop()?.toUpperCase();
  return ext ?? 'FILE';
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadedAt(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isDatasetInProgress(dataset: DatasetRow): boolean {
  if (dataset.status === 'finalized') return false;
  return Boolean(
    dataset.isActive ||
    (dataset.cleaningSteps ?? 0) > 0 ||
    dataset.status === 'cleaning' ||
    dataset.status === 'in_progress',
  );
}

function mergeResumeIntoList(list: DatasetRow[], resume: DatasetPayload): DatasetRow[] {
  if (!isResumablePayload(resume)) return list;

  const id = resume.dataset_id;
  const cleaningSteps = resume.total_steps ?? resume.pipeline_steps?.length ?? 0;
  const resumeRow: DatasetRow = {
    id,
    name: resume.original_filename ?? `Dataset #${id}`,
    rows: resume.rows,
    columns: resume.columns,
    isActive: true,
    cleaningSteps,
    status: resume.finalized ? 'finalized' : cleaningSteps > 0 ? 'cleaning' : 'uploaded',
  };

  const existingIndex = list.findIndex((d) => d.id === id);
  if (existingIndex >= 0) {
    const merged = list.map((d) =>
      d.id === id
        ? { ...d, ...resumeRow, isActive: true }
        : { ...d, isActive: false },
    );
    const active = merged[existingIndex];
    const rest = merged.filter((_, index) => index !== existingIndex);
    return [active, ...rest];
  }

  return [resumeRow, ...list.map((d) => ({ ...d, isActive: false }))];
}

function buildDatasetMeta(dataset: DatasetRow): string {
  const parts: string[] = [];
  if (dataset.mime) parts.push(dataset.mime);
  if (dataset.size) parts.push(formatFileSize(dataset.size));
  if (dataset.uploadedAt) parts.push(formatUploadedAt(dataset.uploadedAt));
  if (dataset.cleaningSteps && dataset.cleaningSteps > 0) {
    parts.push(`${dataset.cleaningSteps} cleaning step${dataset.cleaningSteps === 1 ? '' : 's'} saved`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Ready to preview';
}

/* ──── File type badge icon ──── */
function FileIcon({ type, badgeColor }: { type: string; badgeColor: string }) {
  return (
    <div className={styles.fileIconWrapper}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.fileIconSvg}
      >
        <rect x="4" y="2" width="24" height="32" rx="3" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.2)" strokeWidth="1.5" />
        <path d="M28 2L36 10H30C28.9 10 28 9.1 28 8V2Z" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.2)" strokeWidth="1.5" />
        <rect x="8" y="14" width="16" height="2" rx="1" fill="rgba(124,58,237,0.2)" />
        <rect x="8" y="19" width="12" height="2" rx="1" fill="rgba(124,58,237,0.15)" />
        <rect x="8" y="24" width="14" height="2" rx="1" fill="rgba(124,58,237,0.12)" />
      </svg>
      <span className={styles.fileTypeBadge} style={{ backgroundColor: badgeColor }}>
        {type}
      </span>
    </div>
  );
}

/* ──── Cloud Upload Icon ──── */
function CloudUploadIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cloudIcon}>
      <defs>
        <linearGradient id="cloudGrad" x1="16" y1="48" x2="48" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path
        d="M20 44h24a12 12 0 002-23.8A16 16 0 0014 28a10 10 0 006 16z"
        fill="url(#cloudGrad)"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 44V28M26 34l6-6 6 6"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

async function loadDatasetLists() {
  let list: DatasetRow[] = [];
  try {
    const data = await listResumableDatasets();
    list = data.datasets || [];
  } catch {
    /* ignore */
  }

  const resumed = await resumeActiveDataset();
  if (resumed?.dataset_id) {
    setActiveDatasetId(resumed.dataset_id);
    list = mergeResumeIntoList(list, resumed);
  }

  let finalized: DatasetRow[] = [];
  try {
    const data = await listFinalizedDatasets();
    finalized = data.datasets || [];
  } catch {
    /* ignore */
  }

  return { list, finalized };
}

export default function UploadPanel() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [finalizedDatasets, setFinalizedDatasets] = useState<DatasetRow[]>([]);
  const [reopenError, setReopenError] = useState<string | null>(null);
  const [reopeningId, setReopeningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reopenInputRef = useRef<HTMLInputElement>(null);
  const pendingReopenId = useRef<number | null>(null);
  const hydrated = useAuthHydrated();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic
  }, []);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;

    loadDatasetLists().then(({ list, finalized }) => {
      setDatasets(list);
      setFinalizedDatasets(finalized);
    });
  }, [hydrated, isAuthenticated]);

  const refreshLists = useCallback(async () => {
    const { list, finalized } = await loadDatasetLists();
    setDatasets(list);
    setFinalizedDatasets(finalized);
  }, []);

  const resumeDataset = useCallback(
    async (id: number, target: 'preview' | 'cleaning') => {
      try {
        setReopenError(null);
        await activateDataset(id);
        setActiveDatasetId(id);
        router.push(`/${target}?datasetId=${id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to open dataset';
        if (message.toLowerCase().includes('finalized')) {
          setReopenError('This dataset is finalized. Re-upload the original file in the Finalized section below.');
        } else {
          setReopenError(message);
        }
      }
    },
    [router],
  );

  const promptReopenFile = useCallback((datasetId: number) => {
    setReopenError(null);
    pendingReopenId.current = datasetId;
    reopenInputRef.current?.click();
  }, []);

  const handleReopenFile = useCallback(async (file: File) => {
    const datasetId = pendingReopenId.current;
    if (!datasetId) return;
    setReopeningId(datasetId);
    setReopenError(null);
    try {
      const result = await reopenFinalizedDataset(datasetId, file);
      await refreshLists();
      const steps = result.total_steps ?? result.pipeline_steps?.length ?? 0;
      router.push(steps > 0 ? `/cleaning?datasetId=${datasetId}` : `/preview?datasetId=${datasetId}`);
    } catch (err) {
      setReopenError(err instanceof Error ? err.message : 'Failed to restore dataset');
    } finally {
      setReopeningId(null);
      pendingReopenId.current = null;
      if (reopenInputRef.current) reopenInputRef.current.value = '';
    }
  }, [refreshLists, router]);

  const handleDeleteDataset = useCallback(async (dataset: DatasetRow) => {
    const confirmed = window.confirm(
      `Delete "${dataset.name}"? This removes the dataset and all saved cleaning steps.`,
    );
    if (!confirmed) return;

    setDeletingId(dataset.id);
    setReopenError(null);
    try {
      await deleteDataset(dataset.id);
      await refreshLists();
    } catch (err) {
      setReopenError(err instanceof Error ? err.message : 'Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  }, [refreshLists]);

  // Upload handler
  const uploadFile = useCallback(async (file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await authFetch('/data/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const uploaded = await res.json();
        if (uploaded?.dataset_id) {
          setActiveDatasetId(uploaded.dataset_id);
          router.push(`/preview?datasetId=${uploaded.dataset_id}`);
          return;
        }
        await refreshLists();
      } else {
        const text = await res.text().catch(() => null);
        console.error('Upload failed', res.status, text);
        if (res.status === 401) router.push('/signin');
      }
    } catch (err) {
      console.error(err);
    }
  }, [router, refreshLists]);

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDropzoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleChooseFile();
      }
    },
    [handleChooseFile],
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ---- Section Header ---- */}
        <div className={styles.sectionHeader}>
          <h1 className={styles.title}>
            Add Your <span className={styles.titleAccent}>Files</span>
          </h1>
          <p className={styles.subtitle}>Choose files and upload them below</p>
        </div>

        {/* ---- Upload Dropzone ---- */}
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleChooseFile}
          onKeyDown={handleDropzoneKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Upload file dropzone"
        >
          {/* Decorative dots */}
          <div className={`${styles.decorDot} ${styles.decorDot1}`} />
          <div className={`${styles.decorDot} ${styles.decorDot2}`} />
          <div className={`${styles.decorDot} ${styles.decorDot3}`} />

          <CloudUploadIcon />

          <p className={styles.dropzoneTitle}>Upload File</p>
          <p className={styles.dropzoneText}>
            Drag and drop your files here or click to upload
          </p>

          <button
            type="button"
            className={styles.chooseFileBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleChooseFile();
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className={styles.chooseFileIcon}>
              <path
                d="M8 2v12M3 7l5-5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Choose File
          </button>

          <p className={styles.dropzoneSupport}>
            Supports CSV, Excel, JSON (Max 100MB)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            className={styles.fileInput}
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
        </div>

        {reopenError && (
          <p className={styles.errorBanner} role="alert">{reopenError}</p>
        )}

        {/* ---- In-progress datasets ---- */}
        <div className={styles.resumedSection}>
          <h2 className={styles.resumedLabel}>YOUR DATASETS</h2>
          <p className={styles.sectionHint}>In-progress work you can resume anytime.</p>

          <div className={styles.datasetList}>
            {datasets.length === 0 && (
              <p className={styles.emptyList}>No in-progress datasets. Upload a file above.</p>
            )}
            {datasets.map((dataset) => {
              const inProgress = isDatasetInProgress(dataset);
              return (
              <div key={dataset.id} className={`${styles.datasetCard} ${inProgress ? styles.datasetActive : ''}`}>
                <div className={styles.datasetLeft}>
                  <FileIcon type={fileTypeLabel(dataset)} badgeColor="#7c3aed" />
                  <div className={styles.datasetInfo}>
                    <div className={styles.datasetNameRow}>
                      <p className={styles.datasetName}>{dataset.name}</p>
                      {inProgress && (
                        <span className={styles.activeBadge}>In progress</span>
                      )}
                    </div>
                    <p className={styles.datasetMeta}>{buildDatasetMeta(dataset)}</p>
                  </div>
                </div>

                <div className={styles.datasetRight}>
                  <span className={styles.datasetStats}>
                    {typeof dataset.rows === 'number' ? dataset.rows.toLocaleString() : '—'} Rows &bull;{' '}
                    {dataset.columns ?? '—'} Columns
                  </span>
                  <button
                    type="button"
                    className={styles.previewBtn}
                    onClick={() => resumeDataset(dataset.id, 'preview')}
                  >
                    Preview
                  </button>
                  {inProgress && (
                    <button
                      type="button"
                      className={styles.resumeCleanBtn}
                      onClick={() => resumeDataset(dataset.id, 'cleaning')}
                    >
                      Continue Cleaning
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.trashBtn}
                    aria-label={`Delete ${dataset.name}`}
                    disabled={deletingId === dataset.id}
                    onClick={() => handleDeleteDataset(dataset)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {finalizedDatasets.length > 0 && (
          <div className={styles.finalizedSection}>
            <h2 className={styles.resumedLabel}>FINALIZED DATASETS</h2>
            <p className={styles.sectionHint}>
              Cleaning is complete. Re-upload the original file to restore saved pipeline steps.
            </p>
            <div className={styles.datasetList}>
              {finalizedDatasets.map((dataset) => (
                <div key={dataset.id} className={`${styles.datasetCard} ${styles.datasetFinalized}`}>
                  <div className={styles.datasetLeft}>
                    <FileIcon type={fileTypeLabel(dataset)} badgeColor="#475569" />
                    <div className={styles.datasetInfo}>
                      <div className={styles.datasetNameRow}>
                        <p className={styles.datasetName}>{dataset.name}</p>
                        <span className={styles.finalizedBadge}>Finalized</span>
                      </div>
                      <p className={styles.datasetMeta}>
                        {buildDatasetMeta(dataset)}
                        {(dataset.cleaningSteps ?? 0) > 0 &&
                          ` · ${dataset.cleaningSteps} saved step${dataset.cleaningSteps === 1 ? '' : 's'} in database`}
                      </p>
                    </div>
                  </div>
                  <div className={styles.datasetRight}>
                    <span className={styles.datasetStats}>
                      {typeof dataset.rows === 'number' ? dataset.rows.toLocaleString() : '—'} Rows &bull;{' '}
                      {dataset.columns ?? '—'} Columns
                    </span>
                    <button
                      type="button"
                      className={styles.reuploadBtn}
                      disabled={reopeningId === dataset.id}
                      onClick={() => promptReopenFile(dataset.id)}
                    >
                      {reopeningId === dataset.id ? 'Restoring…' : 'Re-upload original file'}
                    </button>
                    <button
                      type="button"
                      className={styles.previewBtn}
                      onClick={() => router.push(`/visualization?datasetId=${dataset.id}`)}
                    >
                      View charts
                    </button>
                    <button
                      type="button"
                      className={styles.trashBtn}
                      aria-label={`Delete ${dataset.name}`}
                      disabled={deletingId === dataset.id}
                      onClick={() => handleDeleteDataset(dataset)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          ref={reopenInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          className={styles.fileInput}
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleReopenFile(f);
          }}
        />
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.trashIcon}>
      <path
        d="M3 5h10M6 5V3.5h4V5M5.5 5l.6 8h4.8l.6-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
