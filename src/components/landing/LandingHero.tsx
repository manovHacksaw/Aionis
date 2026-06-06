"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 md:px-16 select-none z-20 max-w-5xl mx-auto w-full">
      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ fontWeight: 340 }}
        className="text-[28px] md:text-[44px] lg:text-[54px] tracking-[-0.055em] text-white leading-[0.91] max-w-4xl font-sans text-center"
      >
        One Touch. A Thousand Moves<br className="hidden md:inline" /> Already Working for You.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="text-[13px] md:text-[14px] text-neutral-400 font-normal leading-[1.6] mt-12 md:mt-16 max-w-[360px] text-center"
      >
        Join star traders executing thousands of precision moves. Your portfolio follows every signal, automatically.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="mt-12 md:mt-14"
      >
        <Link href="/demo">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.40)" }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: "15px 34px", fontWeight: 300 }}
            className="rounded-full border border-white/18 bg-white/[0.03] text-white/90 text-[14px] tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.065)] backdrop-blur-lg transition-all duration-300 cursor-pointer"
          >
            Try Demo
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
