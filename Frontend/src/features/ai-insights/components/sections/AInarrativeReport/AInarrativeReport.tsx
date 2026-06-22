import styles from './AInarrativeReport.module.css';

export default function AInarrativeReport() {
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
          <p>
            This dataset contains financial records across multiple business units spanning the last 24 months. 
            Revenue growth is strongly influenced by marketing spend and customer acquisition, with a correlation 
            coefficient of 0.87—indicating a robust relationship between investment and outcomes.
          </p>

          <p>
            Several anomalies have been detected in the transaction logs that warrant investigation. Specifically, 
            18 records exhibit statistical properties outside the expected range, with 2 flagged as critical for 
            immediate review. These may represent data entry errors, fraudulent activity, or legitimate edge cases 
            requiring context.
          </p>

          <p>
            Data quality improved significantly after preprocessing—missing values were imputed using mean 
            substitution for numerical columns and mode substitution for categorical features. Outliers were 
            capped at the 95th percentile to preserve data integrity while reducing noise. Overall, the dataset 
            now exhibits 94% quality score with strong consistency across all features.
          </p>

          <p>
            Operational metrics suggest the organization is well-positioned for growth, though moderate risk exists 
            in three areas: revenue concentration, expense volatility, and customer churn. A targeted intervention 
            strategy focusing on customer retention and cost optimization could significantly improve the risk profile 
            while maintaining margin expansion.
          </p>
        </div>

        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Generated:</span>
            <span className={styles.value}>Just now</span>
          </div>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Model:</span>
            <span className={styles.value}>DataSense AI v2.1</span>
          </div>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Confidence:</span>
            <span className={styles.value}>87%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
