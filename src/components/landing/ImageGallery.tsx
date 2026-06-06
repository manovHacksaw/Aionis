'use client';

import { motion } from 'framer-motion';

const CARDS = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #e8e8e8 0%, #c8c8c8 30%, #f0f0f0 60%, #d8d8d8 100%)',
    overlay: 'radial-gradient(ellipse at 40% 50%, rgba(255,255,255,0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(180,160,140,0.4) 0%, transparent 50%)',
    blur: 'blur(0.5px)',
    label: 'Autonomous Signals',
  },
  {
    id: 2,
    bg: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 40%, #1a1a1a 70%, #0a0a0a 100%)',
    overlay: 'radial-gradient(ellipse at 55% 45%, rgba(80,80,80,0.6) 0%, transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(40,40,40,0.5) 0%, transparent 45%)',
    blur: 'blur(0.5px)',
    label: 'Real-time Execution',
  },
  {
    id: 3,
    bg: 'linear-gradient(145deg, #8b0000 0%, #cc0000 25%, #ff2200 45%, #8b0000 65%, #1a0000 100%)',
    overlay: 'radial-gradient(ellipse at 50% 40%, rgba(255,80,0,0.4) 0%, transparent 50%), repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
    blur: 'blur(0px)',
    label: 'Portfolio Growth',
  },
];

export function ImageGallery() {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0',
        width: '100%',
        height: '400px',
      }}
    >
      {CARDS.map((card, i) => (
        <div
          key={card.id}
          style={{
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            borderRadius: i === 0 ? '12px 0 0 12px' : i === 2 ? '0 12px 12px 0' : '0',
          }}
        >
          {/* Base gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: card.bg,
              filter: card.blur,
            }}
          />
          {/* Overlay for depth/texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: card.overlay,
            }}
          />
          {/* Subtle noise texture via SVG */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
            <filter id={`noise-${card.id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter={`url(#noise-${card.id})`}/>
          </svg>
          {/* Hover shimmer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0)',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0)')}
          />
        </div>
      ))}
    </motion.div>
  );
}
