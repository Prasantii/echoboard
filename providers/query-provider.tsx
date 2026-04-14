'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // We use useState so the QueryClient is only created once
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient} >
      {children}
    </QueryClientProvider>
  );
}