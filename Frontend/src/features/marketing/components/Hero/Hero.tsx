import styles from './Hero.module.css';

const STAR_COUNT = 18;
const WAVE_COUNT = 7;

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.starField} aria-hidden="true">
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <span
            className={`${styles.star} ${styles[`star${index + 1}`]}`}
            key={`star-${index + 1}`}
          />
        ))}
      </div>

      <div className={styles.dotField} aria-hidden="true" />

      <div className={styles.waveScene} aria-hidden="true">
        {Array.from({ length: WAVE_COUNT }, (_, index) => (
          <span
            className={`${styles.wave} ${styles[`wave${index + 1}`]}`}
            key={`wave-${index + 1}`}
          />
        ))}
        <div className={styles.waveGrid} />
      </div>

      <div className={styles.content}>
        <div className={styles.subtitlePill}>
          <span className={styles.subtitleDot} />
          <span className={styles.subtitleText}>
            DataSense - AI-Powered Data Analytics
          </span>
        </div>

        <h1 className={styles.heading}>
          Forge <span className={styles.headingIntelligence}>Intelligence</span>
          <br />
          From Your Data
        </h1>

        <p className={styles.description}>
          Clean, analyze, visualize and generate actionable insights from your
          data in seconds. Built for analysts, by analysts.
        </p>

        <div className={styles.ctaGroup}>
          <button className={styles.ctaPrimary} type="button">
            Get Started Free
            <span className={styles.ctaArrow}>-&gt;</span>
          </button>
          <button className={styles.ctaSecondary} type="button">
            <span className={styles.playIcon}>
              <span className={styles.playTriangle} />
            </span>
            View Demo
          </button>
        </div>

        <p className={styles.trustText}>
          Trusted by teams who{' '}
          <span className={styles.trustHighlight}>move faster</span> with their
          data.
        </p>
      </div>

      <div className={styles.bottomFade} />
    </section>
  );
}
