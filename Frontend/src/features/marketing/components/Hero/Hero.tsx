import Image from 'next/image';
import Link from 'next/link';
import homeIllustration from '@/assets/home-ilustration.png';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            AI-powered data analytics
          </p>

          <h1 id="hero-heading" className={styles.heading}>
            Turn raw data into
            <span className={styles.headingAccent}> clear decisions</span>
          </h1>

          <p className={styles.description}>
            Upload, clean, visualize, and explore your datasets in one calm workspace.
            Built for analysts who want speed without the noise.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/upload" className={styles.ctaPrimary}>
              Get started free
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </Link>
            <Link href="#features" className={styles.ctaSecondary}>
              See how it works
            </Link>
          </div>

          <p className={styles.trust}>
            No credit card · CSV & Excel · Pipeline you can undo step by step
          </p>
        </div>

        <div className={styles.visual}>
          <div className={styles.visualGlow} aria-hidden="true" />
          <div className={styles.visualFrame}>
            <Image
              src={homeIllustration}
              alt="Analyst exploring charts and data insights"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 520px"
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
