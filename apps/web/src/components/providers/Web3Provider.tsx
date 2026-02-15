'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { monadTestnet } from '@/lib/web3';
import { injected } from 'wagmi/connectors';
import { ReactNode, useState } from 'react';

const config = createConfig({
    chains: [monadTestnet],
    connectors: [
        injected(),
    ],
    transports: {
        [monadTestnet.id]: http(),
    },
});

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
