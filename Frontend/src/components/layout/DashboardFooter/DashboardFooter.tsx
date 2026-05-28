'use client';

import Link from 'next/link';
import styles from './DashboardFooter.module.css';

function LinkedInIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.27 14H1.82V5.6h2.45V14zM3.04 4.55a1.28 1.28 0 1 1 0-2.55 1.28 1.28 0 0 1 0 2.55zM14 14h-2.44V9.9c0-.98-.02-2.24-1.37-2.24-1.37 0-1.58 1.07-1.58 2.17V14H6.17V5.6h2.35v1.15h.03a2.57 2.57 0 0 1 2.32-1.27c2.48 0 2.94 1.63 2.94 3.76V14z" /></svg>;
}

function GitHubIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1a7 7 0 0 0-2.21 13.64c.35.06.48-.15.48-.34l-.01-1.2c-1.96.43-2.37-.94-2.37-.94-.32-.81-.78-1.03-.78-1.03-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.56-.18-3.2-.78-3.2-3.48 0-.77.27-1.4.72-1.89-.07-.18-.31-.9.07-1.87 0 0 .59-.19 1.93.72a6.7 6.7 0 0 1 3.5 0c1.34-.91 1.93-.72 1.93-.72.38.97.14 1.69.07 1.87.45.5.72 1.12.72 1.89 0 2.71-1.65 3.3-3.22 3.47.25.22.48.65.48 1.31l-.01 1.94c0 .19.13.41.49.34A7 7 0 0 0 8 1z" /></svg>;
}

function TwitterIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.86 2h2.06L10.14 7.3 15.8 14h-4.36l-3.4-4.44L4.16 14H2.1l5.1-5.63L1.8 2h4.47l3.07 4.06L12.86 2zm-.72 10.8h1.14L5.52 3.17H4.3l7.84 9.63z" /></svg>;
}

function EmailIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M2 5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const columns = [
  { title: 'PRODUCT', links: ['Features', 'How It Works', 'Model Leaderboard', 'Security'] },
  { title: 'SOLUTIONS', links: ['Data Cleaning', 'Feature Engineering', 'ML Model Training', 'Analytics Acceleration'] },
  { title: 'COMPANY', links: ['About Us', 'Privacy Policy', 'Terms of Service', 'Contact'] },
  { title: 'RESOURCES', links: ['Documentation', 'Guides', 'Release Notes', 'Support'] },
];

const socials = [
  { label: 'LinkedIn', icon: LinkedInIcon },
  { label: 'GitHub', icon: GitHubIcon },
  { label: 'Twitter', icon: TwitterIcon },
  { label: 'Email', icon: EmailIcon },
];

export default function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandName}>DATA<span>SENSE</span></Link>
          <p>AI-powered insights for smarter, faster decisions.</p>
          <div className={styles.socialRow}>
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a key={social.label} href="#" aria-label={social.label}>
                  <Icon className={styles.socialIcon} />
                </a>
              );
            })}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className={styles.column}>
            <h2>{column.title}</h2>
            {column.links.map((link) => <a key={link} href="#">{link}</a>)}
          </div>
        ))}

        <div className={styles.column}>
          <h2>CONNECT</h2>
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a key={social.label} href="#" className={styles.socialLink}>
                <Icon className={styles.socialIcon} />
                {social.label}
              </a>
            );
          })}
        </div>
      </div>
      <p className={styles.copy}>© 2025 DataSense. All rights reserved.</p>
    </footer>
  );
}
