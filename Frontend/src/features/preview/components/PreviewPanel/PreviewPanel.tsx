'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getPreview,
  resumeActiveDataset,
  setActiveDatasetId,
  type DatasetPayload,
} from '@/services/data';
import styles from './PreviewPanel.module.css';

const ROW_OPTIONS = [5, 10, 20, 50];

export default function PreviewPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('datasetId');
  const [datasetId, setDatasetId] = useState<number | null>(
    queryId ? Number(queryId) : null,
  );
  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedStat, setExpandedStat] = useState<string | null>(null);

  const fetchPage = useCallback(async (id: number, pageNum: number, rows: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreview(id, rows, pageNum);
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
    fetchPage(datasetId, page, pageSize);
  }, [datasetId, page, pageSize, fetchPage]);

  const totalRows = payload?.rows ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalRows);
  const headers = payload?.data?.[0] ? Object.keys(payload.data[0]) : [];

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  /* Build visible page numbers: always show first, last, and a window around current */
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const toggleStat = (key: string) => {
    setExpandedStat((prev) => (prev === key ? null : key));
  };

  const allColumns = payload
    ? [...payload.numerical_columns, ...payload.categorical_columns]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1>Dataset Preview</h1>
            <p>{payload?.original_filename ?? (datasetId ? `Dataset #${datasetId}` : 'Upload a file or resume your active dataset')}</p>
          </div>
        </section>

        {error && <p className={styles.errorText}>{error}</p>}
        {!datasetId && !loading && <p>Go to Upload and select a CSV or Excel file.</p>}

        {payload && (
          <>
            {/* ── Stat boxes ── */}
            <section className={styles.statsGrid} aria-label="Dataset totals">
              <button
                type="button"
                className={`${styles.statCard} ${styles.blue} ${expandedStat === 'rows' ? styles.statActive : ''}`}
                onClick={() => toggleStat('rows')}
              >
                <div><p>Total Rows</p><strong>{payload.rows.toLocaleString()}</strong></div>
              </button>
              <button
                type="button"
                className={`${styles.statCard} ${styles.purple} ${expandedStat === 'columns' ? styles.statActive : ''}`}
                onClick={() => toggleStat('columns')}
              >
                <div><p>Total Columns</p><strong>{payload.columns}</strong></div>
              </button>
              <button
                type="button"
                className={`${styles.statCard} ${styles.green} ${expandedStat === 'numeric' ? styles.statActive : ''}`}
                onClick={() => toggleStat('numeric')}
              >
                <div><p>Numeric Columns</p><strong>{payload.numerical_columns.length}</strong></div>
              </button>
              <button
                type="button"
                className={`${styles.statCard} ${styles.amber} ${expandedStat === 'categorical' ? styles.statActive : ''}`}
                onClick={() => toggleStat('categorical')}
              >
                <div><p>Categorical Columns</p><strong>{payload.categorical_columns.length}</strong></div>
              </button>
            </section>

            {/* ── Expanded column list ── */}
            {expandedStat && expandedStat !== 'rows' && (
              <section className={styles.expandedPanel}>
                <h3>
                  {expandedStat === 'columns' && 'All Columns'}
                  {expandedStat === 'numeric' && 'Numerical Columns'}
                  {expandedStat === 'categorical' && 'Categorical Columns'}
                </h3>
                <div className={styles.chipList}>
                  {(expandedStat === 'columns'
                    ? allColumns
                    : expandedStat === 'numeric'
                    ? payload.numerical_columns
                    : payload.categorical_columns
                  ).map((col) => {
                    const isNum = payload.numerical_columns.includes(col);
                    return (
                      <span
                        key={col}
                        className={`${styles.chip} ${isNum ? styles.chipNumeric : styles.chipCategorical}`}
                      >
                        <span className={styles.chipIcon}>{isNum ? '#' : 'Aa'}</span>
                        {col}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Data table ── */}
            <section className={styles.previewCard}>
              <div className={styles.cardHeader}>
                <h2>Rows {startRow}–{endRow} of {totalRows.toLocaleString()}</h2>
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

              {/* ── Pagination footer ── */}
              <div className={styles.pagination}>
                <label className={styles.rowsPerPage}>
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    {ROW_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>

                <div className={styles.pageControls}>
                  <span className={styles.pageInfo}>
                    {startRow}–{endRow} of {totalRows.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {pageNumbers.map((n, idx) =>
                    n === 'ellipsis' ? (
                      <span key={`e${idx}`} className={styles.ellipsis}>…</span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        className={n === page ? styles.activePage : ''}
                        onClick={() => setPage(n)}
                        disabled={loading}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
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
