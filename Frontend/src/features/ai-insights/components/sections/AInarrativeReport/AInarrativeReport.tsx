import { type AnalysisPayload } from '@/services/data';
import styles from './AInarrativeReport.module.css';

interface AInarrativeReportProps {
  analysis?: AnalysisPayload;
}

export default function AInarrativeReport({ analysis }: AInarrativeReportProps) {
  const narrative = analysis?.narrative ?? (
    'This dataset contains financial records across multiple business units spanning the last 24 months. '
    + 'Revenue growth is strongly influenced by marketing spend and customer acquisition, with a correlation '
    + 'coefficient of 0.87—indicating a robust relationship between investment and outcomes. '
    + 'Several anomalies have been detected in the transaction logs that warrant investigation.'
  );
  const confidence = analysis?.confidence_score ?? 87;

  const paragraphs = narrative.split('.').filter(Boolean).map((p) => p.trim() + '.');

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.aiLabel}>
            <span className={styles.aiIcon}>✨</span>
            <span>AI-Generated Narrative</span>
          </div>
        </div>

        <div className={styles.content}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Generated:</span>
            <span className={styles.value}>Just now</span>
          </div>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Model:</span>
            <span className={styles.value}>DataSense ML Service</span>
          </div>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Confidence:</span>
            <span className={styles.value}>{confidence}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
