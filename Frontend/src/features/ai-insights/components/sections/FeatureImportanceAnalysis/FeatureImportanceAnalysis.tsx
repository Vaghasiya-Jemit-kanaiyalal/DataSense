import styles from './FeatureImportanceAnalysis.module.css';

interface Feature {
  name: string;
  importance: number;
  color: string;
}

export default function FeatureImportanceAnalysis() {
  const features: Feature[] = [
    { name: 'Marketing Spend', importance: 45, color: '#22d3ee' },
    { name: 'Customer Count', importance: 32, color: '#3b82f6' },
    { name: 'Region', importance: 14, color: '#10b981' },
    { name: 'Discount', importance: 9, color: '#f59e0b' },
  ];

  const maxImportance = Math.max(...features.map((f) => f.importance));

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Feature Importance Analysis</h2>
        <p className={styles.subtitle}>Impact of each feature on business performance</p>
      </div>

      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Feature Impact Score</h3>
            <div className={styles.chart}>
              {features.map((feature) => (
                <div key={feature.name} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span className={styles.featureName}>{feature.name}</span>
                    <span className={styles.percentage}>{feature.importance}%</span>
                  </div>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(feature.importance / maxImportance) * 100}%`,
                        backgroundColor: feature.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.explanationSection}>
            <h3 className={styles.explanationTitle}>Why These Features Matter</h3>
            <div className={styles.explanationText}>
              <p>
                <strong>Marketing Spend (45%)</strong> is the strongest predictor of revenue growth. This reflects the direct correlation between investment in advertising and customer acquisition.
              </p>
              <p>
                <strong>Customer Count (32%)</strong> demonstrates the compounding effect of building a loyal customer base. More customers correlate with higher repeat purchases.
              </p>
              <p>
                <strong>Region (14%)</strong> shows geographic variations in purchasing behavior, suggesting localized market strategies could be beneficial.
              </p>
              <p>
                <strong>Discount (9%)</strong> has minimal impact, indicating that aggressive discounting may not be necessary to drive sales in this market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
