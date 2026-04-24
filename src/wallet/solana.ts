import { Keypair } from '@solana/web3.js';

export interface GeneratedWallet {
  publicKey: string;   // Base58 Solana address
  secretKeyBase64: string; // 64-byte secret key (seed + public key) as base64
}

export function generateWallet(): GeneratedWallet {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    // secretKey is Uint8Array(64): first 32 bytes = private seed, next 32 = public key.
    // We store all 64 bytes so the keypair can be fully reconstructed with Keypair.fromSecretKey().
    secretKeyBase64: Buffer.from(keypair.secretKey).toString('base64'),
  };
}
