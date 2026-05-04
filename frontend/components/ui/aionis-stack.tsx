"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const AUTO_CYCLE_MS = 2400;

type Layer = {
  label: string;
  highlights: [string, string, string];
};

const LAYERS: Layer[] = [
  {
    label: "Dashboard",
    highlights: [
      "Real-time PnL Tracking",
      "Mandate Spend Caps",
      "Per-agent Insights",
    ],
  },
  {
    label: "Agents",
    highlights: [
      "Autonomous Decisions",
      "Per-agent Wallets",
      "Mandate-aware Execution",
    ],
  },
  {
    label: "Profit Filter",
    highlights: [
      "Cost vs Reward Logic",
      "Margin Thresholds",
      "Auto-pruned Sources",
    ],
  },
  {
    label: "Cache Layer",
    highlights: [
      "Reusable Computations",
      "Sub-cent Cache Sales",
      "Network-wide Hits",
    ],
  },
  {
    label: "Solana",
    highlights: [
      "USDC Settlement",
      "Sub-cent Tx Fees",
      "Sealevel Parallelism",
    ],
  },
];

const ACCENT_RGB = "245, 158, 11"; // amber-500 — single brand accent

export function AionisStack() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((activeRef.current + 1) % LAYERS.length);
    }, AUTO_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const layer = LAYERS[active];

  return (
    <div
      className="relative mt-20 flex items-center justify-between gap-2 sm:mt-28 sm:gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <ul className="flex flex-col gap-6 text-right sm:gap-7">
        {LAYERS.map((l, i) => {
          const isActive = active === i;
          return (
            <li key={l.label}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`flex w-full items-center justify-end gap-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  isActive ? "text-black" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <span className="whitespace-nowrap">{l.label}</span>
                <motion.span
                  aria-hidden
                  animate={{
                    backgroundColor: isActive
                      ? `rgb(${ACCENT_RGB})`
                      : "rgb(161 161 170 / 0.7)",
                    height: isActive ? 2 : 1,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="block w-10 sm:w-20 lg:w-32"
                />
                <motion.span
                  aria-hidden
                  animate={{
                    backgroundColor: isActive
                      ? `rgb(${ACCENT_RGB})`
                      : "rgb(212 212 216)",
                    scale: isActive ? 1.4 : 1,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="-ml-3 block h-2.5 w-2.5 rounded-full"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <AionisIsoStack activeIndex={active} onHover={setActive} />

      <div className="flex flex-col gap-9 text-left sm:gap-12">
        <AnimatePresence mode="wait">
          <motion.ul
            key={layer.label}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-9 sm:gap-12"
          >
            {layer.highlights.map((h) => (
              <li
                key={h}
                className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700"
              >
                <span
                  aria-hidden
                  className="-mr-3 block h-2.5 w-2.5 rounded-full bg-amber-500"
                />
                <span
                  aria-hidden
                  className="block h-px w-10 bg-zinc-400/70 sm:w-20 lg:w-32"
                />
                <span className="whitespace-nowrap">{h}</span>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AionisIsoStack({
  activeIndex,
  onHover,
}: {
  activeIndex: number;
  onHover: (index: number) => void;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className="relative h-[260px] w-[280px] sm:h-[320px] sm:w-[360px]"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(58deg) rotateZ(-42deg)",
          perspective: 1200,
        }}
      >
        {[0, 1, 2, 3, 4].map((j) => {
          const layerIdx = 4 - j;
          const isActive = layerIdx === activeIndex;
          const isAbove = layerIdx < activeIndex;
          const baseZ = j * 28;
          const liftZ = isAbove ? 120 : 0;
          const popZ = isActive ? 36 : 0;
          const z = baseZ + liftZ + popZ;
          return (
            <div
              key={j}
              onMouseEnter={() => onHover(layerIdx)}
              className={`absolute inset-0 cursor-pointer rounded-[32px] border-2 bg-white ${
                isActive ? "border-amber-500" : "border-zinc-300/70"
              }`}
              style={{
                transform: `translateZ(${z}px)`,
                opacity: isAbove ? 0.18 : 1,
                transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, border-color 0.4s ease, box-shadow 0.5s ease",
                boxShadow: isActive
                  ? `0 32px 64px -20px rgba(${ACCENT_RGB}, 0.35)`
                  : "0 14px 28px -18px rgba(15, 30, 60, 0.12)",
              }}
            >
              {isActive && <LayerMock layerIndex={activeIndex} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayerMock({ layerIndex }: { layerIndex: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layerIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-5 flex flex-col"
      >
        {layerIndex === 0 && <DashboardMock />}
        {layerIndex === 1 && <AgentsMock />}
        {layerIndex === 2 && <ProfitFilterMock />}
        {layerIndex === 3 && <CacheMock />}
        {layerIndex === 4 && <SolanaMock />}
      </motion.div>
    </AnimatePresence>
  );
}

function DashboardMock() {
  const bars = [22, 30, 26, 38, 34, 48, 42, 58, 50, 66, 60, 78];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
        </div>
        <div className="flex items-center gap-1">
          <span className="block size-1 rounded-full bg-amber-500" />
          <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Live
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-bold leading-none text-zinc-900">
          +$2,847
        </span>
        <span className="text-[8px] font-medium text-amber-600">net today</span>
      </div>

      <div className="flex flex-1 items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t ${
              i >= bars.length - 3 ? "bg-amber-500" : "bg-amber-300/70"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-1.5">
        <span className="text-[8px] font-semibold text-zinc-700">3 agents</span>
        <span className="text-[8px] text-zinc-500">cap $100/d</span>
      </div>
    </div>
  );
}

function AgentsMock() {
  const agents = [
    { code: "K9", label: "Cache trader", spend: "$0.42" },
    { code: "B2", label: "Bounty solver", spend: "$2.18" },
    { code: "A7", label: "Data router", spend: "$1.07" },
  ];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          Active agents
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700">
          {agents.length} live
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        {agents.map((a) => (
          <div
            key={a.code}
            className="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50/70 px-2 py-1.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-800">
              {a.code}
            </span>
            <span className="flex-1 text-[10px] font-medium text-zinc-800">
              {a.label}
            </span>
            <span className="font-mono text-[9px] text-zinc-500">{a.spend}</span>
            <span className="block size-1 rounded-full bg-amber-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfitFilterMock() {
  const bars = [
    { h: 28, ok: false, cost: 4.2, reward: 0.7 },
    { h: 38, ok: false, cost: 1.1, reward: 0.3 },
    { h: 50, ok: true, cost: 0.8, reward: 1.4 },
    { h: 64, ok: true, cost: 1.2, reward: 2.6 },
    { h: 44, ok: false, cost: 2.0, reward: 1.8 },
    { h: 78, ok: true, cost: 0.5, reward: 1.9 },
    { h: 56, ok: true, cost: 0.9, reward: 1.6 },
  ];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          Margin filter
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700">
          ≥ 18% only
        </span>
      </div>
      <div className="relative flex flex-1 items-end gap-1.5">
        <div className="absolute left-0 right-0 border-t border-dashed border-amber-400/60" style={{ bottom: "44%" }} />
        {bars.map((b, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t ${
              b.ok ? "bg-amber-500" : "bg-zinc-200"
            }`}
            style={{ height: `${b.h}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 pt-1">
        <span className="text-[8px] text-zinc-500">4 accepted</span>
        <span className="text-[8px] text-zinc-400">3 pruned</span>
      </div>
    </div>
  );
}

function CacheMock() {
  const cells = Array.from({ length: 24 });
  const hits = new Set([0, 2, 3, 6, 7, 9, 11, 14, 16, 18, 20, 21]);
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          Cache hits
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-[12px] font-bold leading-none text-zinc-900">
            142
          </span>
          <span className="text-[8px] font-medium text-amber-600">today</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-8 gap-[3px]">
        {cells.map((_, i) => (
          <div
            key={i}
            className={`rounded-sm ${hits.has(i) ? "bg-amber-500" : "bg-zinc-100"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 pt-1">
        <span className="text-[8px] text-zinc-500">hit rate</span>
        <span className="text-[8px] font-bold text-zinc-700">50%</span>
      </div>
    </div>
  );
}

function SolanaMock() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          Solana settlement
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700">
          USDC
        </span>
      </div>

      <div className="flex flex-1 flex-col items-start justify-center gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[16px] font-bold leading-none text-zinc-900">
            $0.00025
          </span>
          <span className="text-[8px] font-medium text-zinc-500">per tx</span>
        </div>
        <div className="flex items-end gap-1">
          {[40, 60, 35, 80, 50, 70, 45].map((h, i) => (
            <span
              key={i}
              className="block w-1 rounded-full bg-amber-400"
              style={{ height: `${h * 0.18}px` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-1">
        <span className="text-[8px] text-zinc-500">throughput</span>
        <span className="text-[8px] font-bold text-zinc-700">3,128 tx/s</span>
      </div>
    </div>
  );
}
