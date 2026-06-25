import { type AnalysisPayload, type DatasetPayload } from '@/services/data';
import styles from './DataStoryBoard.module.css';

interface DataStoryBoardProps {
  payload: DatasetPayload;
  analysis?: AnalysisPayload;
}

function inferDatasetDomain(columns: string[]): { domain: string, description: string } {
  const text = columns.join(' ').toLowerCase();
  
  if (/patient|hospital|blood|heart|diagnosis|treatment|doctor|disease|health|medical|symptom|glucose|bmi|insulin/i.test(text)) {
    return {
      domain: 'Healthcare & Medical',
      description: 'healthcare data, likely containing patient records, medical readings, and diagnosis information'
    };
  }
  if (/customer|order|product|price|cart|shipping|discount|sale|retail|purchase/i.test(text)) {
    return {
      domain: 'E-commerce & Retail',
      description: 'retail or e-commerce data, containing customer transactions, product details, and sales metrics'
    };
  }
  if (/bank|account|loan|credit|mortgage|finance|investment|salary|income|debt|balance/i.test(text)) {
    return {
      domain: 'Finance & Banking',
      description: 'financial data, tracking monetary transactions, account details, or financial health indicators'
    };
  }
  if (/employee|hr|hire|manager|tenure|attrition|department|role|performance|work/i.test(text)) {
    return {
      domain: 'Human Resources',
      description: 'workforce data, containing employee records, organizational roles, and performance or attrition metrics'
    };
  }
  if (/property|house|rent|square_feet|zipcode|rooms|estate/i.test(text)) {
    return {
      domain: 'Real Estate',
      description: 'real estate data, tracking property features, locations, and market values'
    };
  }
  if (/student|grade|score|school|teacher|course|class|university|exam/i.test(text)) {
    return {
      domain: 'Education',
      description: 'educational data, measuring academic performance, scores, and institutional records'
    };
  }
  if (/user|session|click|visit|browser|device|bounce/i.test(text)) {
    return {
      domain: 'Web Analytics',
      description: 'web analytics data, tracking user interactions, sessions, and platform engagement'
    };
  }

  // Fallback
  return {
    domain: 'General Operations',
    description: 'business operational data, tracking a variety of quantitative and categorical metrics'
  };
}

export default function DataStoryBoard({ payload, analysis }: DataStoryBoardProps) {
  const isHealthy = (analysis?.health_score ?? 90) > 80;
  const allColumns = [...(payload.numerical_columns || []), ...(payload.categorical_columns || [])];
  const { domain, description } = inferDatasetDomain(allColumns);
  
  // Pick a few interesting column names to mention
  const topColumns = allColumns.filter(c => !c.toLowerCase().includes('id')).slice(0, 3).join(', ') || allColumns.slice(0, 3).join(', ');

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>📖</span>
          <h2 className={styles.title}>The Data Story</h2>
        </div>
        <div className={styles.content}>
          <p>
            Welcome to your dataset overview! Based on the fields provided—such as <span className={styles.highlight}>{topColumns}</span>—this appears to be <strong>{description}</strong>. 
            We've analyzed <strong>{payload.rows.toLocaleString()}</strong> records across <strong>{payload.columns}</strong> distinct features to bring you these insights.
          </p>
          <p>
            Overall, your dataset is <span className={styles.highlight}>{isHealthy ? 'very healthy and clean' : 'showing some signs of missing data or anomalies'}</span>. 
            From this analysis, we can identify hidden patterns, isolate critical anomalies, and determine which features are driving the most variance in your {domain.toLowerCase()}.
          </p>
          <p>
            Review the comprehensive summary below to understand the exact structure, quality, and predictive potential of your data.
          </p>
        </div>
      </div>
    </section>
  );
}
