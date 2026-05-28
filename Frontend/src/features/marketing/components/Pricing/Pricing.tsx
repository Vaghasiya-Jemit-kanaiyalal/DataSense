'use client';

import { useState } from 'react';
import styles from './Pricing.module.css';

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  period: string;
  subtitle: string;
  features: PlanFeature[];
  cta: string;
  featured?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: '₹0',
    annualPrice: '₹0',
    period: '/per month',
    subtitle: 'For getting started',
    features: [
      { text: 'Basic cleaning tools' },
      { text: 'Limited feature analysis' },
      { text: 'Standard visualizations' },
      { text: 'Access to community support' },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    monthlyPrice: '₹499',
    annualPrice: '₹374',
    period: '/per month',
    subtitle: 'For individual analysts',
    features: [
      { text: 'Advanced cleaning tools' },
      { text: 'Detailed feature analysis' },
      { text: 'Model exploration & tuning' },
      { text: 'Export reports & insights' },
      { text: 'High resolution visualizations' },
      { text: 'Priority email support' },
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    period: '',
    subtitle: 'For organizations',
    features: [
      { text: 'All Pro features' },
      { text: 'Custom branding' },
      { text: 'Dedicated onboarding' },
      { text: 'Role-based access control' },
      { text: 'Priority phone support' },
      { text: 'SLA & data protection' },
    ],
    cta: 'Talk to Sales',
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className={styles.section} id="pricing">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.label}>Simple &amp; Transparent</span>
        <h2 className={styles.title}>
          Plans and <span className={styles.titleAccent}>Pricing</span>
        </h2>
        <p className={styles.subtitle}>
          Start free and scale as you grow. Cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className={styles.toggleWrapper}>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${!isAnnual ? styles.toggleBtnActive : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`${styles.toggleBtn} ${isAnnual ? styles.toggleBtnActive : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Annual
          </button>
        </div>
        <span className={styles.saveBadge}>Save up to 25%</span>
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`${styles.card} ${plan.featured ? styles.featured : ''}`}
          >
            {plan.featured && (
              <span className={styles.popularBadge}>Most Popular</span>
            )}

            <h3 className={styles.planName}>{plan.name}</h3>

            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>
                {isAnnual ? plan.annualPrice : plan.monthlyPrice}
              </span>
              {plan.period && (
                <span className={styles.pricePeriod}>{plan.period}</span>
              )}
            </div>

            <p className={styles.planSubtitle}>{plan.subtitle}</p>

            <div className={styles.divider} />

            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li key={feature.text} className={styles.featureItem}>
                  <span
                    className={
                      plan.featured ? styles.checkIconPurple : styles.checkIcon
                    }
                  >
                    ✓
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>

            <button
              className={`${styles.ctaButton} ${
                plan.featured ? styles.ctaFilled : styles.ctaOutlined
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
