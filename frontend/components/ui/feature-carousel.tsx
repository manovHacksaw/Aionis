"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CommandFreeIcons,
  AiCloudIcon,
  MagicWandIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

const FEATURES = [
  {
    id: "autonomous",
    label: "Autonomous Agents",
    icon: MagicWandIcon,
    description: "Agents think, decide, and act on their own — no human in the loop.",
    visual: <AutonomousMock />,
  },
  {
    id: "computation-reuse",
    label: "Computation Reuse",
    icon: AiCloudIcon,
    description: "Cached results are resold across the swarm — turning cost into revenue.",
    visual: <CacheReuseMock />,
  },
  {
    id: "automated-payments",
    label: "Automated Payments",
    icon: CommandFreeIcons,
    description: "Stablecoin settlement on Solana — agent-to-agent in milliseconds.",
    visual: <PaymentMock />,
  },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % FEATURES.length) + FEATURES.length) % FEATURES.length;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + FEATURES.length) % FEATURES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full max-w-7xl mx-auto md:p-8">
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border border-zinc-200/40">
        <div className="w-full lg:w-[40%] min-h-[350px] md:min-h-[450px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-16 lg:pl-16 bg-violet-500">
          <div className="absolute inset-x-0 top-0 h-12 md:h-20 lg:h-16 bg-gradient-to-b from-violet-500 via-violet-500/80 to-transparent z-40" />
          <div className="absolute inset-x-0 bottom-0 h-12 md:h-20 lg:h-16 bg-gradient-to-t from-violet-500 via-violet-500/80 to-transparent z-40" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {FEATURES.map((feature, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(FEATURES.length / 2),
                FEATURES.length / 2,
                distance
              );

              return (
                <motion.div
                  key={feature.id}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 1,
                  }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-4 px-6 md:px-10 lg:px-8 py-3.5 md:py-5 lg:py-4 rounded-full transition-all duration-700 text-left group border",
                      isActive
                        ? "bg-white text-violet-500 border-white z-10"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-colors duration-500",
                        isActive ? "text-violet-500" : "text-white/40"
                      )}
                    >
                      <HugeiconsIcon
                        icon={feature.icon}
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <span className="font-normal text-sm md:text-[15px] tracking-tight whitespace-nowrap uppercase">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-[500px] md:min-h-[600px] lg:h-full relative bg-zinc-100/30 flex items-center justify-center py-16 md:py-24 lg:py-16 px-6 md:px-12 lg:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-zinc-200/20">
          <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-[2rem] md:rounded-[2.8rem] overflow-hidden border-4 md:border-8 border-white bg-white origin-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)]"
                >
                  <div
                    className={cn(
                      "relative w-full h-full bg-gradient-to-br from-violet-50 via-zinc-50 to-violet-100/60 flex items-center justify-center p-10 transition-all duration-700",
                      isActive ? "" : "grayscale brightness-95"
                    )}
                  >
                    <div className="w-full max-w-[280px]">{feature.visual}</div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-violet-500 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] w-fit shadow-lg mb-3">
                          {index + 1} • {feature.label}
                        </div>
                        <p className="text-black font-bold text-xl md:text-2xl leading-tight tracking-tight">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-8 left-8 flex items-center gap-3 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgb(139,92,246)]" />
                    <span className="text-violet-600 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">
                      Live Solution
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;

/* ------------------------------------------------------------------ */
/* Slide visuals — moved from page.tsx so the carousel is self-contained */
/* ------------------------------------------------------------------ */

function AutonomousMock() {
  const steps = [
    { label: "Decide", time: "0.1s" },
    { label: "Execute", time: "0.3s" },
    { label: "Settle", time: "0.4s" },
  ];
  return (
    <div className="w-full space-y-1.5">
      {steps.map((s, i) => (
        <div
          key={s.label}
          className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.05)] ring-1 ring-zinc-100"
          style={{ animation: "pulse-soft 2.4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
            ✓
          </span>
          <span className="flex-1 text-[10px] font-semibold text-zinc-800">{s.label}</span>
          <span className="text-[9px] font-bold text-emerald-600">{s.time}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 pt-1 text-[9px] font-medium text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        No human input required
      </div>
    </div>
  );
}

function CacheReuseMock() {
  return (
    <div className="w-full space-y-2">
      <div className="rounded-2xl bg-white p-3 ring-1 ring-zinc-100 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-violet-500" fill="currentColor">
            <path d="M8 1 L4 9 L7 9 L6 15 L12 7 L9 7 L10 1 Z" />
          </svg>
          <span className="text-[10px] font-bold text-zinc-800">Cache hit</span>
          <span className="ml-auto rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">$0.00</span>
        </div>
        <div className="mt-1.5 text-[9px] text-zinc-500">Query: BTC/USD price feed</div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {["A7", "B2", "C9"].map((id, i) => (
          <div
            key={id}
            className="rounded-lg bg-white px-2 py-1.5 text-center ring-1 ring-zinc-100"
            style={{ animation: "pulse-soft 2s ease-in-out infinite", animationDelay: `${i * 0.25}s` }}
          >
            <div className="text-[8px] text-zinc-500">Agent</div>
            <div className="text-[10px] font-bold text-violet-600">{id}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-[9px] font-medium text-zinc-500">3 agents reused this result</div>
    </div>
  );
}

function PaymentMock() {
  return (
    <div className="w-full rounded-2xl bg-white p-3 ring-1 ring-zinc-100 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-800">Payment settled</span>
        <SolMark />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-zinc-100 px-2 py-1.5 text-center">
          <div className="text-[8px] text-zinc-500">From</div>
          <div className="text-[10px] font-bold text-zinc-800">Agent A</div>
        </div>
        <div className="relative h-px flex-1 bg-zinc-200">
          <div
            className="absolute -top-1.5 h-3 w-3 rounded-full bg-violet-500"
            style={{ animation: "flow-x 2s linear infinite" }}
          />
        </div>
        <div className="flex-1 rounded-lg bg-zinc-100 px-2 py-1.5 text-center">
          <div className="text-[8px] text-zinc-500">To</div>
          <div className="text-[10px] font-bold text-zinc-800">Agent B</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
        <span className="text-[10px] text-zinc-500">Amount</span>
        <span className="text-[11px] font-bold text-violet-600">0.30 USDC</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[9px] font-medium text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Settled in 0.4s · Solana
      </div>
    </div>
  );
}

function SolMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-3.5 w-3.5" fill="none">
      <defs>
        <linearGradient id="sol-grad-carousel" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="0.5" stopColor="#03E1FF" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path d="M8.5 5 L28 5 L23.5 9.5 L4 9.5 Z" fill="url(#sol-grad-carousel)" />
      <path d="M4 13.75 L23.5 13.75 L28 18.25 L8.5 18.25 Z" fill="url(#sol-grad-carousel)" />
      <path d="M8.5 22.5 L28 22.5 L23.5 27 L4 27 Z" fill="url(#sol-grad-carousel)" />
    </svg>
  );
}
