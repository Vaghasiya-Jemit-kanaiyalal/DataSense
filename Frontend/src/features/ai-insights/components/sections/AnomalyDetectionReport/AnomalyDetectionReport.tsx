import { type AnalysisPayload } from '@/services/data';
import styles from './AnomalyDetectionReport.module.css';

interface AnomalyDetectionReportProps {
  analysis?: AnalysisPayload;
}

export default function AnomalyDetectionReport({ analysis }: AnomalyDetectionReportProps) {
  const anomalies = (analysis?.anomalies ?? []).slice(0, 10);
  const totalAnomalies = analysis?.anomalies?.length ?? 18;
  const criticalIssues = analysis?.anomalies?.filter((a) => a.severity === 'critical').length ?? 2;
  const warningIssues = analysis?.anomalies?.filter((a) => a.severity === 'high').length ?? 5;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Anomaly Detection Report</h2>
        <p className={styles.subtitle}>Unusual transactions requiring attention</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Anomalies</span>
          <strong className={styles.statValue}>{totalAnomalies}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Critical Issues</span>
          <strong className={`${styles.statValue} ${styles.critical}`}>{criticalIssues}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Warning Issues</span>
          <strong className={`${styles.statValue} ${styles.warning}`}>{warningIssues}</strong>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>Record ID</div>
          <div className={styles.headerCell}>Metric</div>
          <div className={styles.headerCell}>Actual Value</div>
          <div className={styles.headerCell}>Expected Range</div>
          <div className={styles.headerCell}>Severity</div>
        </div>

        <div className={styles.tableBody}>
          {anomalies.map((anomaly, i) => (
            <div key={i} className={styles.tableRow}>
              <div className={styles.cell}>
                <span className={styles.recordId}>Row #{anomaly.row_index}</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.metric}>{anomaly.column}</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.value}>{anomaly.actual}</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.expected}>{anomaly.expected}</span>
              </div>
              <div className={styles.cell}>
                <span className={`${styles.badge} ${styles[`severity_${anomaly.severity}`]}`}>
                  {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllBtn}>
          View All {totalAnomalies} Anomalies
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
