import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Service role key: bypasses RLS. Required for agent-side operations.
// Never expose this key to the client/browser.
export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: { persistSession: false },
});
