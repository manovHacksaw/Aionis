'use client';

import { motion }              from 'framer-motion';
import { useState, useEffect } from 'react';

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString('en-US', {
        hour:   '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

export function InfoBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      style={{
        position: 'absolute',
        bottom: '44%',
        left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      {/* Left group — two separate text items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <span style={{
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.01em',
          fontWeight: 400,
        }}>
          Autonomous copy-trading agent
        </span>
        <span style={{
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.01em',
          fontWeight: 400,
        }}>
          <LiveClock /> · Somnia Network
        </span>
      </div>

      {/* Right */}
      <span style={{
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.02em',
        fontWeight: 400,
      }}>
        Scroll to explore ↓
      </span>
    </motion.div>
  );
}
