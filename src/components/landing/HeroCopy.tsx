'use client';

import { motion } from 'framer-motion';

export function HeroCopy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="absolute top-1/2 -translate-y-1/2 right-0 w-[46%] pr-12 text-left z-20"
    >
      <p
        className="text-white font-semibold leading-[1.15] tracking-tight"
        style={{ fontSize: 'clamp(1.6rem, 2.8vw, 3.2rem)' }}
      >
        Trade for those who want an agent to never miss a signal.
      </p>
    </motion.div>
  );
}
