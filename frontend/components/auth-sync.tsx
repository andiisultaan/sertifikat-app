'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/authService';

/**
 * Sinkronisasi token localStorage → cookie + hydrate Zustand user store.
 * Dipanggil sekali saat dashboard layout mount.
 */
export function AuthSync() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearAuth();
      router.replace('/login');
      return;
    }

    // Jika user sudah ada di store, cukup sinkronisasi cookie saja
    if (user) {
      // Pastikan cookie tersinkron (misal setelah hard reload)
      setAuth(user, token);
      return;
    }

    // Fetch profil dari API untuk mengisi store + cookie
    authService.me()
      .then((me) => setAuth(me, token))
      .catch(() => {
        clearAuth();
        router.replace('/login');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
