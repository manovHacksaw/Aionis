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
        className="rounded-full border border-white/[0.15] bg-white/[0.04] text-white/80 text-[13px] font-normal tracking-wide px-4 py-2 hover:text-white hover:border-white/30 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-full border border-white/18 bg-white/[0.03] text-white/90 text-[14px] font-normal tracking-wide px-5 py-2 hover:bg-white/[0.08] hover:border-white/40 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.065)]"
    >
      Connect
    </button>
  );
}
