// Validates and exports all required environment variables.
// This module throws at import time if anything is missing or malformed —
// fail-fast is correct here. A misconfigured agent should not start.

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const env = {
  supabaseUrl:      required('SUPABASE_URL'),
  supabaseKey:      required('SUPABASE_SERVICE_KEY'),
  encryptionKey:    required('ENCRYPTION_KEY'),
  port:             parseInt(process.env['PORT'] ?? '3000', 10),
  initialBalance:   parseInt(process.env['INITIAL_AGENT_BALANCE'] ?? '100000000', 10),
} as const;

if (!/^[0-9a-f]{64}$/i.test(env.encryptionKey)) {
  throw new Error(
    'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
    'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}
