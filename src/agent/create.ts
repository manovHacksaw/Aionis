import { supabase } from '../config/supabase';
import { generateWallet } from '../wallet/solana';
import { encryptKey } from '../crypto/keys';
import { env } from '../config/env';
import type { Agent } from '../types';

export interface CreateAgentResult {
  agentId: string;
  wallet:  string;
}

export async function createAgent(strategy = 'bounty'): Promise<CreateAgentResult> {
  const { publicKey, secretKeyBase64 } = generateWallet();
  const encryptedKey = encryptKey(secretKeyBase64);

  const { data, error } = await supabase
    .from('agents')
    .insert({
      wallet:                publicKey,
      encrypted_private_key: encryptedKey,
      balance:               env.initialBalance,
      strategy,
      status:                'active',
    })
    .select('id, wallet')
    .single<Pick<Agent, 'id' | 'wallet'>>();

  if (error) throw new Error(`Failed to create agent: ${error.message}`);
  if (!data)  throw new Error('No data returned from agent creation');

  return { agentId: data.id, wallet: data.wallet };
}

export async function getAgent(agentId: string): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single<Agent>();

  if (error) throw new Error(`Agent not found: ${error.message}`);
  if (!data)  throw new Error('Agent not found');

  return data;
}
