'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from './AppHeader.module.css';

/* ──── Inline SVG Icons ──── */

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
        <linearGradient id="appLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#appLogoGrad)" />
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2.5 6.5L8 2l5.5 4.5V13a1 1 0 0 1-1 1h-3V10H6.5v4h-3a1 1 0 0 1-1-1V6.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureAnalysisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.5" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13.3 13.3L14.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 14a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function AIInsightsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ──── Navigation Configurations ──── */

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

/** Full navigation for all pages except auth */
const FULL_NAV_ITEMS: NavItem[] = [
  { label: 'Home',             href: '/',              icon: HomeIcon },
  { label: 'Upload',           href: '/upload',        icon: UploadIcon },
  { label: 'Feature Analysis', href: '/preview',       icon: FeatureAnalysisIcon },
  { label: 'Visualization',    href: '/visualization', icon: VisualizationIcon },
  { label: 'AI Insights',      href: '/ai-insights',   icon: AIInsightsIcon },
];

/** Minimal navigation for auth pages */
const AUTH_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: HomeIcon },
];

/* ──── Component ──── */

export type AppHeaderVariant = 'full' | 'auth';

interface AppHeaderProps {
  /** 'full' shows all nav links; 'auth' shows only Home */
  variant?: AppHeaderVariant;
}

export default function AppHeader({ variant = 'full' }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
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

  const navItems = variant === 'auth' ? AUTH_NAV_ITEMS : FULL_NAV_ITEMS;

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* ---- Logo ---- */}
          <Link href="/" className={styles.logo} aria-label="DataSense home">
            <LogoIcon className={styles.logoIcon} />
            <span className={styles.logoText}>
              Data<span className={styles.logoAccent}>Sense</span>
            </span>
          </Link>

          {/* ---- Center Navigation ---- */}
          <nav className={styles.nav} aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                >
                  <Icon className={styles.navIcon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ---- Right side ---- */}
          <div className={styles.actions} ref={accountRef}>
            {variant === 'full' && isAuthenticated && (
              <button
                type="button"
                className={styles.accountButton}
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((o) => !o)}
              >
                <span className={styles.profileAvatar}>
                  <UserIcon className={styles.accountIcon} />
                </span>
                {user?.name?.split(' ')[0] ?? 'Account'}
                <ChevronDown className={styles.chevronDown} />
              </button>
            )}
            {variant === 'full' && !isAuthenticated && (
              <Link href="/signin" className={styles.signInLink}>
                Sign in
              </Link>
            )}
            {accountOpen && isAuthenticated && (
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
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
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
