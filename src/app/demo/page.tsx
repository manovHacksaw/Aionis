'use client';

import dynamic from 'next/dynamic';
const DynamicWidget = dynamic(
  () => import('@dynamic-labs/sdk-react-core').then((m) => m.DynamicWidget),
  { ssr: false }
);
import { useAccount, useWriteContract, useBalance } from 'wagmi';
import { somniaTestnet } from '@/config/chains';
import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';

const GREETING_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "updatedBy", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "newGreeting", "type": "string" }
    ],
    "name": "GreetingChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "greeting",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_greeting", "type": "string" }],
    "name": "setGreeting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: balanceData } = useBalance({
    address,
    query: { refetchInterval: 8000, enabled: !!address },
  });

  const [contractAddress, setContractAddress] = useState<string>('0x080471c4051FCaF46f3d4D964e753657F31CFc0C');
  const [greetingMessage, setGreetingMessage] = useState<string>('');
  const [newGreeting, setNewGreeting] = useState<string>('');
  const [contractOwner, setContractOwner] = useState<string>('');
  const [isLoadingGreeting, setIsLoadingGreeting] = useState<boolean>(false);
  const [isUpdatingGreeting, setIsUpdatingGreeting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'info' | 'success' | 'error' | null }>({ text: '', type: null });

  const balance = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : '0';

  const readContract = async () => {
    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      setStatusMsg({ text: 'Please enter a valid contract address.', type: 'error' });
      return;
    }
    setIsLoadingGreeting(true);
    setStatusMsg({ text: 'Reading contract details...', type: 'info' });
    try {
      const [message, owner] = await Promise.all([
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: GREETING_ABI,
          functionName: 'greeting',
        }) as Promise<string>,
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: GREETING_ABI,
          functionName: 'owner',
        }) as Promise<string>,
      ]);
      setGreetingMessage(message);
      setContractOwner(owner);
      setStatusMsg({ text: 'Contract read successfully!', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: `Failed to read contract: ${err.message || 'Check chain & address'}`, type: 'error' });
    } finally {
      setIsLoadingGreeting(false);
    }
  };

  useEffect(() => {
    if (contractAddress && contractAddress.startsWith('0x') && contractAddress.length === 42) {
      readContract();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress]);

  const updateGreeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      setStatusMsg({ text: 'Please connect your wallet first.', type: 'error' });
      return;
    }
    if (!contractAddress) {
      setStatusMsg({ text: 'Contract address is required.', type: 'error' });
      return;
    }
    if (!newGreeting.trim()) {
      setStatusMsg({ text: 'Greeting message cannot be empty.', type: 'error' });
      return;
    }

    setIsUpdatingGreeting(true);
    setStatusMsg({ text: 'Waiting for wallet signature...', type: 'info' });

    try {
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: GREETING_ABI,
        functionName: 'setGreeting',
        args: [newGreeting],
        chainId: somniaTestnet.id,
      });

      setStatusMsg({ text: `Tx ${hash.slice(0, 12)}… Waiting for confirmation.`, type: 'info' });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setStatusMsg({ text: 'Greeting updated successfully on Somnia Testnet!', type: 'success' });
        setNewGreeting('');
        const message = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: GREETING_ABI,
          functionName: 'greeting',
        }) as string;
        setGreetingMessage(message);
      } else {
        setStatusMsg({ text: 'Transaction reverted on-chain.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Transaction failed: ${err.shortMessage || err.message || err}`, type: 'error' });
    } finally {
      setIsUpdatingGreeting(false);
    }
  };

  return (
    <div className="container">
      <main>
        {/* Left column: Smart Contract Interaction */}
        <section className="glass-panel panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 className="card-title">
            <span>🔌</span> Smart Contract Interaction
          </h2>

          <div className="form-group">
            <label className="form-label">Contract Address (SomniaGreeting)</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                style={{ flexGrow: 1 }}
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                onClick={readContract}
                disabled={isLoadingGreeting || !contractAddress}
              >
                {isLoadingGreeting ? 'Reading...' : 'Load'}
              </button>
            </div>
          </div>

          {greetingMessage && (
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Current Message</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  "{greetingMessage}"
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Owner</span>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {contractOwner}
                </p>
              </div>
            </div>
          )}

          {isConnected && address ? (
            <form onSubmit={updateGreeting} className="form-group" style={{ margin: 0, marginTop: '1rem' }}>
              <label className="form-label">Update Greeting</label>
              <input
                type="text"
                className="form-input"
                placeholder="Hello Somnia Testnet!"
                value={newGreeting}
                onChange={(e) => setNewGreeting(e.target.value)}
                disabled={isUpdatingGreeting || !contractAddress}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: '0.75rem', width: '100%' }}
                disabled={isUpdatingGreeting || !contractAddress || !newGreeting.trim()}
              >
                {isUpdatingGreeting ? 'Sending Transaction...' : 'Set Greeting Message'}
              </button>
            </form>
          ) : (
            <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.03)', border: '1px dashed rgba(99, 102, 241, 0.2)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Connect your wallet to update the greeting on-chain.
              </p>
              <DynamicWidget />
            </div>
          )}

          {statusMsg.text && (
            <div className={`badge badge-${statusMsg.type}`} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', display: 'block', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {statusMsg.type === 'success' && '✅ '}
              {statusMsg.type === 'error' && '❌ '}
              {statusMsg.type === 'info' && '⏳ '}
              {statusMsg.text}
            </div>
          )}
        </section>

        {/* Right column: Network Status & Instructions */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 className="card-title">
              <span>🌐</span> Somnia Testnet Info
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Network Name</span>
                <span style={{ fontWeight: 600 }}>Somnia Testnet</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Chain ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>50312</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Currency Symbol</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>STT</span>
              </div>
              {isConnected && address && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Your Balance</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{balance} STT</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <a
                href="https://shannon-explorer.somnia.network"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ flexGrow: 1, fontSize: '0.85rem', padding: '0.6rem', textAlign: 'center' }}
              >
                Block Explorer
              </a>
              <a
                href="https://somnia.network/faucet"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ flexGrow: 1, fontSize: '0.85rem', padding: '0.6rem', textAlign: 'center' }}
              >
                Get STT Faucet
              </a>
            </div>
          </div>

          <div className="glass-panel panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 className="card-title">
              <span>🚀</span> Developer Quickstart
            </h2>
            <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <li>
                Deploy the <code style={{ color: 'white', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>SomniaGreeting</code> contract using Hardhat in <code style={{ color: 'white' }}>contracts/web3/</code>.
              </li>
              <li>Configure your private key in <code style={{ color: 'white' }}>contracts/web3/.env</code>.</li>
              <li>
                Run compile &amp; deploy:
                <pre style={{ background: 'black', color: '#a78bfa', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginTop: '0.25rem', overflowX: 'auto', fontFamily: 'monospace' }}>
                  npm run contracts:deploy
                </pre>
              </li>
              <li>Paste the deployed address into the panel on the left.</li>
            </ol>
          </div>
        </section>
      </main>

      <footer style={{ marginTop: 'auto' }}>
        <p>© 2026 Somnia Space Developer Environment</p>
        <p style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>RPC: https://dream-rpc.somnia.network</span>
        </p>
      </footer>
    </div>
  );
}
