import styles from './AnomalyDetectionReport.module.css';

interface Anomaly {
  id: string;
  recordId: string;
  metric: string;
  actual: string;
  expected: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export default function AnomalyDetectionReport() {
  const totalAnomalies = 18;
  const criticalIssues = 2;
  const warningIssues = 5;

  const anomalies: Anomaly[] = [
    {
      id: '1',
      recordId: 'TXN-2024-0847',
      metric: 'Transaction Amount',
      actual: '$125,000',
      expected: '$5,000 - $15,000',
      severity: 'critical',
    },
    {
      id: '2',
      recordId: 'TXN-2024-0925',
      metric: 'Customer Purchase Frequency',
      actual: '52 transactions',
      expected: '2 - 8 transactions',
      severity: 'critical',
    },
    {
      id: '3',
      recordId: 'TXN-2024-1033',
      metric: 'Regional Performance',
      actual: '450% above average',
      expected: '±15% variance',
      severity: 'high',
    },
    {
      id: '4',
      recordId: 'TXN-2024-1156',
      metric: 'Product Return Rate',
      actual: '89%',
      expected: '2 - 5%',
      severity: 'high',
    },
    {
      id: '5',
      recordId: 'TXN-2024-1247',
      metric: 'Customer Churn',
      actual: 'Flagged',
      expected: 'Active',
      severity: 'medium',
    },
  ];

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
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className={styles.tableRow}>
              <div className={styles.cell}>
                <span className={styles.recordId}>{anomaly.recordId}</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.metric}>{anomaly.metric}</span>
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
