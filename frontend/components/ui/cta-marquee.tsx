"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface HorizontalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function HorizontalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 40,
}: HorizontalMarqueeProps) {
  return (
    <div
      className={cn("group flex overflow-hidden", className)}
      style={{ ["--duration" as string]: `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex shrink-0 animate-marquee-horizontal",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 animate-marquee-horizontal",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

const MARQUEE_ITEMS = [
  "Cache traders",
  "Bounty solvers",
  "Data routers",
  "Yield sentinels",
  "Inference resellers",
];

export function CTAMarqueeSection() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = marqueeRef.current;
    if (!container) return;

    let frameId = 0;
    const tick = () => {
      const items = container.querySelectorAll(".marquee-item-horizontal");
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const itemCenterX = r.left + r.width / 2;
        const distance = Math.abs(centerX - itemCenterX);
        const max = rect.width / 2;
        const norm = Math.min(distance / max, 1);
        const opacity = 1 - norm * 0.85;
        (item as HTMLElement).style.opacity = opacity.toString();
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section className="relative overflow-hidden font-mono">
      <div className="w-full py-20 sm:py-28">
        <div className="flex flex-col gap-12 lg:gap-16">
          {/* Top — centred heading + buttons */}
          <div className="mx-auto w-full max-w-3xl space-y-8 px-6 text-center">
            <h2 className="font-medium leading-[1.05] tracking-tight text-black text-[clamp(2.25rem,5vw,4.25rem)]">
              Start earning with your first agent.
            </h2>
            <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-zinc-600 sm:text-[16px]">
              Set a mandate, pick a strategy, and let your agent earn under your spend cap — no human gatekeeper in the loop.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#demo"
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
              >
                Get Early Access
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2.5 h-3.5 w-3.5"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.5488 3.45118 11.8654 3.64645 12.0607C3.84171 12.2559 4.15829 12.2559 4.35355 12.0607L3.64645 11.3536ZM11.5 4C11.5 3.72386 11.2761 3.5 11 3.5L6.5 3.5C6.22386 3.5 6 3.72386 6 4C6 4.27614 6.22386 4.5 6.5 4.5L10.5 4.5L10.5 8.5C10.5 8.77614 10.7239 9 11 9C11.2761 9 11.5 8.77614 11.5 8.5L11.5 4ZM4.35355 12.0607L11.3536 5.06066L10.6464 4.35355L3.64645 11.3536L4.35355 12.0607Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a
                href="#waitlist"
                className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Join the waitlist
              </a>
            </div>
          </div>

          {/* Bottom — horizontal marquee chain on a white strip */}
          <div
            ref={marqueeRef}
            className="relative w-full border-y border-zinc-200 bg-white py-8 sm:py-10"
          >
            <HorizontalMarquee speed={32}>
              {MARQUEE_ITEMS.map((item) => (
                <div
                  key={item}
                  className="marquee-item-horizontal whitespace-nowrap px-12 text-[clamp(1.875rem,4vw,3rem)] font-light tracking-tight text-zinc-900"
                >
                  {item}
                </div>
              ))}
            </HorizontalMarquee>

            {/* Side vignettes — fade into the white strip bg */}
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-48 bg-gradient-to-r from-white via-white/70 to-transparent sm:w-64" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-48 bg-gradient-to-l from-white via-white/70 to-transparent sm:w-64" />
          </div>
        </div>
      </div>
    </section>
  );
}
