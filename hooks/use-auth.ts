'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const login = useCallback(async (provider: string, options?: any) => {
    try {
      await signIn(provider, {
        redirect: false,
        ...options,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';

  return {
    session,
    status,
    update,
    login,
    logout,
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    user: session?.user,
  };
}
