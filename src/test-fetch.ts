import { performWork } from './work/handlers';
import { Task } from './types';

async function runTest(type: string, payload: any = {}) {
  const dummyTask: Task = {
    id: `test-${type}-${Date.now()}`,
    type: type as any,
    cost: 100,
    revenue: 150,
    ttl_ms: 10000,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 10000).toISOString(),
    payload,
    metadata: {}
  };

  console.log(`\n--- Testing ${type} ---`);
  const result = await performWork(dummyTask);
  // console.log('Result:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log(`✅ Success! [Source: ${result.source}]`);
    if (result.data) {
       console.log('Data:', JSON.stringify(result.data, null, 2));
    }
  } else {
    console.log(`❌ Failed: ${result.reason}`);
  }
}

async function main() {
  // Crypto Prices
  await runTest('fetch_sol_usdc_price');
  await runTest('fetch_eth_usdc_price');
  await runTest('fetch_btc_usdc_price');
  await runTest('fetch_doge_usdc_price');
  await runTest('fetch_bonk_usdc_price');
  
  // Market Data
  await runTest('fetch_btc_dominance');
  await runTest('deep_orderbook_analysis');

  // Shopping (Electronics)
  await runTest('find_best_price', { product: 'iPhone 16' });
  await runTest('analyze_supply_chain', { product: 'iPhone 16' });
  
  // Shopping (Fashion)
  await runTest('find_best_price', { product: 'Nike Air Jordan 1' });
  await runTest('analyze_supply_chain', { product: 'Nike Air Jordan 1' });
}

main().catch(console.error);
