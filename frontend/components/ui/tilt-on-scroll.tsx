"use client";

import React from "react";
import { motion } from "motion/react";

export function TiltOnScroll({
  direction,
  children,
}: {
  direction: "left" | "right";
  children: React.ReactNode;
}) {
  const sign = direction === "left" ? -1 : 1;

  return (
    <motion.div
      className="h-full"
      initial={{
        opacity: 0,
        rotateX: 28,
        rotateY: sign * -14,
        x: sign * 80,
        y: 60,
      }}
      whileInView={{
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
      }}
      viewport={{ once: false, margin: "0px 0px -120px 0px", amount: 0.3 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        perspective: 1400,
        transformStyle: "preserve-3d",
        transformOrigin: "center top",
      }}
    >
      {children}
    </motion.div>
  );
}
