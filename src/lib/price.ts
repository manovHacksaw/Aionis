import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

const somniaMainnet = defineChain({
  id: 5031,
  name: 'Somnia Mainnet',
  nativeCurrency: { decimals: 18, name: 'STT', symbol: 'STT' },
  rpcUrls: {
    default: { http: ['https://api.infra.mainnet.somnia.network/'] },
  },
});

const POOL_ADDRESS = (process.env.NEXT_PUBLIC_WSOMI_USDC_POOL ??
  '0xe5467Be8B8Db6B074904134E8C1a581F5565E2c3') as `0x${string}`;

const GLOBAL_STATE_ABI = [{
  inputs: [],
  name: 'globalState',
  outputs: [
    { name: 'price',     type: 'uint160' },
    { name: 'tick',      type: 'int24'   },
    { name: 'feeZto',    type: 'uint16'  },
    { name: 'feeOtz',    type: 'uint16'  },
    { name: 'timepointIndex',     type: 'uint16' },
    { name: 'communityFeeToken0', type: 'uint8'  },
    { name: 'communityFeeToken1', type: 'uint8'  },
    { name: 'unlocked',  type: 'bool'    },
  ],
  stateMutability: 'view',
  type: 'function',
}] as const;

const client = createPublicClient({
  chain:     somniaMainnet,
  transport: http(),
});

export async function getWsomiPrice(): Promise<number> {
  const state = await client.readContract({
    address:      POOL_ADDRESS,
    abi:          GLOBAL_STATE_ABI,
    functionName: 'globalState',
  });
  const raw = Number(state[0]) / 2 ** 96;
  return raw * raw * 1e12; // token0=18dec, token1=6dec
}
