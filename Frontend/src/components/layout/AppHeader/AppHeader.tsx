'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import logoImg from '@/assets/logo.png';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/authStore';
import styles from './AppHeader.module.css';

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

type NavItem = {
  label: string;
  href: string;
};

const FULL_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Upload', href: ROUTES.UPLOAD },
  { label: 'Cleaning', href: ROUTES.CLEANING },
  { label: 'Visualization', href: ROUTES.VISUALIZATION },
  { label: 'Feature Analysis', href: ROUTES.FEATURE_ANALYSIS },
  { label: 'AI Insights', href: ROUTES.AI_INSIGHTS },
  { label: 'Predictions', href: ROUTES.PREDICTIONS },
];

const AUTH_NAV_ITEMS: NavItem[] = [{ label: 'Home', href: ROUTES.HOME }];

export type AppHeaderVariant = 'full' | 'auth';

interface AppHeaderProps {
  variant?: AppHeaderVariant;
}

const SCROLL_SHOW_HIDE_THRESHOLD = 120;
const HEADER_OFFSET_VISIBLE = '83px';
const HEADER_OFFSET_HIDDEN = '12px';

export default function AppHeader({ variant = 'full' }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > SCROLL_SHOW_HIDE_THRESHOLD);

      // Reappear if manually hidden, user is scrolling up, and reaches the header region (<= SCROLL_SHOW_HIDE_THRESHOLD)
      if (headerHidden && currentScrollY < lastScrollY.current && currentScrollY <= SCROLL_SHOW_HIDE_THRESHOLD) {
        setHeaderHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [headerHidden]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-header-offset',
      headerHidden ? HEADER_OFFSET_HIDDEN : HEADER_OFFSET_VISIBLE,
    );
  }, [headerHidden]);

  const hideHeader = useCallback(() => {
    setHeaderHidden(true);
    setAccountOpen(false);
    setMobileOpen(false);
  }, []);

  const showHeader = useCallback(() => {
    setHeaderHidden(false);
  }, []);

  const navItems = variant === 'auth' ? AUTH_NAV_ITEMS : FULL_NAV_ITEMS;

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const isLinkActive = (href: string) => {
    if (href === ROUTES.HOME) return pathname === ROUTES.HOME;
    return pathname.startsWith(href);
  };

  const openAccountOrSignIn = () => {
    if (isAuthenticated) {
      setAccountOpen((o) => !o);
      return;
    }
    router.push(ROUTES.SIGNIN);
  };

  const showCollapseControl = scrolled && !headerHidden;

  return (
    <>
      <header className={`${styles.header} ${headerHidden ? styles.headerHidden : ''}`}>
        <div className={styles.accentBar} aria-hidden="true" />
        <div className={styles.container}>
          <Link href={ROUTES.HOME} className={styles.logo} aria-label="DataSense home">
            <Image
              src={logoImg}
              alt="DataSense"
              width={140}
              height={40}
              className={styles.logoImage}
              priority
            />
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions} ref={accountRef}>
            {variant === 'full' && (
              <button
                type="button"
                className={styles.profileButton}
                aria-label={isAuthenticated ? 'Account menu' : 'Sign in'}
                aria-expanded={accountOpen}
                onClick={openAccountOrSignIn}
              >
                <UserIcon className={styles.profileIcon} />
              </button>
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
                    router.push(ROUTES.SIGNIN);
                  }}
                >
                  Log out
                </button>
              </div>
            )}

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

      {showCollapseControl && (
        <button
          type="button"
          className={`${styles.collapseHeaderBtn} ${styles.collapseHeaderBtnVisible}`}
          aria-label="Hide navigation header"
          onClick={hideHeader}
        >
          <ChevronUpIcon />
        </button>
      )}

      {headerHidden && (
        <button
          type="button"
          className={styles.restoreHeaderBtn}
          aria-label="Show navigation header"
          onClick={showHeader}
        >
          <ChevronDownIcon />
        </button>
      )}

      <div
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!mobileOpen}
      >
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                onClick={closeMobile}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {variant === 'full' && (
          <button
            type="button"
            className={styles.mobileProfile}
            onClick={() => {
              closeMobile();
              openAccountOrSignIn();
            }}
          >
            <UserIcon className={styles.profileIcon} />
            {isAuthenticated ? (user?.name ?? 'Account') : 'Sign in'}
          </button>
        )}
      </div>
    </>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.controlIcon}>
      <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.controlIcon}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
