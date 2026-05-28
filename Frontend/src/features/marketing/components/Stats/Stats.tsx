'use client';

import styles from './Stats.module.css';

const stats = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 20H21" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 16V12" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 16V8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 16V10" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 16V4" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    value: '10K+',
    description: 'Datasets Processed',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" fill="#7c3aed" />
      </svg>
    ),
    value: '98%',
    description: 'Accuracy Achieved',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    value: '5X',
    description: 'Faster Insights',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    value: '4.9/5',
    description: 'User Satisfaction',
  },
];

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.stat}>
            <div className={styles.iconWrapper}>{stat.icon}</div>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.description}>{stat.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
