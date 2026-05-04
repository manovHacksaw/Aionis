"use client";

import { useEffect, useState } from "react";
import Shuffle from "./shuffle";
import { AionisLogo } from "./aionis-logo";

export function AionisLoader() {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setFadingOut(true), 3500);
    return () => window.clearTimeout(id);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#f6f3ea] font-mono transition-opacity duration-700 ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={() => {
        if (fadingOut) {
          setHidden(true);
          document.body.style.overflow = "";
        }
      }}
      aria-hidden={fadingOut}
    >
      <div className="flex items-center gap-0">
        <AionisLogo className="-mr-8 h-24 w-auto sm:-mr-14 sm:h-40" priority />
        <Shuffle
          text="AIONIS"
          tag="h1"
          shuffleDirection="right"
          duration={0.45}
          shuffleTimes={2}
          ease="power3.out"
          stagger={0.06}
          triggerOnHover={false}
          className="text-4xl font-bold tracking-[0.06em] text-black sm:text-6xl [font-family:var(--font-silkscreen)]"
          onShuffleComplete={() => {
            window.setTimeout(() => setFadingOut(true), 600);
          }}
        />
      </div>
    </div>
  );
}
