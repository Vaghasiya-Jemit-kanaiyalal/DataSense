'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import styles from './SignUpForm.module.css';

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!agreeToTerms) {
      return;
    }

    try {
      await signup(fullName, email, password);
      router.push('/upload');
    } catch {
      // error is set in the store
    }
  };

  return (
    <div className={styles.page}>
      {/* ---- Animated Background ---- */}
      <div className={styles.backgroundEffects}>
        {/* Glowing dots */}
        <div className={`${styles.dot} ${styles.dot1}`} />
        <div className={`${styles.dot} ${styles.dot2}`} />
        <div className={`${styles.dot} ${styles.dot3}`} />
        <div className={`${styles.dot} ${styles.dot4}`} />
        <div className={`${styles.dot} ${styles.dot5}`} />

        {/* Animated wave lines at bottom */}
        <div className={styles.wavesContainer}>
          <svg
            viewBox="0 0 2400 320"
            preserveAspectRatio="none"
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id="wave1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="wave2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="wave3Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="wave4Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            {/* Wave line 1 */}
            <path
              d="M0,240 C150,200 350,280 600,220 C850,160 1050,260 1200,240 C1350,220 1550,180 1800,230 C2050,280 2250,200 2400,240 L2400,320 L0,320 Z"
              fill="none"
              stroke="url(#wave1Grad)"
              strokeWidth="1.5"
            />
            {/* Wave line 2 */}
            <path
              d="M0,260 C200,220 400,300 650,250 C900,200 1100,280 1300,260 C1500,240 1700,200 1900,250 C2100,300 2300,230 2400,260"
              fill="none"
              stroke="url(#wave2Grad)"
              strokeWidth="1.2"
            />
            {/* Wave line 3 */}
            <path
              d="M0,280 C180,250 380,310 620,270 C860,230 1060,290 1250,280 C1440,270 1640,240 1850,270 C2060,300 2260,260 2400,280"
              fill="none"
              stroke="url(#wave3Grad)"
              strokeWidth="1"
            />
            {/* Wave line 4 — subtle fill */}
            <path
              d="M0,290 C200,270 450,310 700,280 C950,250 1150,300 1350,290 C1550,280 1750,260 2000,285 C2200,310 2350,275 2400,290 L2400,320 L0,320 Z"
              fill="url(#wave4Grad)"
              stroke="url(#wave4Grad)"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>

      {/* ---- Card ---- */}
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26 2L48.5 15.5V38.5L26 50L3.5 38.5V15.5L26 2Z"
              fill="rgba(124,58,237,0.12)"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x="18" y="16" width="2.5" height="20" rx="1.25" fill="#7c3aed" />
            <rect x="24.75" y="12" width="2.5" height="28" rx="1.25" fill="#7c3aed" />
            <rect x="31.5" y="18" width="2.5" height="16" rx="1.25" fill="#7c3aed" />
          </svg>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Create <span className={styles.titleAccent}>Account</span>
          </h1>
          <p className={styles.subtitle}>
            Join DataSense and start your data intelligence journey.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className={styles.errorMessage}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
              </svg>
            </span>
            <input
              type="text"
              className={styles.input}
              placeholder="Full Name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </span>
            <input
              type="email"
              className={styles.input}
              placeholder="Email Address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputWithToggle}`}
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Checkbox */}
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              className={styles.checkbox}
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="terms" className={styles.checkboxLabel}>
              I agree to the{' '}
              <Link href="/terms" className={styles.checkboxLink}>
                Terms &amp; Conditions
              </Link>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitButton} disabled={isLoading || !agreeToTerms}>
            {isLoading ? (
              <span className={styles.buttonSpinner}>
                <svg className={styles.spinnerIcon} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
                </svg>
                Creating account…
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>Or sign up with</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Social Buttons */}
        <div className={styles.socialButtons}>
          {/* Google */}
          <button type="button" className={styles.socialButton} aria-label="Sign up with Google">
            <svg viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>

          {/* GitHub */}
          <button type="button" className={styles.socialButton} aria-label="Sign up with GitHub">
            <svg viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>

          {/* Email/Mail */}
          <button type="button" className={styles.socialButton} aria-label="Sign up with Email">
            <svg viewBox="0 0 20 20" fill="#ffffff">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/signin" className={styles.footerLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
