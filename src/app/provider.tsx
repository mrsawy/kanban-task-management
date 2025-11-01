'use client';

import React, { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Loader from '@/components/organs/loader';

// Create QueryClient with proper config to prevent unwanted prefetching
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false, // Prevent refetch on window focus
            refetchOnMount: false, // Only fetch if data is stale
        },
    },
});

type ProviderProps = {
    children: ReactNode;

};



export default function Provider({ children }: ProviderProps) {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </NextThemesProvider>
            </QueryClientProvider>

            <ToastContainer theme="dark" />
            <Loader />
        </div>
    );
}