'use client';

import { useEffect, useRef, useState } from 'react';
import { createPublicClient, webSocket, defineChain } from 'viem';

const somniaMainnet = defineChain({
  id: 5031,
  name: 'Somnia Mainnet',
  nativeCurrency: { decimals: 18, name: 'STT', symbol: 'STT' },
  rpcUrls: {
    default: {
      http:      ['https://api.infra.mainnet.somnia.network/'],
      webSocket: ['wss://api.infra.mainnet.somnia.network/ws'],
    },
  },
});

const POOL    = '0xe5467Be8B8Db6B074904134E8C1a581F5565E2c3' as const;
const DEC0    = 18;  // WSOMI
const DEC1    = 6;   // USDC.e
const Q96     = 2 ** 96;

function sqrtToPrice(sqrtPriceX96: bigint): number {
  const r = Number(sqrtPriceX96) / Q96;
  return r * r * Math.pow(10, DEC0 - DEC1);
}

const SWAP_ABI = [{
  anonymous: false,
  inputs: [
    { indexed: true,  name: 'sender',    type: 'address' },
    { indexed: true,  name: 'recipient', type: 'address' },
    { indexed: false, name: 'amount0',   type: 'int256'  },
    { indexed: false, name: 'amount1',   type: 'int256'  },
    { indexed: false, name: 'price',     type: 'uint160' },
    { indexed: false, name: 'liquidity', type: 'uint128' },
    { indexed: false, name: 'tick',      type: 'int24'   },
  ],
  name: 'Swap',
  type: 'event',
}] as const;

export interface LiveSwap {
  id:         string;          // txHash + logIndex
  trader:     string;          // recipient address
  side:       'BUY' | 'SELL';
  usdcAmount: number;
  wsomiPrice: number;
  wsomiAmount: number;
  txHash:     string;
  timestamp:  number;
  isStarTrader: boolean;
}

export function usePoolSwaps(starTraders: Set<string>, maxItems = 30) {
  const [swaps, setSwaps]   = useState<LiveSwap[]>([]);
  const [connected, setConnected] = useState(false);
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let stopped = false;

    const client = createPublicClient({
      chain:     somniaMainnet,
      transport: webSocket('wss://api.infra.mainnet.somnia.network/ws', {
        reconnect: { attempts: 10, delay: 2_000 },
      }),
    });

    const unwatch = client.watchContractEvent({
      address:   POOL,
      abi:       SWAP_ABI,
      eventName: 'Swap',

      onLogs: (logs) => {
        if (stopped) return;
        setConnected(true);

        const newSwaps: LiveSwap[] = logs.map((log) => {
          const amount0    = log.args.amount0   as bigint;
          const amount1    = log.args.amount1   as bigint;
          const price      = log.args.price     as bigint;
          const recipient  = (log.args.recipient as string).toLowerCase();

          const wsomiPrice  = sqrtToPrice(price);
          const isBuy       = amount0 < 0n;
          const usdcAmount  = Math.abs(Number(amount1)) / 10 ** DEC1;
          const wsomiAmount = Math.abs(Number(amount0)) / 10 ** DEC0;

          return {
            id:          `${log.transactionHash}-${log.logIndex}`,
            trader:      recipient,
            side:        isBuy ? 'BUY' : 'SELL',
            usdcAmount,
            wsomiPrice,
            wsomiAmount,
            txHash:      log.transactionHash ?? '',
            timestamp:   Date.now(),
            isStarTrader: starTraders.has(recipient),
          };
        });

        setSwaps((prev) => [...newSwaps, ...prev].slice(0, maxItems));
      },

      onError: () => setConnected(false),
    });

    unwatchRef.current = unwatch;

    return () => {
      stopped = true;
      unwatch();
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { swaps, connected };
}
