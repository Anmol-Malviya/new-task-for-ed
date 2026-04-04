// frontend/hooks/UseAuth.tsx
// WHY THIS EXISTS SEPARATELY FROM CONTEXT:
// AuthContext.tsx exports useAuth() which is the basic hook.
// This hooks file is where you add EXTENDED auth behaviour —
// things that are about "what to DO when auth state is X"
// rather than just "what IS the auth state"

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/user';

// Re-export the base hook so components only need to import from hooks/
export { useAuth } from '@/context/AuthContext';

// ── useRequireAuth ────────────────────────────────────────────────────
// Use this in pages that REQUIRE login (dashboard, booking form)
// It automatically redirects to login if user is not logged in
// Usage: const { user } = useRequireAuth();
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to finish before checking
    // (avoids redirecting while still checking localStorage)
    if (!isLoading && !user) {
      router.replace('/auth/Login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

// ── useRequireRole ────────────────────────────────────────────────────
// Use this in vendor-only pages
// Usage: useRequireRole('vendor')
export function useRequireRole(role: UserRole) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== role)) {
      router.replace('/');
    }
  }, [user, isLoading, role, router]);

  return { user, isLoading };
}

// ── useIsVendor ───────────────────────────────────────────────────────
// Simple boolean check — use in Navbar to show vendor dashboard link
// Usage: const isVendor = useIsVendor();
export function useIsVendor(): boolean {
  const { user } = useAuth();
  return user?.role === 'vendor';
}