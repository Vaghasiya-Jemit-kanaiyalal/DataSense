import styles from './CleaningPanel.module.css';

const stats = [
  { label: 'Total Rows', value: '17,890', tone: 'blue', icon: 'database' },
  { label: 'Total Columns', value: '17', tone: 'purple', icon: 'grid' },
  { label: 'Missing Values', value: '0', tone: 'amber', icon: 'warning' },
  { label: 'Outliers', value: '2,514', tone: 'red', icon: 'pulse' },
  { label: 'Numeric Columns', value: '6', tone: 'teal', icon: 'hash' },
  { label: 'Categorical Columns', value: '11', tone: 'green', icon: 'text' },
];

const columns = [
  { name: 'age', type: 'Numeric', missing: '0 missing', tone: 'blue' },
  { name: 'job', type: 'Categorical', missing: '0 missing', tone: 'green' },
  { name: 'marital', type: 'Categorical', missing: '0 missing', tone: 'green' },
  { name: 'education', type: 'Categorical', missing: '0 missing', tone: 'green' },
  { name: 'default', type: 'Boolean', missing: '0 missing', tone: 'green' },
  { name: 'balance', type: 'Numeric', missing: '513 missing', tone: 'blue', alert: true },
  { name: 'housing', type: 'Boolean', missing: '0 missing', tone: 'green' },
];

const cleaningActions = [
  { title: 'Drop Duplicates', detail: 'Remove duplicate rows from dataset', tone: 'purple', icon: 'beaker' },
  { title: 'Replace Values', detail: 'Replace specific values in columns', tone: 'green', icon: 'refresh' },
  { title: 'Handle Missing Values', detail: 'Fill or remove missing data', tone: 'amber', icon: 'warning' },
  { title: 'Handle Imbalance', detail: 'Balance target classes', tone: 'purple', icon: 'scale' },
  { title: 'Handle Outliers', detail: 'Detect and handle outliers', tone: 'red', icon: 'target' },
  { title: 'Encoding', detail: 'Convert categorical to numeric', tone: 'green', icon: 'encode' },
  { title: 'Feature Scaling', detail: 'Scale numerical features', tone: 'blue', icon: 'filter' },
];

const utilityActions = [
  { title: 'Drop Column', detail: 'Remove unwanted columns', tone: 'red', icon: 'trash' },
  { title: 'Preview Data', detail: 'View processed data', tone: 'blue', icon: 'eye' },
];

function Icon({ name }: { name: string }) {
  if (name === 'database') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7c0 2 14 2 14 0S5 5 5 7Zm0 0v5c0 2 14 2 14 0V7M5 12v5c0 2 14 2 14 0v-5" /></svg>;
  }
  if (name === 'grid') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" /></svg>;
  }
  if (name === 'warning') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 20H3L12 4Zm0 5v5m0 3h.01" /></svg>;
  }
  if (name === 'pulse') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>;
  }
  if (name === 'hash') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4 6 20M16 4l-2 16M4 9h16M3 15h16" /></svg>;
  }
  if (name === 'text') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14M12 5v14M8 19h8" /></svg>;
  }
  if (name === 'beaker') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v5l-4 7a4 4 0 0 0 3.5 6h7a4 4 0 0 0 3.5-6l-4-7V3M8 3h8M7 16h10" /></svg>;
  }
  if (name === 'refresh') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6.8 6.7M5.5 15a7 7 0 0 0 11.7 2.3" /></svg>;
  }
  if (name === 'scale') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M5 8h14M7 8l-3 6h6L7 8Zm10 0-3 6h6l-3-6Z" /></svg>;
  }
  if (name === 'target') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M16 8a5.7 5.7 0 1 1-8 8 5.7 5.7 0 0 1 8-8Z" /></svg>;
  }
  if (name === 'encode') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 15 4-4 3 3 5-7M5 20c4-2 8-2 12 0M17 7h3v3" /></svg>;
  }
  if (name === 'filter') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" /></svg>;
  }
  if (name === 'trash') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12M9 7V4h6v3M8 10v9h8v-9M10 12v5M14 12v5" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>;
}

function Chevron() {
  return <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>;
}

export default function CleaningPanel() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <h1>Data Cleaning</h1>
            <p>Inspect, clean, and prepare your dataset by handling missing values, outliers, and improving feature quality before further processing.</p>
          </div>
          <div className={styles.steps} aria-label="Cleaning steps">
            <div className={styles.stepActive}>
              <span>1</span>
              <strong>Missing Values</strong>
              <small>Step 1</small>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <span>2</span>
              <strong>Missing Values</strong>
              <small>Step 2</small>
            </div>
          </div>
        </section>

        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <article key={stat.label} className={styles.statCard}>
              <div className={`${styles.iconBox} ${styles[stat.tone]}`}>
                <Icon name={stat.icon} />
              </div>
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.mainGrid}>
          <article className={styles.panel}>
            <h2>Columns Overview</h2>
            <div className={styles.list}>
              {columns.map((column) => (
                <button className={styles.rowButton} type="button" key={column.name}>
                  <span className={`${styles.iconBox} ${styles[column.tone]}`}><Icon name={column.tone === 'blue' ? 'hash' : 'text'} /></span>
                  <span className={styles.rowText}>
                    <strong>{column.name}</strong>
                    <small className={styles[column.tone]}>{column.type}</small>
                  </span>
                  <span className={column.alert ? styles.alertText : styles.mutedText}>{column.missing}</span>
                  <Chevron />
                </button>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>Cleaning Actions</h2>
            <div className={styles.list}>
              {cleaningActions.map((action) => (
                <button className={styles.rowButton} type="button" key={action.title}>
                  <span className={`${styles.iconBox} ${styles[action.tone]}`}><Icon name={action.icon} /></span>
                  <span className={styles.rowText}>
                    <strong>{action.title}</strong>
                    <small>{action.detail}</small>
                  </span>
                  <Chevron />
                </button>
              ))}
            </div>
          </article>

          <div className={styles.sideStack}>
            <article className={styles.panel}>
              <h2>Utility Actions</h2>
              <div className={styles.list}>
                {utilityActions.map((action) => (
                  <button className={styles.rowButton} type="button" key={action.title}>
                    <span className={`${styles.iconBox} ${styles[action.tone]}`}><Icon name={action.icon} /></span>
                    <span className={styles.rowText}>
                      <strong>{action.title}</strong>
                      <small>{action.detail}</small>
                    </span>
                    <Chevron />
                  </button>
                ))}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.controlHeader}>
                <h2>Dataset Controls</h2>
                <span>3 Steps</span>
              </div>
              <div className={styles.controls}>
                <div className={styles.controlRail} aria-hidden="true">
                  <span className={styles.orange}>1</span>
                  <i />
                  <span className={styles.blue}>2</span>
                  <i />
                  <span className={styles.green}>3</span>
                </div>
                <div className={styles.controlButtons}>
                  <button className={styles.undoButton} type="button">Undo Last Step</button>
                  <button className={styles.downloadButton} type="button">Download CSV</button>
                  <button className={styles.finalizeButton} type="button">Finalize Dataset</button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <button className={styles.visualizeButton} type="button">
          <Icon name="encode" />
          Let&apos;s Visualize It
        </button>
      </div>
    </div>
  );
}
