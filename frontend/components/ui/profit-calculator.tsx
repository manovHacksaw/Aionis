"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "motion/react";

export function ProfitCalculator() {
  const [spendLimit, setSpendLimit] = useState(10);
  const [displayValue, setDisplayValue] = useState(8.37);

  // Derived values to match the screenshot ratio: Net Gain 8.37, Cost 2.79, Expected Value 11.16
  const expectedValue = useMemo(() => spendLimit * 1.116, [spendLimit]);
  const cost = useMemo(() => spendLimit * 0.279, [spendLimit]);
  const netGain = useMemo(() => expectedValue - cost, [expectedValue, cost]);

  // Handle number animation logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(netGain);
    }, 100);
    return () => clearTimeout(timer);
  }, [netGain]);

  return (
    <div className="mx-auto max-w-4xl font-mono text-center">
        {/* Main Value Box Container - The Focus Box */}
        <div className="relative flex flex-col items-center">
          {/* Corner Brackets - Blockier & Lighter */}
          <div className="absolute left-1/2 top-1/2 z-0 h-[160px] w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-40">
             {/* Top Left */}
             <div className="absolute left-0 top-0 h-6 w-6 border-l-[3px] border-t-[3px] border-zinc-200" />
             {/* Top Right */}
             <div className="absolute right-0 top-0 h-6 w-6 border-r-[3px] border-t-[3px] border-zinc-200" />
             {/* Bottom Left */}
             <div className="absolute bottom-0 left-0 h-6 w-6 border-b-[3px] border-l-[3px] border-zinc-200" />
             {/* Bottom Right */}
             <div className="absolute bottom-0 right-0 h-6 w-6 border-b-[3px] border-r-[3px] border-zinc-200" />
          </div>

          <div className="relative z-10 flex min-w-[260px] flex-col items-center rounded-[20px] bg-white p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] ring-1 ring-zinc-100/50">
             <div className="flex items-center gap-3">
                <span className="translate-y-[-0.2em] text-[20px] font-medium text-zinc-300">+$</span>
                <AnimatedNumber value={displayValue} />
                <span className="ml-2 translate-y-[0.2em] text-[15px] font-medium text-zinc-300">Net Gain</span>
             </div>
          </div>
        </div>

        {/* Mid-Section Text */}
        <div className="mt-8 space-y-1">
           <p className="text-[13px] font-semibold text-zinc-800">This pricing scales as your automations do. No surprises — just usage.</p>
           <p className="text-[12px] text-zinc-400">Use the slider to preview your net gain.</p>
        </div>

        {/* Slider Section - Compact & Upward */}
        <div className="mx-auto mt-6 max-w-lg">
           <div className="relative mb-14 flex h-8 items-center justify-center">
              <div 
                className="absolute rounded-full bg-black px-4 py-1.5 text-[11px] font-bold text-white shadow-md transition-all duration-200"
                style={{ 
                    left: `calc(${(spendLimit - 1) / 24 * 100}% - 32px)`,
                    bottom: '0px'
                }}
              >
                ${spendLimit} / hr
              </div>
           </div>

           <CustomSlider value={spendLimit} onChange={setSpendLimit} />

           <div className="mt-5 flex items-center justify-between px-1 text-[9px] font-bold tracking-tight text-zinc-400">
              <span>$1/hr spend</span>
              <div className="flex gap-[6px]">
                 {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className={`h-[3px] w-[3px] rounded-full ${i === 5 ? 'bg-zinc-300' : 'bg-zinc-200'}`} />
                 ))}
              </div>
              <span>$25/hr spend</span>
           </div>
        </div>

      </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const digits = value.toFixed(2).split("");

  return (
    <div className="flex items-center text-[64px] font-bold text-black sm:text-[72px]">
      {digits.map((digit, i) => (
        <Digit key={i} char={digit} />
      ))}
    </div>
  );
}

function Digit({ char }: { char: string }) {
  if (char === "." || char === ",") {
    return <span className="mx-0.5 inline-block translate-y-[0.1em]">{char}</span>;
  }

  const num = parseInt(char);

  return (
    <div className="relative h-[1em] w-[0.75ch] overflow-hidden sm:h-[1.1em]">
      <motion.div
        animate={{
          y: `-${num * 10}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 0.8,
        }}
        className="flex flex-col"
        style={{ height: "1000%" }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="flex h-[10%] items-center justify-center">
            {n}
          </div>
        ))}
      </motion.div>
      
      {/* Dynamic Motion Blur Overlay - active during movement */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
    </div>
  );
}

function CustomSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative flex h-10 w-full items-center">
      {/* High Density Ticks */}
      <div className="absolute inset-0 flex justify-between pt-4">
        {Array.from({ length: 101 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-2.5 w-[1px] transition-colors ${i % 10 === 0 ? 'h-4 bg-zinc-300' : 'bg-zinc-100'}`} 
          />
        ))}
      </div>
      
      <input
        type="range"
        min="1"
        max="25"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
      />
      
      {/* Custom Thumb Visual */}
      <motion.div
        className="pointer-events-none absolute h-7 w-7 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-2 ring-zinc-900"
        style={{
          left: `calc(${(value - 1) / 24 * 100}% - 14px)`,
        }}
      />
    </div>
  );
}

