"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Tilt } from "./tilt";

export function DashboardCards() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end start"],
  });

  const leftX = useTransform(scrollYProgress, [0.45, 1], [0, -260]);
  const leftRotateY = useTransform(scrollYProgress, [0.45, 1], [22, 55]);
  const leftOpacity = useTransform(scrollYProgress, [0.45, 0.95], [1, 0]);

  const centerY = useTransform(scrollYProgress, [0.45, 1], [0, -180]);
  const centerScale = useTransform(scrollYProgress, [0.45, 1], [1, 0.78]);
  const centerOpacity = useTransform(scrollYProgress, [0.45, 0.95], [1, 0]);

  const rightX = useTransform(scrollYProgress, [0.45, 1], [0, 260]);
  const rightRotateY = useTransform(scrollYProgress, [0.45, 1], [-22, -55]);
  const rightOpacity = useTransform(scrollYProgress, [0.45, 0.95], [1, 0]);

  const orbitsOpacity = useTransform(scrollYProgress, [0.45, 0.9], [1, 0]);
  const orbitsScale = useTransform(scrollYProgress, [0.45, 1], [1, 0.85]);

  return (
    <div
      ref={ref}
      className="relative z-10 mt-12 flex w-full max-w-3xl flex-col items-center justify-center gap-6 sm:flex-row sm:items-stretch sm:gap-0"
      style={{ perspective: "1400px" }}
    >
      <BackgroundOrbits opacity={orbitsOpacity} scale={orbitsScale} />

      <motion.div
        className="relative sm:mr-[-28px]"
        style={{
          x: leftX,
          rotateY: leftRotateY,
          opacity: leftOpacity,
          transformOrigin: "right center",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
      >
        <WalletBalanceCard />
      </motion.div>

      <motion.div
        className="relative z-20 sm:-mt-3"
        style={{
          y: centerY,
          scale: centerScale,
          opacity: centerOpacity,
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        <AgentActivityCard />
      </motion.div>

      <motion.div
        className="relative sm:ml-[-28px]"
        style={{
          x: rightX,
          rotateY: rightRotateY,
          opacity: rightOpacity,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
      >
        <ProfitCard />
      </motion.div>
    </div>
  );
}

function BackgroundOrbits({
  opacity,
  scale,
}: {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ opacity, scale }}
    >
      <svg viewBox="0 0 800 480" className="h-[480px] w-[800px] text-zinc-300/70" fill="none">
        <ellipse cx="400" cy="240" rx="380" ry="180" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <ellipse cx="400" cy="240" rx="300" ry="140" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <ellipse cx="400" cy="240" rx="220" ry="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      </svg>
    </motion.div>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tilt intensity={12} className="h-full">
      <div
        className={`flex h-full flex-col rounded-[24px] bg-gradient-to-br from-[#16162a] to-[#0a0a14] p-4 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/10 ${className}`}
      >
        {children}
      </div>
    </Tilt>
  );
}

function WalletBalanceCard() {
  return (
    <CardShell className="h-[310px] w-[200px]">
      <div className="text-[9px] font-semibold tracking-[0.18em] text-zinc-400">
        WALLET BALANCE
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-bold leading-none">$12.45</span>
          <span className="text-[10px] font-medium text-zinc-400">USDC</span>
        </div>
        <div className="mt-1 text-[10px] font-medium text-emerald-400">
          ▲ 12.4% (24h)
        </div>
      </div>

      <div className="mt-3 border-t border-white/5 pt-2.5">
        <div className="text-[9px] font-medium text-zinc-500">Network</div>
        <div className="mt-1 flex items-center gap-1.5">
          <SolMark className="h-3 w-3" />
          <span className="text-[11px] font-medium">Solana</span>
        </div>
      </div>

      <div className="mt-2.5 border-t border-white/5 pt-2.5">
        <div className="text-[9px] font-medium text-zinc-500">Agent Wallet</div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-zinc-800">
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2.5" y="4.5" width="11" height="8" rx="1.5" />
              <path d="M11 7 L11 10" />
            </svg>
          </span>
          <span className="text-zinc-300">7xQd…9kL2</span>
          <CopyIcon />
        </div>
      </div>

      <button className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-xl bg-violet-500 text-[11px] font-semibold text-white shadow-lg shadow-violet-500/30 transition-colors hover:bg-violet-600">
        <DownloadIcon /> Deposit USDC
      </button>
    </CardShell>
  );
}

function AgentActivityCard() {
  const activities: Array<{
    title: string;
    sub: string;
    amount: string;
    time: string;
    positive: boolean;
    icon: React.ReactNode;
    bg: string;
    iconColor?: string;
  }> = [
    {
      title: "Bought market data",
      sub: "CoinGecko API",
      amount: "-$0.02",
      time: "2s ago",
      positive: false,
      icon: <CartIcon />,
      bg: "bg-zinc-800",
    },
    {
      title: "Used cached result",
      sub: "Saved computation",
      amount: "+$0.05",
      time: "10s ago",
      positive: true,
      icon: <RecycleIcon />,
      bg: "bg-zinc-800",
    },
    {
      title: "Generated report",
      sub: "Market analysis",
      amount: "-$0.08",
      time: "25s ago",
      positive: false,
      icon: <DocIcon />,
      bg: "bg-zinc-800",
    },
    {
      title: "Sold report to another agent",
      sub: "Data resale",
      amount: "+$0.10",
      time: "40s ago",
      positive: true,
      icon: <DollarIcon />,
      bg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <CardShell className="h-[350px] w-[260px]">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-[0.18em] text-zinc-400">
          AGENT ACTIVITY
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-400">
          <PulseDot /> Live
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        {activities.map((a) => (
          <div key={a.title} className="flex items-start gap-2">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center ${
                a.positive && a.iconColor ? "rounded-full" : "rounded-lg"
              } ${a.bg} ${a.iconColor ?? "text-zinc-400"}`}
            >
              {a.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold leading-tight">{a.title}</div>
              <div className="text-[9px] text-zinc-500">{a.sub}</div>
            </div>
            <div className="text-right">
              <div
                className={`text-[11px] font-semibold ${
                  a.positive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {a.amount}
              </div>
              <div className="text-[9px] text-zinc-500">{a.time}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 flex h-9 items-center justify-center rounded-xl bg-violet-500 text-[11px] font-semibold text-white shadow-lg shadow-violet-500/30 transition-colors hover:bg-violet-600">
        View All Activity
      </button>
    </CardShell>
  );
}

function ProfitCard() {
  return (
    <CardShell className="h-[310px] w-[200px]">
      <div className="text-[9px] font-semibold tracking-[0.18em] text-zinc-400">
        PROFIT (24H)
      </div>

      <div className="mt-3">
        <div className="text-[26px] font-bold leading-none text-emerald-400">+$2.34</div>
        <div className="mt-1 text-[10px] font-medium text-emerald-400">
          ▲ 18.7% vs yesterday
        </div>
      </div>

      <div className="relative mt-3 flex-1">
        <svg viewBox="0 0 200 110" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="profit-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="1" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 55, 90].map((y) => (
            <line
              key={y}
              x1="0"
              x2="170"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}
          <path
            d="M0 90 L20 80 L40 70 L60 75 L80 55 L100 50 L120 35 L140 45 L160 25 L170 20 L170 110 L0 110 Z"
            fill="url(#profit-fill)"
          />
          <path
            d="M0 90 L20 80 L40 70 L60 75 L80 55 L100 50 L120 35 L140 45 L160 25 L170 20"
            fill="none"
            stroke="#34d399"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="170" cy="20" r="3.5" fill="#34d399" />
          <circle cx="170" cy="20" r="6" fill="#34d399" opacity="0.3" />
        </svg>

        <div className="absolute right-0 top-0 flex h-full flex-col justify-between text-[7px] text-zinc-500">
          <span>$2.5</span>
          <span>$1.5</span>
          <span>$0.5</span>
        </div>
      </div>

      <div className="mt-1 flex justify-between px-1 text-[7px] text-zinc-500">
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>

      <button className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-zinc-800 text-[11px] font-semibold text-white transition-colors hover:bg-zinc-700">
        <ChartIcon /> View Analytics
      </button>
    </CardShell>
  );
}

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="8" height="8" rx="1.5" />
      <path d="M3 11 L3 4 C 3 3.5, 3.5 3, 4 3 L 10 3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3 L8 11 M5 8 L8 11 L11 8 M3 13 L13 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13 L3 7 M7 13 L7 4 M11 13 L11 9 M2 13 L14 13" strokeLinecap="round" />
    </svg>
  );
}

function SolMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <linearGradient id="sol-grad-cards" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="0.5" stopColor="#03E1FF" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path d="M8.5 5 L28 5 L23.5 9.5 L4 9.5 Z" fill="url(#sol-grad-cards)" />
      <path d="M4 13.75 L23.5 13.75 L28 18.25 L8.5 18.25 Z" fill="url(#sol-grad-cards)" />
      <path d="M8.5 22.5 L28 22.5 L23.5 27 L4 27 Z" fill="url(#sol-grad-cards)" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3 L4 3 L5.5 11 L13 11 L14 5 L5 5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="13.5" r="0.8" fill="currentColor" />
      <circle cx="11.5" cy="13.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function RecycleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8 A 5 5 0 0 1 12 5 L 13 6 M 13 3 L 13 6 L 10 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 8 A 5 5 0 0 1 4 11 L 3 10 M 3 13 L 3 10 L 6 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2 L10 2 L13 5 L13 14 L4 14 Z M10 2 L10 5 L13 5" strokeLinejoin="round" />
      <path d="M6 8 L11 8 M6 11 L11 11" strokeLinecap="round" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      <text x="8" y="12" textAnchor="middle" fontSize="11" fontWeight="900">$</text>
    </svg>
  );
}
