// src/components/AppNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectButton from '@/components/ConnectButton';

const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <line x1="12" y1="3"  x2="12" y2="6"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="3"  y1="12" x2="6"  y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="5.64"  y1="5.64"  x2="7.76"  y2="7.76"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="16.24" y1="16.24" x2="18.36" y2="18.36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="5.64"  y1="18.36" x2="7.76"  y2="16.24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="16.24" y1="7.76"  x2="18.36" y2="5.64"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Traders',   href: '/traders'   },
  { name: 'Portfolio', href: '/portfolio' },
];

export default function AppNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-6 md:px-16 bg-black border-b border-white/[0.04] select-none">
      <Link href="/" className="flex items-center gap-2 group cursor-pointer">
        <div className="text-white/95 group-hover:rotate-45 transition-transform duration-500 ease-out">
          <LogoIcon />
        </div>
        <span className="text-lg font-medium tracking-tight text-white/90 font-sans lowercase">
          aionis
        </span>
      </Link>

      <div className="flex items-center gap-8">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[14px] font-normal transition-colors duration-300 tracking-wide ${
              pathname === l.href ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {l.name}
          </Link>
        ))}
      </div>

      <ConnectButton />
    </nav>
  );
}
