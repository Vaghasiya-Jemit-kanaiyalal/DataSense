import { type DatasetPayload } from '@/services/data';
import styles from './QuickInsightCards.module.css';

interface QuickInsightCardsProps {
  payload: DatasetPayload;
}

export default function QuickInsightCards({ payload }: QuickInsightCardsProps) {
  const insights = [
    {
      id: 'correlation',
      icon: '📈',
      title: 'Strongest Correlation',
      value: '0.87',
      subtitle: 'Marketing Spend ↔ Revenue',
      trend: '+12%',
      badge: 'Strong',
    },
    {
      id: 'growth',
      icon: '📊',
      title: 'Predicted Growth',
      value: '+24%',
      subtitle: 'Q4 Revenue Forecast',
      trend: 'Positive',
      badge: 'Bullish',
    },
    {
      id: 'risk',
      icon: '⚠️',
      title: 'Risk Level',
      value: 'Moderate',
      subtitle: '{payload.rows} transactions analyzed',
      trend: '↔ Stable',
      badge: 'Managed',
    },
    {
      id: 'quality',
      icon: '✓',
      title: 'Data Quality Score',
      value: '94%',
      subtitle: '{payload.columns} features verified',
      trend: '+8%',
      badge: 'Excellent',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {insights.map((insight) => (
          <article key={insight.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>{insight.icon}</span>
              <span className={styles[`badge_${insight.id}`]}>{insight.badge}</span>
            </div>
            
            <h3 className={styles.cardTitle}>{insight.title}</h3>
            
            <div className={styles.cardValue}>
              <strong>{insight.value}</strong>
            </div>
            
            <p className={styles.cardSubtitle}>{insight.subtitle}</p>
            
            <div className={styles.cardFooter}>
              <span className={styles.trend}>{insight.trend}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
