"use client";

import React from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function SqueezeOnScroll({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  const { scrollY } = useScroll();
  const padX = useTransform(scrollY, [0, 220], [0, 44]);
  const padY = useTransform(scrollY, [0, 220], [0, 22]);
  const radius = useTransform(scrollY, [0, 220], [0, 32]);

  return (
    <motion.div
      style={{
        paddingLeft: padX,
        paddingRight: padX,
        paddingTop: padY,
        paddingBottom: padY,
      }}
      className={className}
    >
      <motion.div
        style={{ borderRadius: radius }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
