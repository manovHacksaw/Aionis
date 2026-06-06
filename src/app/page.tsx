"use client";

import { motion } from "framer-motion";
import { LandingNav }     from "@/components/landing/LandingNav";
import { LandingHero }    from "@/components/landing/LandingHero";
import GettingStarted     from "@/components/landing/GettingStarted";

export default function Home() {
  return (
    <>
      <style>{`
        .floating-nav-wrapper  { display: none !important; }
        .floating-action-wrapper { display: none !important; }
        body { background: #020202 !important; margin: 0 !important; }
        body::before { display: none !important; }
      `}</style>

      <main className="relative w-full min-h-screen bg-black text-white font-sans select-none" style={{ display: 'block', gap: 0 }}>
        <LandingNav />

        {/* Hero — full viewport with hand/light background */}
        <section className="relative w-full flex flex-col justify-end items-center overflow-hidden z-20 pt-16" style={{ minHeight: '100svh', paddingBottom: 'clamp(7rem, 12vh, 11rem)' }}>
          {/* Background image */}
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundImage: "url('/images/hero.jpg')",
              backgroundPosition: "center calc(50% - 45px)",
              backgroundSize: "cover",
              filter: "brightness(1.22) contrast(1.04)",
            }}
            className="absolute inset-0 z-0"
          />

          {/* Noise overlay */}
          <div className="absolute inset-0 noise-texture opacity-[0.055] z-10 pointer-events-none" />

          {/* Radial vignette */}
          <div
            style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)" }}
            className="absolute inset-0 z-10 pointer-events-none"
          />

          {/* Top + sides darkening */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-10 pointer-events-none" />

          {/* Cinematic bottom fade — hero dissolves into page black */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
            style={{ height: '50%', background: 'linear-gradient(to top, #020202 0%, #020202 15%, rgba(2,2,2,0.85) 40%, rgba(2,2,2,0.4) 65%, transparent 100%)' }}
          />

          <LandingHero />
        </section>

        {/* Scroll-driven onboarding timeline — emerges from darkness */}
        <div style={{ marginTop: '-2px', background: '#020202' }}>
          <GettingStarted />
        </div>
      </main>
    </>
  );
}
