'use client';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { somniaTestnet } from '@/config/chains';
import { useState, useEffect } from 'react';

const wagmiConfig = createConfig({
  chains: [somniaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: { [somniaTestnet.id]: http() },
});

const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '';

// Renders Dynamic + its wagmi connector only after mount (client-only).
// WagmiProvider above this is always present so wagmi hooks work during SSR.
function DynamicShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <DynamicWagmiConnector>
        {children}
      </DynamicWagmiConnector>
    </DynamicContextProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <DynamicShell>
          {children}
        </DynamicShell>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
