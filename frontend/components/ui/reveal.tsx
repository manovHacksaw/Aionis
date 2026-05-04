"use client";

import React from "react";
import { motion } from "motion/react";

type RevealProps = React.PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
  fromX?: number;
  fromY?: number;
  scale?: number;
  delay?: number;
  duration?: number;
  amount?: number;
  once?: boolean;
}>;

export function Reveal({
  children,
  className,
  style,
  fromX = 0,
  fromY = 30,
  scale = 0.92,
  delay = 0,
  duration = 0.9,
  amount = 0.3,
  once = false,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, x: fromX, y: fromY, scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
