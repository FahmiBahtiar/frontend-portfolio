'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidget } from './ChatWidget';

export function ChatWidgetWrapper() {
  const pathname = usePathname();

  // Hide widget completely on admin management and maintenance routes
  if (
    !pathname ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/maintenance')
  ) {
    return null;
  }

  return <ChatWidget />;
}
