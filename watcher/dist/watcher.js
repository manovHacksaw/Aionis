import { createPublicClient, webSocket, http } from 'viem';
import { ALGEBRA_SWAP_ABI } from './price.js';
import { parseSwapLog } from './parser.js';
import { processTrade } from './copy-engine.js';
import { claimSwap } from './dedup.js';
import { somniaMainnet, ADDRESSES } from './config.js';
function makeWsClient() {
    return createPublicClient({
        chain: somniaMainnet,
        transport: webSocket('wss://api.infra.mainnet.somnia.network/ws', {
            reconnect: { attempts: Infinity, delay: 2_000 },
        }),
    });
}
function makeHttpClient() {
    return createPublicClient({
        chain: somniaMainnet,
        transport: http('https://api.infra.mainnet.somnia.network/'),
    });
}
// Refreshed every 5 minutes from DB
let trackedLeaders = new Set();
async function refreshLeaders(db) {
    const leaders = await db.getAllLeaders();
    trackedLeaders = new Set(leaders.map((l) => l.toLowerCase()));
    console.log(`[watcher] Tracking ${trackedLeaders.size} leader(s)`);
}
export async function startWatcher(db) {
    await refreshLeaders(db);
    const refreshTimer = setInterval(() => refreshLeaders(db), 5 * 60 * 1000);
    const wsClient = makeWsClient();
    const httpClient = makeHttpClient();
    console.log('[watcher] Subscribing to WSOMI/USDC.e pool Swap events on Somnia Mainnet…');
    // ── Primary: WebSocket subscription ──────────────────────────────────────
    const unwatch = wsClient.watchContractEvent({
        address: ADDRESSES.wsomiUsdcePool,
        abi: ALGEBRA_SWAP_ABI,
        eventName: 'Swap',
        onLogs: async (logs) => {
            for (const log of logs) {
                const recipient = log.args.recipient.toLowerCase();
                const txHash = log.transactionHash ?? '0x';
                // Dedup for recording — use recipient (actual trader, not router)
                const recordClaimed = await claimSwap(txHash + ':rec', recipient);
                if (recordClaimed) {
                    const blockTime = await getBlockTime(httpClient, log.blockNumber ?? 0n);
                    const intent = parseSwapLog({
                        sender: log.args.sender,
                        recipient: log.args.recipient,
                        amount0: log.args.amount0,
                        amount1: log.args.amount1,
                        price: log.args.price,
                        liquidity: log.args.liquidity,
                        tick: log.args.tick,
                        txHash: txHash,
                        blockTime,
                    });
                    // Record ALL swaps from any trader for the leaderboard
                    await db.recordLeaderSwap({
                        leader: recipient,
                        side: intent.side,
                        tokenIn: intent.tokenIn,
                        tokenOut: intent.tokenOut,
                        usdValue: intent.usdValue,
                        wsomiPrice: intent.wsomiPrice,
                        txHash,
                        timestamp: intent.timestamp,
                    }).catch((e) => console.error('[watcher] recordLeaderSwap error:', e.message));
                    console.log(`[watcher] ${intent.side} ${recipient.slice(0, 8)}… ` +
                        `$${intent.usdValue.toFixed(2)} @ $${intent.wsomiPrice.toFixed(4)}`);
                    // Run paper trades only for users who have explicitly followed this trader
                    if (trackedLeaders.has(recipient)) {
                        const claimed = await claimSwap(txHash, recipient);
                        if (claimed) {
                            await processTrade(intent, db).catch((e) => console.error('[watcher] processTrade error:', e.message));
                        }
                    }
                }
            }
        },
        onError: (e) => console.error('[watcher] WS error:', e.message),
    });
    // ── Fallback: HTTP polling every 10s ──────────────────────────────────────
    let lastBlock = 0n;
    const pollTimer = setInterval(async () => {
        try {
            const latest = await httpClient.getBlockNumber();
            if (lastBlock === 0n) {
                lastBlock = latest - 1n;
                return;
            }
            if (latest <= lastBlock)
                return;
            const logs = await httpClient.getContractEvents({
                address: ADDRESSES.wsomiUsdcePool,
                abi: ALGEBRA_SWAP_ABI,
                eventName: 'Swap',
                fromBlock: lastBlock + 1n,
                toBlock: latest,
            });
            for (const log of logs) {
                const recipient = log.args.recipient.toLowerCase();
                const txHash = log.transactionHash ?? '0x';
                const recordClaimed = await claimSwap(txHash + ':rec', recipient);
                if (!recordClaimed)
                    continue;
                const blockTime = await getBlockTime(httpClient, log.blockNumber ?? 0n);
                const intent = parseSwapLog({
                    sender: log.args.sender,
                    recipient: log.args.recipient,
                    amount0: log.args.amount0,
                    amount1: log.args.amount1,
                    price: log.args.price,
                    liquidity: log.args.liquidity,
                    tick: log.args.tick,
                    txHash: txHash,
                    blockTime,
                });
                await db.recordLeaderSwap({
                    leader: recipient, side: intent.side,
                    tokenIn: intent.tokenIn, tokenOut: intent.tokenOut,
                    usdValue: intent.usdValue, wsomiPrice: intent.wsomiPrice,
                    txHash, timestamp: intent.timestamp,
                }).catch(() => { });
                if (trackedLeaders.has(recipient)) {
                    const claimed = await claimSwap(txHash + ':poll', recipient);
                    if (claimed) {
                        await processTrade(intent, db).catch((e) => console.error('[watcher:poll] error:', e.message));
                    }
                }
            }
            lastBlock = latest;
        }
        catch (e) {
            console.error('[watcher:poll] error:', e.message);
        }
    }, 10_000);
    return () => {
        unwatch();
        clearInterval(pollTimer);
        clearInterval(refreshTimer);
    };
}
// ── Block time cache ──────────────────────────────────────────────────────────
const blockTimeCache = new Map();
async function getBlockTime(client, blockNumber) {
    if (blockTimeCache.has(blockNumber))
        return blockTimeCache.get(blockNumber);
    try {
        const block = await client.getBlock({ blockNumber });
        const ts = Number(block.timestamp);
        blockTimeCache.set(blockNumber, ts);
        if (blockTimeCache.size > 500)
            blockTimeCache.delete(blockTimeCache.keys().next().value);
        return ts;
    }
    catch {
        return Math.floor(Date.now() / 1000);
    }
}
