import { type AnalysisPayload } from '@/services/data';
import styles from './FeatureImportanceAnalysis.module.css';

interface FeatureImportanceAnalysisProps {
  analysis?: AnalysisPayload;
}

export default function FeatureImportanceAnalysis({ analysis }: FeatureImportanceAnalysisProps) {
  const features = analysis?.feature_importance ?? [
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
              {features.slice(0, 4).map((f) => (
                <p key={f.name}>
                  <strong>{f.name} ({f.importance}%)</strong> is a significant predictor based on current dataset analysis.
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
