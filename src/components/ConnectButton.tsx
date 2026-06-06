'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function ConnectButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) return null;

  if (authenticated) {
    const addr = user?.wallet?.address;
    const label = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'Account';
    return (
      <button
        onClick={logout}
        className="connect-btn connected"
      >
        {label}
      </button>
    );
  }

  return (
    <button onClick={login} className="connect-btn">
      Connect
    </button>
  );
}
