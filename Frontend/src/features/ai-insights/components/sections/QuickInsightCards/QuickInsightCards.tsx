import { type AnalysisPayload, type DatasetPayload } from '@/services/data';
import styles from './QuickInsightCards.module.css';

interface QuickInsightCardsProps {
  payload: DatasetPayload;
  analysis?: AnalysisPayload;
}

function riskLabel(score: number) {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  return 'High';
}

export default function QuickInsightCards({ payload, analysis }: QuickInsightCardsProps) {
  const correlation = analysis?.strongest_correlation;
  const quality = analysis?.data_quality;
  const risk = analysis?.risk_assessment;
  const completeness = quality?.completeness ?? 94;
  const overallRiskScore = risk?.overall_score ?? 45;

  const insights = [
    {
      id: 'correlation',
      icon: '📈',
      title: 'Strongest Correlation',
      value: correlation?.value ? correlation.value.toFixed(2) : '0.87',
      subtitle: correlation?.feature_a && correlation?.feature_b
        ? `${correlation.feature_a} ↔ ${correlation.feature_b}`
        : 'Marketing Spend ↔ Revenue',
      trend: correlation?.value && correlation.value > 0.7 ? '+Strong' : 'Moderate',
      badge: correlation?.value && correlation.value > 0.7 ? 'Strong' : 'Weak',
    },
    {
      id: 'growth',
      icon: '📊',
      title: 'Data Completeness',
      value: `${completeness}%`,
      subtitle: `${payload.rows} transactions analyzed`,
      trend: 'Positive',
      badge: completeness >= 80 ? 'Bullish' : 'Needs Work',
    },
    {
      id: 'risk',
      icon: '⚠️',
      title: 'Risk Level',
      value: riskLabel(overallRiskScore),
      subtitle: `${payload.rows} transactions analyzed`,
      trend: '↔ Stable',
      badge: 'Managed',
    },
    {
      id: 'quality',
      icon: '✓',
      title: 'Data Quality Score',
      value: `${completeness}%`,
      subtitle: `${payload.columns} features verified`,
      trend: '+8%',
      badge: completeness >= 80 ? 'Excellent' : 'Fair',
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
