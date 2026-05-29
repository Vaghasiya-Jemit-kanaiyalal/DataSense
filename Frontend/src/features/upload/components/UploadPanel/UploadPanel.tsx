'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, authFetch } from '@/services/api';
import {
  activateDataset,
  resumeActiveDataset,
  setActiveDatasetId,
  type DatasetPayload,
} from '@/services/data';
import { useAuthHydrated } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import styles from './UploadPanel.module.css';

/* ──── Resumed datasets are fetched from server ──── */

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

export default function UploadPanel() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  type DatasetRow = {
    id: number;
    name: string;
    mime?: string;
    size?: number;
    uploadedAt?: string;
    rows?: number;
    columns?: number;
    isActive?: boolean;
  };
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [activeResume, setActiveResume] = useState<DatasetPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    async function load() {
      try {
        const data = await api.get<{ datasets: DatasetRow[] }>('/data/mine');
        setDatasets(data.datasets || []);
      } catch {
        /* ignore */
      }

      const resumed = await resumeActiveDataset();
      if (resumed?.dataset_id) {
        setActiveResume(resumed);
        setActiveDatasetId(resumed.dataset_id);
      }
    }

    load();
  }, [hydrated, isAuthenticated]);

  const resumeDataset = useCallback(
    async (id: number, target: 'preview' | 'cleaning') => {
      try {
        await activateDataset(id);
        setActiveDatasetId(id);
        router.push(`/${target}?datasetId=${id}`);
      } catch (err) {
        console.error(err);
      }
    },
    [router],
  );

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
        const data = await api.get<{ datasets: DatasetRow[] }>('/data/mine');
        setDatasets(data.datasets || []);
      } else {
        const text = await res.text().catch(() => null);
        console.error('Upload failed', res.status, text);
        if (res.status === 401) router.push('/signin');
      }
    } catch (err) {
      console.error(err);
    }
  }, [router]);

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

        {activeResume && (
          <div className={styles.resumeBanner}>
            <div>
              <p className={styles.resumeTitle}>Continue where you left off</p>
              <p className={styles.resumeMeta}>
                {activeResume.original_filename ?? `Dataset #${activeResume.dataset_id}`}
                {' · '}
                {activeResume.total_steps ?? 0} cleaning steps saved
                {activeResume.rows ? ` · ${activeResume.rows.toLocaleString()} rows` : ''}
              </p>
            </div>
            <div className={styles.resumeActions}>
              <button
                type="button"
                className={styles.previewBtn}
                onClick={() => resumeDataset(activeResume.dataset_id, 'preview')}
              >
                Preview
              </button>
              <button
                type="button"
                className={styles.resumeCleanBtn}
                onClick={() => resumeDataset(activeResume.dataset_id, 'cleaning')}
              >
                Continue Cleaning
              </button>
            </div>
          </div>
        )}

        {/* ---- Resumed Datasets ---- */}
        <div className={styles.resumedSection}>
          <h2 className={styles.resumedLabel}>YOUR DATASETS</h2>

          <div className={styles.datasetList}>
            {datasets.length === 0 && (
              <p className={styles.emptyList}>No datasets yet. Upload a file above.</p>
            )}
            {datasets.map((dataset) => (
              <div key={dataset.id} className={`${styles.datasetCard} ${dataset.isActive ? styles.datasetActive : ''}`}>
                <div className={styles.datasetLeft}>
                  <FileIcon type={dataset.mime?.split('/')?.[1]?.toUpperCase() ?? 'FILE'} badgeColor={'#7c3aed'} />
                  <div className={styles.datasetInfo}>
                    <p className={styles.datasetName}>{dataset.name}</p>
                    <p className={styles.datasetMeta}>
                      {dataset.mime} &bull; {dataset.size} &bull; {dataset.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className={styles.datasetRight}>
                  <span className={styles.datasetStats}>
                    {dataset.rows ?? '-'} Rows &bull; {dataset.columns ?? '-'} Columns
                  </span>
                  <button
                    type="button"
                    className={styles.previewBtn}
                    onClick={() => resumeDataset(dataset.id, 'preview')}
                  >
                    {dataset.isActive ? 'Resume' : 'Open'}
                  </button>
                  <button type="button" className={styles.moreBtn} aria-label="More options">
                    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                      <circle cx="8" cy="3" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="13" r="1.5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
