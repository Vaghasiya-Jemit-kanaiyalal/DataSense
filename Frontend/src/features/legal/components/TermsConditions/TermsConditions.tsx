import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import styles from './TermsConditions.module.css';

const ACCEPTABLE_USE_ITEMS = [
  'upload malicious files',
  'upload illegal content',
  'misuse the platform',
  'attempt unauthorized access',
] as const;

export default function TermsConditions() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Terms &amp; Conditions</h1>
          <p className={styles.subtitle}>
            Please read these Terms &amp; Conditions carefully before using the DataSense platform.
          </p>
        </header>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.sectionBody}>
              By accessing or using DataSense, you agree to be bound by these Terms &amp; Conditions.
              If you do not agree, please do not use the platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. User Accounts</h2>
            <p className={styles.sectionBody}>
              You are responsible for maintaining the confidentiality of your account credentials and
              for all activity that occurs under your account. You must provide accurate information
              when registering and notify us promptly of any unauthorized use.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Dataset Upload Policy</h2>
            <p className={styles.sectionBody}>
              You are solely responsible for any datasets you upload to DataSense. You must ensure
              that you have the right to use, process, and analyze the data you submit, and that
              your uploads comply with applicable laws and third-party rights.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. AI Analysis Disclaimer</h2>
            <p className={styles.sectionBody}>
              AI-generated insights, predictions, and recommendations provided by DataSense are for
              informational purposes only. They should not be treated as financial, medical, legal,
              or other professional advice. Always verify important decisions with qualified
              professionals and your own analysis.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Data Privacy</h2>
            <p className={styles.sectionBody}>
              Uploaded datasets are processed to deliver analysis, cleaning, visualization, and related
              features within the platform.
            </p>
            <p className={styles.sectionBody}>
              You should avoid uploading sensitive personal information unless you are authorized to
              do so and understand how that data will be handled.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Acceptable Use</h2>
            <p className={styles.sectionBody}>Users must not:</p>
            <ul className={styles.list}>
              {ACCEPTABLE_USE_ITEMS.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Intellectual Property</h2>
            <p className={styles.sectionBody}>
              The DataSense platform, including its branding, software, design, and underlying
              technology, is owned by DataSense and protected by applicable intellectual property
              laws. These Terms do not grant you ownership of any platform assets.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Limitation of Liability</h2>
            <p className={styles.sectionBody}>
              AI predictions and insights may contain inaccuracies or incomplete information.
              DataSense is provided on an &ldquo;as is&rdquo; basis, and we are not liable for
              decisions or outcomes based on platform outputs to the fullest extent permitted by
              law.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Changes to Terms</h2>
            <p className={styles.sectionBody}>
              We may update these Terms &amp; Conditions from time to time. Continued use of the
              platform after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Contact Information</h2>
            <p className={styles.sectionBody}>
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:support@datasense.ai" className={styles.contactLink}>
                support@datasense.ai
              </a>
              .
            </p>
          </section>
        </div>

        <footer className={styles.footer}>
          <p className={styles.lastUpdated}>Last Updated: June 2026</p>
          <Link href={ROUTES.SIGNUP} className={styles.backLink}>
            Back to Sign Up
          </Link>
        </footer>
      </div>
    </div>
  );
}
