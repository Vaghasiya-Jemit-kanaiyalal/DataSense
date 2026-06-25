import { type AnalysisPayload } from '@/services/data';
import styles from './BusinessRiskAssessment.module.css';

interface BusinessRiskAssessmentProps {
  analysis?: AnalysisPayload;
}

export default function BusinessRiskAssessment({ analysis }: BusinessRiskAssessmentProps) {
  const riskAssessment = analysis?.risk_assessment;
  const overallRiskScore = riskAssessment?.overall_score ?? 72;
  const riskCategories = riskAssessment?.categories ?? [
    { name: 'Revenue Risk', score: 45, icon: '📈' },
    { name: 'Expense Risk', score: 52, icon: '💰' },
    { name: 'Operational Risk', score: 68, icon: '⚙️' },
    { name: 'Data Quality Risk', score: 28, icon: '📊' },
  ];
  const riskLevel = overallRiskScore < 30 ? 'Low' : overallRiskScore < 60 ? 'Moderate' : 'High';

  const getRiskColor = (score: number) => {
    if (score < 30) return '#10b981';
    if (score < 60) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low';
    if (score < 60) return 'Moderate';
    return 'High';
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Business Risk Assessment</h2>
        <p className={styles.subtitle}>Comprehensive risk analysis across all dimensions</p>
      </div>

      <div className={styles.card}>
        <div className={styles.overallSection}>
          <div className={styles.scoreCircle}>
            <div
              className={styles.circleContent}
              style={{
                borderColor: getRiskColor(overallRiskScore),
              }}
            >
              <strong className={styles.scoreText}>{overallRiskScore}</strong>
              <span className={styles.scoreLabel}>/ 100</span>
            </div>
            <div
              className={styles.scoreArc}
              style={{
                background: `conic-gradient(
                  ${getRiskColor(overallRiskScore)} 0deg,
                  ${getRiskColor(overallRiskScore)} ${(overallRiskScore / 100) * 360}deg,
                  rgba(255, 255, 255, 0.05) ${(overallRiskScore / 100) * 360}deg
                )`,
              }}
            />
          </div>

          <div className={styles.overallText}>
            <h3 className={styles.riskTitle}>Overall Risk Assessment</h3>
            <p className={styles.riskDescription}>
              Your organization faces <strong>{riskLevel} Risk</strong> based on current business metrics and data quality.
            </p>
            <div className={styles.riskBadge} style={{ color: getRiskColor(overallRiskScore) }}>
              ● {getRiskLabel(overallRiskScore)} Risk
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.categoriesSection}>
          <h3 className={styles.categoriesTitle}>Risk Breakdown by Category</h3>
          <div className={styles.categoriesGrid}>
            {riskCategories.map((category) => (
              <div key={category.name} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>{category.name}</span>
                </div>

                <div className={styles.scoreBar}>
                  <div
                    className={styles.scoreBarFill}
                    style={{
                      width: `${category.score}%`,
                      backgroundColor: getRiskColor(category.score),
                    }}
                  />
                </div>

                <div className={styles.categoryFooter}>
                  <span className={styles.categoryScore}>{category.score}%</span>
                  <span className={styles.categoryLevel}>
                    {getRiskLabel(category.score)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actionSection}>
          <h3 className={styles.actionTitle}>Recommended Actions</h3>
          <ul className={styles.actionList}>
            <li>
              <span className={styles.actionIcon}>1</span>
              <span>Conduct quarterly revenue forecasting reviews</span>
            </li>
            <li>
              <span className={styles.actionIcon}>2</span>
              <span>Implement expense monitoring dashboard</span>
            </li>
            <li>
              <span className={styles.actionIcon}>3</span>
              <span>Schedule data quality audit and remediation</span>
            </li>
            <li>
              <span className={styles.actionIcon}>4</span>
              <span>Establish risk mitigation protocols</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
