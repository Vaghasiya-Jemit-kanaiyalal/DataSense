import styles from './page.module.css';

export default function AIInsightsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>AI Insights</h1>
        <p>
          Smart recommendations and narrative insights from your cleaned dataset will appear here.
          Upload and finish cleaning a dataset to get started.
        </p>
      </div>
    </div>
  );
}
