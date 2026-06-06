import { sqrtPriceX96ToWsomiUsd } from './price.js';
import { POOL, STALE_BUY_MS } from './config.js';
/**
 * amount0 < 0 → WSOMI leaving pool  → user BUYing  WSOMI with USDC.e
 * amount0 > 0 → WSOMI entering pool → user SELLing WSOMI for USDC.e
 */
export function parseSwapLog(log) {
    const wsomiPrice = sqrtPriceX96ToWsomiUsd(log.price);
    const ageMs = Date.now() - log.blockTime * 1000;
    let side;
    let usdValue;
    let tokenIn;
    let tokenOut;
    if (log.amount0 < 0n) {
        // BUY: USDC.e → WSOMI
        side = 'BUY';
        tokenIn = POOL.token1.symbol;
        tokenOut = POOL.token0.symbol;
        usdValue = Number(log.amount1) / 10 ** POOL.token1.decimals;
    }
    else {
        // SELL: WSOMI → USDC.e
        side = 'SELL';
        tokenIn = POOL.token0.symbol;
        tokenOut = POOL.token1.symbol;
        const wsomiSold = Number(log.amount0) / 10 ** POOL.token0.decimals;
        usdValue = wsomiSold * wsomiPrice;
    }
    return {
        leader: log.sender,
        side,
        tokenIn,
        tokenOut,
        usdValue: Math.abs(usdValue),
        wsomiPrice,
        txHash: log.txHash,
        timestamp: log.blockTime * 1000,
        isStale: side === 'BUY' && ageMs > STALE_BUY_MS,
    };
}
