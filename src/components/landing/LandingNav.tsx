"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LogoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
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
  { name: "Features", href: "#features" },
  { name: "Pricing",  href: "#pricing"  },
  { name: "Blog",     href: "#blog"     },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-16 md:py-6 bg-gradient-to-b from-black/45 via-black/10 to-transparent"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group cursor-pointer z-50">
        <div className="text-white/95 group-hover:rotate-45 transition-transform duration-500 ease-out">
          <LogoIcon />
        </div>
        <span className="text-lg font-medium tracking-tight text-white/90 font-sans lowercase">
          aionis
        </span>
      </Link>

      {/* Center links — desktop */}
      <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map(link => (
          <Link
            key={link.name}
            href={link.href}
            className="text-[14px] font-normal text-neutral-400 hover:text-white transition-colors duration-300 tracking-wide"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Right CTA — desktop */}
      <div className="hidden md:flex items-center">
        <Link
          href="/traders"
          className="text-[14px] font-normal text-neutral-300 hover:text-white transition-colors duration-300 tracking-wide cursor-pointer"
        >
          Launch App
        </Link>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden text-white/90 hover:text-white focus:outline-none cursor-pointer z-50"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 bg-black/95 border-b border-white/10 backdrop-blur-md pt-24 pb-8 px-8 flex flex-col gap-4 md:hidden shadow-2xl"
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base text-neutral-400 hover:text-white py-1 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-white/10 my-1" />
          <Link
            href="/traders"
            onClick={() => setOpen(false)}
            className="text-base text-white/90 hover:text-white py-1"
          >
            Launch App
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
