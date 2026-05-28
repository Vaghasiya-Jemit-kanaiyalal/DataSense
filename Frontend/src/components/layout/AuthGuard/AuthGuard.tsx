'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import styles from './AuthGuard.module.css';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow Zustand to hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/signin');
      }
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (isChecking) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
        <p className={styles.loaderText}>Verifying authentication…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
