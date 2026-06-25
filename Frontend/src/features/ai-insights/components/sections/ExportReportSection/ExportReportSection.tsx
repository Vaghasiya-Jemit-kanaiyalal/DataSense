import styles from './ExportReportSection.module.css';

interface ExportReportSectionProps {
  onGeneratePDF: () => void;
  isGenerating: boolean;
}

export default function ExportReportSection({ onGeneratePDF, isGenerating }: ExportReportSectionProps) {
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
            onClick={onGeneratePDF}
            disabled={isGenerating}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 4h12M2 8h12M2 12h6" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
            {isGenerating ? 'Generating...' : 'Generate PDF Report'}
          </button>
        </div>
      </div>
    </section>
  );
}
