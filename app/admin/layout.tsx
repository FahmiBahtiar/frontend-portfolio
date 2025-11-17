'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </SessionProvider>
  );
}
