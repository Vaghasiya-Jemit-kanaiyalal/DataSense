'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from './DashboardHeader.module.css';

/* ──── Inline SVG Icons ──── */

function AvatarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="32" fill="#e8f1ff" />
      <circle cx="32" cy="25" r="10" fill="#101827" />
      <path d="M14 58c2.5-12 9.3-18 18-18s15.5 6 18 18" fill="#111827" />
      <path d="M22 18c3-6 15.5-7 20.5.8 1.5 2.4 1.4 5.8.4 8.3-2.6-5.2-6.4-7.2-11.7-7.2-4.5 0-7.3 1.5-9.2 4.3-.8-2-.9-4.2 0-6.2z" fill="#0f172a" />
      <circle cx="27.5" cy="26" r="1.6" fill="#ffffff" />
      <circle cx="36.5" cy="26" r="1.6" fill="#ffffff" />
      <path d="M28.5 32c2.2 1.7 4.7 1.7 7 0" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2.5 6.5L8 2l5.5 4.5V13a1 1 0 0 1-1 1h-3V10H6.5v4h-3a1 1 0 0 1-1-1V6.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DatasetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 14V9h3v5H2zM6.5 14V6h3v8h-3zM11 14V3h3v11h-3z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CleaningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.5 2.2v7.6a3.8 3.8 0 1 0 5 0V2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5.5 5h5M7.3 8.5h1.6M7.7 11.5h1.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function VisualizationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 14V2M2 14h12M4 11l3-3 2 2 4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 5h2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModelsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 14a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ──── Navigation Items ──── */

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Datasets', href: '/upload', icon: DatasetIcon },
  { label: 'Data Cleaning', href: '/cleaning', icon: CleaningIcon },
  { label: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
  { label: 'Models', href: '/models', icon: ModelsIcon },
  { label: 'Visualization', href: '/visualization', icon: VisualizationIcon },
] as const;

/* ──── Component ──── */

export default function DashboardHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

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
            <AvatarIcon className={styles.avatarIcon} />
            <div className={styles.logoTextGroup}>
              <span className={styles.logoText}>
                Data<span className={styles.logoTextAccent}>Sense</span>
              </span>
              <span className={styles.logoSubtitle}>AI-Powered Data Analytics</span>
            </div>
          </Link>

          {/* ---- Center Navigation ---- */}
          <nav className={styles.nav} aria-label="Dashboard navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ---- Right side actions ---- */}
          <div className={styles.actions} ref={accountRef}>
            <button
              className={styles.accountButton}
              type="button"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((o) => !o)}
            >
              <span className={styles.profileAvatar}>
                <UserIcon className={styles.accountIcon} />
              </span>
              {user?.name?.split(' ')[0] ?? 'Account'}
              <ChevronDown className={styles.chevronDown} />
            </button>
            {accountOpen && (
              <div className={styles.accountMenu} role="menu">
                <div className={styles.accountMeta}>
                  <strong>{user?.name ?? 'User'}</strong>
                  <small>{user?.email}</small>
                </div>
                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={() => {
                    logout();
                    setAccountOpen(false);
                    router.push('/signin');
                  }}
                >
                  Log out
                </button>
              </div>
            )}

            {/* Hamburger — visible only on mobile */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
              onClick={toggleMobile}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              type="button"
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
        <nav aria-label="Mobile dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}
                onClick={closeMobile}
              >
                <Icon className={styles.navIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
