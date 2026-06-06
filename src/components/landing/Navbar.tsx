'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import Link                             from 'next/link';

const NAV_LINKS = [
  { href: '/',          label: 'Home',         icon: '⌂' },
  { href: '/traders',   label: 'Star Traders',  icon: '★' },
  { href: '/portfolio', label: 'Portfolio',     icon: '◈' },
  { href: '/demo',      label: 'Contract Demo', icon: '⬡' },
];

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="2"  cy="2"  r="1.5" fill="currentColor" />
      <circle cx="7"  cy="2"  r="1.5" fill="currentColor" />
      <circle cx="12" cy="2"  r="1.5" fill="currentColor" />
      <circle cx="2"  cy="7"  r="1.5" fill="currentColor" />
      <circle cx="7"  cy="7"  r="1.5" fill="currentColor" />
      <circle cx="12" cy="7"  r="1.5" fill="currentColor" />
      <circle cx="2"  cy="12" r="1.5" fill="currentColor" />
      <circle cx="7"  cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 pt-5 pointer-events-none">

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="pointer-events-auto flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7"
            stroke="white" strokeWidth="1.8" fill="none" />
          <polygon points="12,6 18,9 18,15 12,18 6,15 6,9"
            stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
        <span className="text-white font-bold text-base tracking-tight">aionis</span>
      </div>

      {/* ── Animated menu pill ────────────────────────────────────────── */}
      <div ref={ref} className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-5">
        <motion.div
          layout
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          style={{
            background:    'rgba(18,18,22,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border:  '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
          className={`rounded-full ${open ? '!rounded-3xl' : ''}`}
        >
          {/* ── Pill header row ─────────────────────────────────────── */}
          <motion.button
            layout="position"
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between gap-3 px-4 h-11 w-full cursor-pointer select-none"
          >
            <span className="flex items-center gap-2 text-white text-sm font-medium">
              <GridIcon />
              {open ? 'aionis' : 'Menu'}
            </span>
            <span className="text-white/40 text-xs font-medium whitespace-nowrap">
              {open ? '↑ close' : 'Agent active'}
            </span>
          </motion.button>

          {/* ── Expanded dropdown ───────────────────────────────────── */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 flex flex-col gap-1 min-w-[220px]">
                  <div className="h-px bg-white/10 mb-3" />
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-all duration-150 text-sm font-medium"
                    >
                      <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity w-5 text-center">
                        {link.icon}
                      </span>
                      {link.label}
                      <span className="ml-auto opacity-0 group-hover:opacity-40 text-xs transition-opacity">↗</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── CTA pill ─────────────────────────────────────────────────── */}
      <Link
        href="/traders"
        className="pointer-events-auto flex items-center gap-1.5 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
      >
        <span className="text-base leading-none">+</span>
        Launch App
      </Link>
    </nav>
  );
}
