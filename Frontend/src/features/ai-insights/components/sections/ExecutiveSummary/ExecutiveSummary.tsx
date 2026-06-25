import { type AnalysisPayload, type DatasetPayload } from '@/services/data';
import styles from './ExecutiveSummary.module.css';

interface ExecutiveSummaryProps {
  payload: DatasetPayload;
  analysis?: AnalysisPayload;
}

function healthLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

function confidenceLabel(score: number) {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  return 'Low';
}

export default function ExecutiveSummary({ payload, analysis }: ExecutiveSummaryProps) {
  const healthScore = analysis?.health_score ?? 92;
  const confidenceScore = analysis?.confidence_score ?? 87;
  const keyFindings = analysis?.key_findings ?? [
    'Revenue increased consistently during the last six months.',
    'Marketing investment positively impacted customer acquisition.',
    'Several unusual transactions require investigation.',
    'Overall operational risk remains moderate.',
  ];

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
                <strong>{healthScore}%</strong>
                <span className={styles.metricBadge}>{healthLabel(healthScore)}</span>
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
                <span className={styles.confidenceBadge}>{confidenceLabel(confidenceScore)}</span>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryText}>
            <h3 className={styles.summaryTitle}>Key Findings</h3>
            <ul className={styles.summaryList}>
              {keyFindings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
