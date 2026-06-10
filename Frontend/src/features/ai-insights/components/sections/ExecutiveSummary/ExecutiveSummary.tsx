import { type DatasetPayload } from '@/services/data';
import styles from './ExecutiveSummary.module.css';

interface ExecutiveSummaryProps {
  payload: DatasetPayload;
}

export default function ExecutiveSummary({ payload }: ExecutiveSummaryProps) {
  const datasetHealth = 92;
  const confidenceScore = 87;

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Executive Summary</h2>
            <p className={styles.subtitle}>Overview of your dataset analysis</p>
          </div>
          <span className={styles.aiIcon} aria-hidden="true">✨</span>
        </div>

        <div className={styles.content}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Dataset Health Score</span>
              <div className={styles.metricValue}>
                <strong>{datasetHealth}%</strong>
                <span className={styles.metricBadge}>Excellent</span>
              </div>
            </div>

            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Total Records</span>
              <div className={styles.metricValue}>
                <strong>{payload.rows.toLocaleString()}</strong>
              </div>
            </div>

            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Total Features</span>
              <div className={styles.metricValue}>
                <strong>{payload.columns}</strong>
              </div>
            </div>

            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>AI Confidence Score</span>
              <div className={styles.metricValue}>
                <strong>{confidenceScore}%</strong>
                <span className={styles.confidenceBadge}>High</span>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryText}>
            <h3 className={styles.summaryTitle}>Key Findings</h3>
            <ul className={styles.summaryList}>
              <li>Revenue increased consistently during the last six months.</li>
              <li>Marketing investment positively impacted customer acquisition.</li>
              <li>Several unusual transactions require investigation.</li>
              <li>Overall operational risk remains moderate.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
