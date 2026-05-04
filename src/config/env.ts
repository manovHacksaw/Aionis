// Validates and exports all required environment variables.
// This module throws at import time if anything is missing or malformed —
// fail-fast is correct here. A misconfigured agent should not start.

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, defaultVal: string): string {
  return process.env[key] ?? defaultVal;
}

const port = parseInt(process.env['PORT'] ?? '3000', 10);

const rawTaskSource = optional('TASK_SOURCE', 'dynamic');
if (rawTaskSource !== 'dynamic' && rawTaskSource !== 'http') {
  throw new Error(`TASK_SOURCE must be "dynamic" or "http", got: "${rawTaskSource}"`);
}

export const env = {
  supabaseUrl:    required('SUPABASE_URL'),
  supabaseKey:    required('SUPABASE_SERVICE_KEY'),
  encryptionKey:  required('ENCRYPTION_KEY'),
  port,
  initialBalance: parseInt(process.env['INITIAL_AGENT_BALANCE'] ?? '100000000', 10),

  // Phase 3: task source selection.
  // "dynamic" uses DynamicTaskSource (simulator, no external deps).
  // "http"    uses HttpTaskSource pointed at COORDINATOR_URL.
  taskSource: rawTaskSource as 'dynamic' | 'http',

  // URL of the task coordinator. Required when TASK_SOURCE=http.
  // In development: defaults to the /external routes on this same process.
  // In production: point to a real external coordinator service.
  coordinatorUrl: optional('COORDINATOR_URL', `http://localhost:${port}/external`),

  // Amadeus REST API credentials (travel vertical).
  // Free sandbox registration at developers.amadeus.com — no credit card required.
  // If absent: all find_cheapest_flight / track_flight_price tasks return infrastructure
  // failure, which refunds the cost. Server does not crash on missing credentials.
  amadeusClientId:     optional('AMADEUS_CLIENT_ID', ''),
  amadeusClientSecret: optional('AMADEUS_CLIENT_SECRET', ''),
  amadeusBaseUrl:      optional('AMADEUS_BASE_URL', 'https://test.api.amadeus.com'),
} as const;

if (!/^[0-9a-f]{64}$/i.test(env.encryptionKey)) {
  throw new Error(
    'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
    'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}
