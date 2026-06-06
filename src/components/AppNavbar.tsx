'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectButton from '@/components/ConnectButton';

export default function AppNavbar() {
  const pathname = usePathname();

  const links = [
    { href: '/traders', label: 'Traders' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <Link href="/" className="text-white font-bold text-lg tracking-tight">
        Aionis
      </Link>

      <div className="flex items-center gap-6">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm transition-colors ${
              pathname === l.href
                ? 'text-white font-medium'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <ConnectButton />
    </nav>
  );
}
