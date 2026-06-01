'use client';

import type { DatasetPayload } from '@/services/data';
import styles from './CleaningPreviewModal.module.css';

interface CleaningPreviewModalProps {
  payload: DatasetPayload;
  onClose: () => void;
  onFinalize: () => void;
  finalizing?: boolean;
}

export default function CleaningPreviewModal({
  payload,
  onClose,
  onFinalize,
  finalizing = false,
}: CleaningPreviewModalProps) {
  const headers = payload.data[0] ? Object.keys(payload.data[0]) : [];

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Cleaned data preview">
      <div className={styles.modal}>
        <header className={styles.header}>
          <div>
            <h2>Preview — Cleaned Dataset</h2>
            <p>
              {payload.rows.toLocaleString()} rows · {payload.columns} columns ·{' '}
              {payload.total_steps ?? 0} cleaning steps applied
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close preview">
            ×
          </button>
        </header>
        <div className={styles.tableWrap}>
          <table>
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
        <footer className={styles.footer}>
          <span>Showing first {payload.data.length} rows after pipeline</span>
          <div className={styles.footerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={finalizing}
              onClick={onFinalize}
            >
              {finalizing ? 'Finalizing…' : 'Finalize Dataset'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
