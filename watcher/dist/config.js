import 'dotenv/config';
import { defineChain } from 'viem';
// ── Chains ────────────────────────────────────────────────────────────────────
export const somniaMainnet = defineChain({
    id: 5031,
    name: 'Somnia Mainnet',
    nativeCurrency: { decimals: 18, name: 'STT', symbol: 'STT' },
    rpcUrls: {
        default: {
            http: ['https://api.infra.mainnet.somnia.network/'],
            webSocket: ['wss://api.infra.mainnet.somnia.network/ws'],
        },
    },
});
// ── Addresses (all Somnia Mainnet) ────────────────────────────────────────────
export const ADDRESSES = {
    algebraFactory: '0x0ccff3D02A3a200263eC4e0Fdb5E60a56721B8Ae',
    swapRouter: '0x1582f6f3D26658F7208A799Be46e34b1f366CE44',
    wsomi: '0x046EDe9564A72571df6F5e44d0405360c0f4dCab',
    usdce: '0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00',
    wsomiUsdcePool: '0xe5467Be8B8Db6B074904134E8C1a581F5565E2c3',
};
// token0 = WSOMI (18 dec, lower address), token1 = USDC.e (6 dec)
export const POOL = {
    token0: { address: ADDRESSES.wsomi, decimals: 18, symbol: 'WSOMI' },
    token1: { address: ADDRESSES.usdce, decimals: 6, symbol: 'USDC.e' },
};
// ── Copy-trade config ─────────────────────────────────────────────────────────
export const DEFAULT_COPY_PCT = Number(process.env.DEFAULT_COPY_PCT ?? 20);
export const STALE_BUY_MS = 10_000; // skip BUYs older than 10s
