import styles from './ExportReportSection.module.css';

export default function ExportReportSection() {
  const handleExport = (format: 'pdf' | 'xlsx' | 'csv') => {
    console.log(`Exporting as ${format.toUpperCase()}`);
    // TODO: Implement actual export functionality
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.icon}>📄</div>
          <div className={styles.text}>
            <h2 className={styles.title}>Export Intelligence Report</h2>
            <p className={styles.description}>
              Generate a comprehensive PDF report with all insights, visualizations, and recommendations for sharing with stakeholders and executives.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.exportBtn}
            onClick={() => handleExport('pdf')}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 4h12M2 8h12M2 12h6" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
            Generate PDF Report
          </button>
          <button
            className={`${styles.exportBtn} ${styles.secondary}`}
            onClick={() => handleExport('xlsx')}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2h12v12H2z M5 6h2 M9 6h2 M5 9h2 M9 9h2" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
            Export Insights
          </button>
          <button
            className={`${styles.exportBtn} ${styles.secondary}`}
            onClick={() => handleExport('csv')}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2h12v12H2z M5 5v6 M8 5v6 M11 5v6" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
            Download Summary
          </button>
        </div>
      </div>
    </section>
  );
}
