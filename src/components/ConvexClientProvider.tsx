'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!client) {
    // Convex not configured — render children without provider
    return <>{children}</>;
  }
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
