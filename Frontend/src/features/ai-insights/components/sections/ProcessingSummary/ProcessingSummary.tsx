import { type DatasetPayload } from '@/services/data';
import styles from './ProcessingSummary.module.css';

interface ProcessingSummaryProps {
  payload: DatasetPayload;
}

export default function ProcessingSummary({ payload }: ProcessingSummaryProps) {
  const stats = [
    {
      label: 'Missing Values Fixed',
      value: 124,
      icon: '✓',
      color: '#10b981',
    },
    {
      label: 'Outliers Removed',
      value: 18,
      icon: '◆',
      color: '#f59e0b',
    },
    {
      label: 'Duplicates Removed',
      value: 32,
      icon: '⟲',
      color: '#ef4444',
    },
    {
      label: 'Columns Processed',
      value: payload.columns,
      icon: '≡',
      color: '#22d3ee',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Processing Summary</h2>
        <p className={styles.subtitle}>Results from data cleaning pipeline</p>
      </div>

      <div className={styles.grid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.cardContent}>
              <strong className={styles.cardValue}>{stat.value.toLocaleString()}</strong>
              <span className={styles.cardLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <h3 className={styles.infoTitle}>Data Quality Metrics</h3>
        </div>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricName}>Completeness</span>
            <div className={styles.metricBar}>
              <div className={styles.metricFill} style={{ width: '94%', backgroundColor: '#10b981' }} />
            </div>
            <span className={styles.metricValue}>94%</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricName}>Consistency</span>
            <div className={styles.metricBar}>
              <div className={styles.metricFill} style={{ width: '88%', backgroundColor: '#22d3ee' }} />
            </div>
            <span className={styles.metricValue}>88%</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricName}>Validity</span>
            <div className={styles.metricBar}>
              <div className={styles.metricFill} style={{ width: '91%', backgroundColor: '#3b82f6' }} />
            </div>
            <span className={styles.metricValue}>91%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
