'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { resolvePostAuthRoute } from '@/services/data';
import { useAuthStore } from '@/store/authStore';
import logoImg from '@/assets/logo.png';
import styles from './SignInForm.module.css';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      const callback = searchParams.get('callbackUrl');
      if (callback && callback.startsWith('/') && !callback.startsWith('//')) {
        router.push(callback);
        return;
      }
      router.push(await resolvePostAuthRoute());
    } catch {
      // error is set in the store
    }
  };

  return (
    <div className={styles.page}>
      {/* Background image (brick wall with lamp) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brick-wall-lamp.png"
        alt=""
        className={styles.bgImage}
        aria-hidden="true"
      />
      <div className={styles.bgOverlay} />

      {/* Home navigation */}
      <Link href="/" className={styles.homeNav}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Home
      </Link>

      {/* Glassmorphism login card */}
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logoLink}>
            <Image src={logoImg} alt="DataSense" width={140} height={40} className={styles.logo} priority />
          </Link>
        </div>
        <h1 className={styles.title}>Login</h1>

        {error && (
          <div className={styles.errorMessage}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Username / Email field */}
          <div className={styles.inputGroup}>
            <input
              type="email"
              className={styles.input}
              placeholder="Username"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              id="signin-email"
            />
            <span className={styles.inputIcon}>
              {/* User icon */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </span>
          </div>

          {/* Password field */}
          <div className={styles.inputGroup}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputWithToggle}`}
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              id="signin-password"
            />
            <span className={styles.inputIcon}>
              {/* Lock icon */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
              </svg>
            </span>
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ right: '46px' }}
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Remember me / Forgot password row */}
          <div className={styles.optionsRow}>
            <label className={styles.rememberLabel} htmlFor="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                className={styles.rememberCheckbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {/* Login button */}
          <button type="submit" className={styles.submitButton} disabled={isLoading} id="signin-submit">
            {isLoading ? (
              <span className={styles.buttonSpinner}>
                <svg className={styles.spinnerIcon} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
                </svg>
                Signing in…
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={styles.footerLink}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
