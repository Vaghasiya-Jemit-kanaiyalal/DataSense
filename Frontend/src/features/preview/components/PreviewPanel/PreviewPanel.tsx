'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getPreview,
  resumeActiveDataset,
  setActiveDatasetId,
  type DatasetPayload,
} from '@/services/data';
import styles from './PreviewPanel.module.css';

const PAGE_SIZE = 20;

export default function PreviewPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('datasetId');
  const [datasetId, setDatasetId] = useState<number | null>(
    queryId ? Number(queryId) : null,
  );
  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (id: number, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreview(id, PAGE_SIZE, pageNum); // uses api client with token refresh
      setPayload(data);
      setActiveDatasetId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!queryId) {
      resumeActiveDataset().then((resumed) => {
        if (resumed) {
          setDatasetId(resumed.dataset_id);
          router.replace(`/preview?datasetId=${resumed.dataset_id}`);
        }
      });
      return;
    }
    setDatasetId(Number(queryId));
    setPage(1);
  }, [queryId, router]);

  useEffect(() => {
    if (!datasetId) return;
    fetchPage(datasetId, page);
  }, [datasetId, page, fetchPage]);

  const totalRows = payload?.rows ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const startRow = totalRows === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, totalRows);
  const headers = payload?.data?.[0] ? Object.keys(payload.data[0]) : [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1>Dataset Preview</h1>
            <p>{datasetId ? `Dataset #${datasetId}` : 'Upload a file or resume your active dataset'}</p>
          </div>
        </section>

        {error && <p className={styles.errorText}>{error}</p>}
        {!datasetId && !loading && <p>Go to Upload and select a CSV or Excel file.</p>}

        {payload && (
          <>
            <section className={styles.statsGrid} aria-label="Dataset totals">
              <article className={`${styles.statCard} ${styles.blue}`}>
                <div><p>Total Rows</p><strong>{payload.rows.toLocaleString()}</strong></div>
              </article>
              <article className={`${styles.statCard} ${styles.purple}`}>
                <div><p>Total Columns</p><strong>{payload.columns}</strong></div>
              </article>
              <article className={`${styles.statCard} ${styles.green}`}>
                <div><p>Numeric Columns</p><strong>{payload.numerical_columns.length}</strong></div>
              </article>
              <article className={`${styles.statCard} ${styles.amber}`}>
                <div><p>Categorical Columns</p><strong>{payload.categorical_columns.length}</strong></div>
              </article>
            </section>

            <section className={styles.previewCard}>
              <div className={styles.cardHeader}>
                <h2>Rows {startRow}–{endRow} of {totalRows.toLocaleString()}</h2>
                <p className={styles.pageHint}>{PAGE_SIZE} rows per page</p>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {payload.data.map((row, i) => (
                      <tr key={i}>
                        {headers.map((h) => (
                          <td key={h}>{row[h] == null ? '' : String(row[h])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.pagination}>
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={!payload.has_more || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </section>

            <section className={styles.cleanCard}>
              <div className={styles.cleanCopy}>
                <h2>Ready to clean your data?</h2>
                <p>{payload.total_steps ?? 0} cleaning steps saved</p>
              </div>
              <button
                className={styles.cleanButton}
                type="button"
                onClick={() => router.push(`/cleaning?datasetId=${datasetId}`)}
              >
                Start Cleaning
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
