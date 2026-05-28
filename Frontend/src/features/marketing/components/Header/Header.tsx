'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import styles from './Header.module.css';

/** Navigation items shown in both desktop and mobile menus. */
type NavItem = {
  label: string;
  href: string;
  hasDropdown?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
  { label: 'Company', href: '#company', hasDropdown: true },
];

/** Inline SVG logo — purple gradient circle with a small pulse/chart line. */
function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#logoGrad)" />
      {/* Pulse / chart polyline */}
      <polyline
        points="7,18 11,18 13,12 16,22 19,10 22,18 25,18"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small chevron-down arrow for dropdown nav items. */
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* ---- Logo ---- */}
          <Link href="/" className={styles.logo} aria-label="DataSense home">
            <LogoIcon className={styles.logoIcon} />
            <span className={styles.logoText}>DataSense</span>
          </Link>

          {/* ---- Desktop Navigation ---- */}
          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className={styles.navLink}>
                {item.label}
                {item.hasDropdown && <ChevronDown className={styles.dropdownArrow} />}
              </a>
            ))}
          </nav>

          {/* ---- Right side actions ---- */}
          <div className={styles.actions}>
            <a href="#get-started" className={styles.ctaButton}>
              Get Started&nbsp;&rarr;
            </a>

            {/* Hamburger — visible only on mobile */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
              onClick={toggleMobile}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>
        </div>
      </header>

      {/* ---- Mobile Menu Overlay ---- */}
      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!mobileOpen}
      >
        <nav aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={closeMobile}
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className={styles.dropdownArrow} />}
            </a>
          ))}
        </nav>
        <a href="#get-started" className={styles.mobileCta} onClick={closeMobile}>
          Get Started&nbsp;&rarr;
        </a>
      </div>
    </>
  );
}
