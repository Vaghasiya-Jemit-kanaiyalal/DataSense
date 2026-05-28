import styles from './PreviewPanel.module.css';

const previewRows = [
  ['0', '29', 'management', 'married', 'tertiary', 'no', '231', 'yes', 'no', 'cellular', '19', '...'],
  ['1', '41', 'technician', 'single', 'secondary', 'no', '1389', 'yes', 'no', 'cellular', '11', '...'],
  ['2', '56', 'entrepreneur', 'married', 'tertiary', 'no', '264', 'yes', 'yes', 'cellular', '3', '...'],
  ['3', '42', 'management', 'single', 'tertiary', 'yes', '-7', 'yes', 'no', 'cellular', '5', '...'],
  ['4', '37', 'blue-collar', 'married', 'secondary', 'no', '50', 'yes', 'no', 'unknown', '23', '...'],
  ['...', '...', '...', '...', '...', '...', '...', '...', '...', '...', '...', '...'],
];

const tableHeaders = ['', 'age', 'job', 'marital', 'education', 'default', 'balance', 'housing', 'loan', 'contact', 'day', '...'];
const numericColumns = ['age', 'balance', 'day', 'campaign', 'pdays', 'previous'];
const categoricalColumns = ['job', 'marital', 'education', 'default', 'housing', 'loan', 'contact', 'month', 'poutcome', 'y', 'other'];

const summaryRows = [
  ['age', '18', '95', '40.94', '39.00', '10.62'],
  ['balance', '-8019', '102127', '1362.27', '448.00', '3044.77'],
  ['day', '1', '31', '15.81', '16.00', '8.32'],
  ['campaign', '1', '63', '2.57', '2.00', '2.77'],
  ['pdays', '-1', '871', '40.20', '-1.00', '100.12'],
  ['previous', '0', '275', '0.58', '0.00', '2.30'],
  ['...', '...', '...', '...', '...', '...'],
];

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      <path d="M7 12h10" />
    </svg>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button className={styles.iconButton} type="button" aria-label={label}>
      {children}
    </button>
  );
}

export default function PreviewPanel() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>
              <FolderIcon />
            </div>
            <div>
              <h1>Dataset Preview</h1>
              <p>Preview your dataset and explore key information before cleaning.</p>
            </div>
          </div>
          <button className={styles.removeButton} type="button">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 2h4l.6 1.2H14M2 3.2h12M4 5.5V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5.5M6.5 7v4.5M9.5 7v4.5" />
            </svg>
            Remove Dataset
          </button>
        </section>

        <section className={styles.previewCard}>
          <div className={styles.cardHeader}>
            <h2><span />First 100 rows preview</h2>
            <div className={styles.tableActions}>
              <p>Rows: 17,890 <span>•</span> Columns: 17</p>
              <IconButton label="Download preview">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 2v8M5 7l3 3 3-3M3 13h10" />
                </svg>
              </IconButton>
              <IconButton label="Expand preview">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 3H3v3M10 3h3v3M6 13H3v-3M10 13h3v-3M3 3l4 4M13 3l-4 4M3 13l4-4M13 13l-4-4" />
                </svg>
              </IconButton>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${row[0]}-${index}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <label>
              Rows per page:
              <select defaultValue="5" aria-label="Rows per page">
                <option>5</option>
                <option>10</option>
                <option>25</option>
              </select>
            </label>
            <div className={styles.pageControls}>
              <span>1–5 of 17,890</span>
              <button type="button" aria-label="Previous page">‹</button>
              <button className={styles.activePage} type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <span>...</span>
              <button type="button">3578</button>
              <button type="button" aria-label="Next page">›</button>
            </div>
          </div>
        </section>

        <section className={styles.statsGrid} aria-label="Dataset totals">
          <article className={`${styles.statCard} ${styles.blue}`}>
            <div className={styles.statIcon}>▰</div>
            <div><p>Total Rows</p><strong>17,890</strong></div>
          </article>
          <article className={`${styles.statCard} ${styles.purple}`}>
            <div className={styles.statIcon}>▦</div>
            <div><p>Total Columns</p><strong>17</strong></div>
          </article>
          <article className={`${styles.statCard} ${styles.green}`}>
            <div className={styles.statIcon}>#</div>
            <div><p>Numeric Columns</p><strong>6</strong></div>
          </article>
          <article className={`${styles.statCard} ${styles.amber}`}>
            <div className={styles.statIcon}>☷</div>
            <div><p>Categorical Columns</p><strong>11</strong></div>
          </article>
        </section>

        <section className={styles.columnsGrid}>
          <article className={styles.panel}>
            <h2><span className={styles.blueDot} />Numeric Columns (6)</h2>
            <div className={styles.chips}>
              {numericColumns.map((column) => <span key={column}>{column}</span>)}
            </div>
          </article>
          <article className={styles.panel}>
            <h2><span className={styles.purpleDot} />Categorical Columns (11)</h2>
            <div className={styles.chips}>
              {categoricalColumns.map((column) => <span key={column}>{column}</span>)}
            </div>
          </article>
        </section>

        <section className={styles.summaryCard}>
          <h2>
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <path d="M2 14h14M3 12l4-4 3 3 5-7M13 4h2v2" />
            </svg>
            Statistical Summary
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Mean</th>
                  <th>Median</th>
                  <th>Std</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => <td key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.cleanCard}>
          <div className={styles.cleanCopy}>
            <div className={styles.cleanIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7c0 2 14 2 14 0S5 5 5 7Zm0 0v5c0 2 14 2 14 0V7M5 12v5c0 2 14 2 14 0v-5" />
              </svg>
            </div>
            <div>
              <h2>Ready to clean your data?</h2>
              <p>Start the cleaning process and let DataSense analyze and clean your dataset.</p>
            </div>
          </div>
          <button className={styles.cleanButton} type="button">
            <span>✦</span>
            Start Cleaning
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </section>
      </div>
    </div>
  );
}
