'use client';

import React from 'react';
import styles from './Features.module.css';

/* ──────────────────────────────────────────────
   Inline SVG icons – one per feature card
   ────────────────────────────────────────────── */

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M12 18v-6" />
    <path d="m9 15 3-3 3 3" />
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 16l4-8 4 5 4-9" />
  </svg>
);

const CubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

const SlidersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="2" x2="6" y1="14" y2="14" />
    <line x1="10" x2="14" y1="8" y2="8" />
    <line x1="18" x2="22" y1="16" y2="16" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M12 12v6" />
    <path d="m15 17-3 3-3-3" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/* ──────────────────────────────────────────────
   Feature data
   ────────────────────────────────────────────── */

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <UploadIcon />,
    title: 'CSV Upload',
    description:
      'Import your dataset effortlessly. Supports large files with instant previews.',
  },
  {
    icon: <SparkleIcon />,
    title: 'AI Cleaning',
    description:
      'Remove missing values, outliers and inconsistencies using smart AI.',
  },
  {
    icon: <LightbulbIcon />,
    title: 'Smart Insights',
    description:
      'Get AI-powered insights and recommendations based on your data.',
  },
  {
    icon: <ChartIcon />,
    title: 'Feature Analysis',
    description:
      'Explore distributions, correlations and feature importance with ease.',
  },
  {
    icon: <CubeIcon />,
    title: 'Model Explorer',
    description:
      'Train and evaluate models with built-in algorithms and metrics.',
  },
  {
    icon: <SlidersIcon />,
    title: 'Model Tuning',
    description:
      'Fine-tune parameters and improve performance automatically.',
  },
  {
    icon: <DownloadIcon />,
    title: 'Export Reports',
    description:
      'Generate beautiful reports and download insights instantly.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Secure & Private',
    description:
      'Your data is encrypted and never shared. Enterprise grade security.',
  },
];

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.label}>Features That Empower</span>
          <h2 className={styles.title}>
            Built For Data{' '}
            <span className={styles.titleAccent}>Intelligence</span>
          </h2>
          <p className={styles.subtitle}>
            Everything you need — from data cleaning to model insights — all in
            one powerful workspace.
          </p>
        </div>

        {/* ── Grid ── */}
        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.card}>
              <div className={styles.iconWrap}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
              <a href="#" className={styles.learnMore}>
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
