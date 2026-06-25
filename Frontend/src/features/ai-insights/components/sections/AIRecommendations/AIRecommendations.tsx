import { type AnalysisPayload } from '@/services/data';
import styles from './AIRecommendations.module.css';

interface AIRecommendationsProps {
  analysis?: AnalysisPayload;
}

export default function AIRecommendations({ analysis }: AIRecommendationsProps) {
  const recommendations = analysis?.recommendations ?? [
    {
      icon: '💰',
      title: 'Optimize Marketing Budget',
      description: 'Reallocate 15% of budget to high-performing channels to maximize ROI.',
      priority: 'high',
    },
    {
      icon: '📉',
      title: 'Reduce Operational Expenses',
      description: 'Identify cost-saving opportunities in logistics and warehouse operations.',
      priority: 'high',
    },
    {
      icon: '🔍',
      title: 'Investigate Revenue Outliers',
      description: 'Review unusual transactions that deviate from normal patterns.',
      priority: 'medium',
    },
    {
      icon: '📊',
      title: 'Improve Data Quality',
      description: 'Standardize customer segmentation and remove duplicate records.',
      priority: 'medium',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI Recommendations</h2>
        <p className={styles.subtitle}>Actionable insights based on your data</p>
      </div>

      <div className={styles.grid}>
          {recommendations.map((rec, i) => (
          <article key={i} className={`${styles.card} ${styles[`priority_${rec.priority}`]}`}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>{rec.icon}</span>
              <span className={styles[`badge_${rec.priority}`]}>
                {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{rec.title}</h3>
            <p className={styles.cardDescription}>{rec.description}</p>

            <button className={styles.actionLink}>
              Learn More
              <span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
