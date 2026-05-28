'use client';

import styles from './Footer.module.css';

const footerLinks = {
  product: {
    title: 'Product',
    links: ['Features', 'Pricing', 'How It Works', 'API'],
  },
  resources: {
    title: 'Resources',
    links: ['Documentation', 'Blog', 'Community', 'Tutorials'],
  },
  company: {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Privacy Policy'],
  },
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand column */}
          <div className={styles.brandColumn}>
            <div className={styles.logo}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="28" height="28" rx="6" fill="#7c3aed" />
                <path
                  d="M8 9H14C16.7614 9 19 11.2386 19 14C19 16.7614 16.7614 19 14 19H8V9Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle cx="14" cy="14" r="2" fill="white" />
              </svg>
              <span className={styles.logoText}>DataSense</span>
            </div>
            <p className={styles.brandDescription}>
              Transform your raw data into actionable insights with AI-powered
              analytics. Built for modern teams who demand speed and precision.
            </p>
            <div className={styles.socialIcons}>
              {/* Twitter / X */}
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((column) => (
            <div key={column.title} className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>{column.title}</h4>
              <ul className={styles.linkList}>
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className={styles.link}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 DataSense. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.link}>
              Terms of Service
            </a>
            <a href="#" className={styles.link}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
