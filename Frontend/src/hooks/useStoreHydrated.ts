'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

/** Wait until persisted Zustand state is loaded from localStorage. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
