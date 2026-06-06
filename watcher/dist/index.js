import 'dotenv/config';
import { createPrismaDb, disconnectPrisma } from './db.js';
import { startWatcher } from './watcher.js';
import { startPnlUpdater } from './pnl-updater.js';
import { closeRedis } from './dedup.js';
const db = createPrismaDb();
console.log('Starting StellaAlpha watcher on Somnia Mainnet…');
const stopWatcher = await startWatcher(db);
const stopPnlUpdater = startPnlUpdater(db);
async function shutdown() {
    console.log('\nShutting down…');
    stopWatcher();
    stopPnlUpdater();
    await closeRedis();
    await disconnectPrisma();
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
