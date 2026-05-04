"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AionisSpark } from "@/app/page";

const AUTO_CYCLE_MS = 2800;

type Layer = {
  label: string;
  title: string;
  highlights: [string, string, string];
  color: string;
  dotColor: string;
};

const LAYERS: Layer[] = [
  {
    label: "Mandate",
    title: "Define your agent's operating constraints",
    highlights: ["Budget limits", "Task categories", "Risk thresholds"],
    color: "border-orange-500",
    dotColor: "bg-orange-500",
  },
  {
    label: "Strategy",
    title: "Configure logic for autonomous growth",
    highlights: ["Yield optimization", "Arbitrage logic", "Service pricing"],
    color: "border-sky-500",
    dotColor: "bg-sky-500",
  },
  {
    label: "Discovery",
    title: "Continuous scanning for market opportunities",
    highlights: ["Market data ingestion", "Sentiment analysis", "Opportunity discovery"],
    color: "border-violet-500",
    dotColor: "bg-violet-500",
  },
  {
    label: "Execution",
    title: "Secure, autonomous on-chain actions",
    highlights: ["Autonomous signing", "Profit verification", "Lighthouse protection"],
    color: "border-emerald-500",
    dotColor: "bg-emerald-500",
  },
  {
    label: "Settlement",
    title: "Instant profit distribution and recycling",
    highlights: ["USDC distribution", "Success fee capture", "Capital recycling"],
    color: "border-amber-500",
    dotColor: "bg-amber-500",
  },
];

export function LifecycleStack() {
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
                className={`flex w-full items-center justify-end gap-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  isActive ? "text-black" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <span className="whitespace-nowrap">{l.label}</span>
                <motion.span
                  animate={{
                    backgroundColor: isActive
                      ? "rgb(0 0 0)"
                      : "rgb(161 161 170 / 0.7)",
                    height: isActive ? 2 : 1,
                  }}
                  className="block w-10 sm:w-20 lg:w-32"
                />
              </button>
            </li>
          );
        })}
      </ul>

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
            const isActive = layerIdx === active;
            const isAbove = layerIdx < active;
            const baseZ = j * 28;
            const liftZ = isAbove ? 120 : 0;
            const popZ = isActive ? 36 : 0;
            const z = baseZ + liftZ + popZ;
            
            return (
              <div
                key={j}
                onMouseEnter={() => setActive(layerIdx)}
                className={`absolute inset-0 cursor-pointer rounded-[32px] border-2 bg-white ${
                  isActive ? LAYERS[layerIdx].color : "border-zinc-300/70"
                }`}
                style={{
                  transform: `translateZ(${z}px)`,
                  opacity: isAbove ? 0.18 : 1,
                  transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, border-color 0.4s ease, box-shadow 0.5s ease",
                  boxShadow: isActive
                    ? `0 32px 64px -20px rgba(0, 0, 0, 0.12)`
                    : "0 14px 28px -18px rgba(0, 0, 0, 0.08)",
                }}
              >
                {isActive && (
                  <div className="absolute inset-6 flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${LAYERS[layerIdx].dotColor}`} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                          {LAYERS[layerIdx].label}
                        </span>
                      </div>
                      <AionisSpark className="h-3 w-3 text-zinc-300" />
                    </div>
                    
                    <div className="flex-1 rounded-2xl bg-zinc-50/50 p-4 ring-1 ring-zinc-100/50">
                      {layerIdx === 0 && <MandateVisual />}
                      {layerIdx === 1 && <StrategyVisual />}
                      {layerIdx === 2 && <DiscoveryVisual />}
                      {layerIdx === 3 && <ExecutionVisual />}
                      {layerIdx === 4 && <SettlementVisual />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-9 text-left sm:gap-12">
        <AnimatePresence mode="wait">
          <motion.ul
            key={layer.label}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex flex-col gap-9 sm:gap-12"
          >
            {layer.highlights.map((h) => (
              <li
                key={h}
                className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700"
              >
                <span className={`-mr-3 block h-1.5 w-1.5 rounded-full ${layer.dotColor}`} />
                <span className="block h-px w-10 bg-zinc-400/70 sm:w-20 lg:w-32" />
                <span className="whitespace-nowrap">{h}</span>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MandateVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-2 w-20 rounded-full bg-orange-200" />
        <div className="h-4 w-10 rounded bg-orange-100" />
      </div>
      <div className="h-px w-full bg-zinc-100" />
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="h-4 w-4 rounded-full bg-orange-50" />
          <div className="h-2 flex-1 rounded-full bg-zinc-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-4 rounded-full bg-orange-50" />
          <div className="h-2 flex-1 rounded-full bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function StrategyVisual() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-end gap-1">
        {[40, 70, 45, 90, 60].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-sky-200" style={{ height: `${h / 2}px` }} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-sky-50" />
        <div className="h-2 flex-1 rounded-full bg-zinc-100" />
      </div>
    </div>
  );
}

function DiscoveryVisual() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="aspect-square rounded-lg bg-violet-50 p-2">
        <div className="h-full w-full rounded-md border-2 border-dashed border-violet-200" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-2 w-full rounded-full bg-violet-100" />
        <div className="h-2 w-full rounded-full bg-zinc-100" />
        <div className="h-2 w-2/3 rounded-full bg-zinc-100" />
      </div>
    </div>
  );
}

function ExecutionVisual() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40">
           <svg viewBox="0 0 20 20" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
             <path d="M5 10 L8 13 L15 6" strokeLinecap="round" strokeLinejoin="round" />
           </svg>
        </div>
      </div>
    </div>
  );
}

function SettlementVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-amber-100 p-1.5">
          <div className="h-full w-full rounded-full bg-amber-400" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-16 rounded-full bg-zinc-800" />
          <div className="h-1.5 w-10 rounded-full bg-zinc-400" />
        </div>
      </div>
      <div className="rounded-lg bg-zinc-900 px-3 py-2 text-[10px] font-mono text-emerald-400">
        +0.042 USDC
      </div>
    </div>
  );
}
