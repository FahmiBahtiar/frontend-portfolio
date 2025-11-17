'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    // Login page without AdminLayout
    return <>{children}</>;
  }

  // Other admin pages with AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}
