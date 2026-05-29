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
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      const { isAuthenticated, accessToken } = useAuthStore.getState();
      if (!isAuthenticated || !accessToken) {
        router.replace('/signin');
      }
      setIsChecking(false);
    });
    if (useAuthStore.persist.hasHydrated()) {
      const { isAuthenticated, accessToken } = useAuthStore.getState();
      if (!isAuthenticated || !accessToken) {
        router.replace('/signin');
      }
      setIsChecking(false);
    }
    return unsub;
  }, [router]);

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
