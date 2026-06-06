'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion }                                    from 'framer-motion';

export function MassiveText() {
  const textRef     = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState('200px');

  // Dynamically fit AIONIS exactly edge-to-edge
  const fit = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.fontSize      = '200px';
    el.style.letterSpacing = '-0.03em'; // tight — letters almost touching
    const scale = window.innerWidth / el.scrollWidth;
    setFs(`${Math.floor(200 * scale)}px`);
  }, []);

  useEffect(() => {
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  return (
    <>
      <style>{`
        /* Blob drifts: slow, fluid, left ↔ right */
        @keyframes driftA {
          0%   { transform: translate(-12%, 0) scale(1.0);  }
          33%  { transform: translate(8%,  4%) scale(1.06); }
          66%  { transform: translate(16%, -2%) scale(0.97); }
          100% { transform: translate(-12%, 0) scale(1.0);  }
        }
        @keyframes driftB {
          0%   { transform: translate(14%,  2%) scale(0.95); }
          33%  { transform: translate(-6%, -3%) scale(1.04); }
          66%  { transform: translate(-14%, 4%) scale(0.98); }
          100% { transform: translate(14%,  2%) scale(0.95); }
        }
        @keyframes driftC {
          0%   { transform: translate(0%,   0%) scale(1.0);  }
          50%  { transform: translate(10%,  5%) scale(1.05); }
          100% { transform: translate(0%,   0%) scale(1.0);  }
        }
        /* Gradient shift on the text fill itself */
        @keyframes gradDrift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
      `}</style>

      {/* ── SVG noise filter — fine film grain ─────────────────────── */}
      <svg style={{ display: 'none' }}>
        <defs>
          {/* The grain filter applied inside the text */}
          <filter id="textGrain" x="0%" y="0%" width="100%" height="100%"
            colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.70 0.68"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            {/* overlay blend — grain interacts with color beneath it */}
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="grained" />
            <feComponentTransfer in="grained">
              <feFuncA type="linear" slope="1" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          /* Bottom half of the screen */
          height: '58%',
          overflow: 'hidden',
        }}
      >
        {/*
         * ══════════════════════════════════════════════════════════════
         *  BLOB LAYER — crimson · ruby red · deep magenta · dark burgundy
         *  These blobs drift behind the text mask.
         *  Heavy blur = soft, misty, no sharp edges.
         * ══════════════════════════════════════════════════════════════
         */}
        <div style={{ position: 'absolute', inset: 0 }}>

          {/* Blob 1 — LEFT: bright ruby red with coral-white hot centre */}
          <div style={{
            position: 'absolute',
            left: '-15%', bottom: '-20%',
            width: '65%', height: '130%',
            borderRadius: '50%',
            background: `radial-gradient(
              ellipse at 38% 62%,
              rgba(255, 200, 160, 0.8)  0%,
              rgba(255,  60,  20, 0.7) 14%,
              rgba(210,   0,  10, 0.6) 32%,
              rgba(140,   0,   5, 0.4) 55%,
              transparent 72%
            )`,
            filter: 'blur(52px)',
            animation: 'driftA 11s ease-in-out infinite',
          }} />

          {/* Blob 2 — RIGHT: vivid crimson / deep magenta */}
          <div style={{
            position: 'absolute',
            right: '-10%', bottom: '-15%',
            width: '55%', height: '110%',
            borderRadius: '50%',
            background: `radial-gradient(
              ellipse at 62% 65%,
              rgba(200,  10,  60, 0.65)  0%,
              rgba(180,   0,  20, 0.55) 22%,
              rgba(110,   0,  10, 0.35) 48%,
              transparent 68%
            )`,
            filter: 'blur(58px)',
            animation: 'driftB 13s ease-in-out infinite',
          }} />

          {/* Blob 3 — CENTRE: deep burgundy / dark red (creates the moody middle) */}
          <div style={{
            position: 'absolute',
            left: '20%', right: '20%',
            bottom: '-10%', height: '80%',
            borderRadius: '50%',
            background: `radial-gradient(
              ellipse at 50% 80%,
              rgba(160,   0,  15, 0.5) 0%,
              rgba( 90,   0,   5, 0.35) 35%,
              transparent 65%
            )`,
            filter: 'blur(48px)',
            animation: 'driftC 9s ease-in-out infinite',
          }} />

          {/* Dark swoosh — the dramatic black void above the letter bodies */}
          <div style={{
            position: 'absolute',
            left: '10%', right: '10%',
            top: '-5%', height: '52%',
            background: 'radial-gradient(ellipse at 50% 15%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 68%)',
            filter: 'blur(44px)',
          }} />

          {/* Additional dark pocket — right quadrant */}
          <div style={{
            position: 'absolute',
            right: '10%', top: '0',
            width: '32%', height: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 60%)',
            filter: 'blur(38px)',
          }} />
        </div>

        {/*
         * ══════════════════════════════════════════════════════════════
         *  AIONIS STENCIL TEXT
         *
         *  - Transparent fill (background-clip: text)
         *  - The gradient below matches the blob palette above
         *  - SVG grain filter applied via filter: url(#textGrain)
         *    so the noise is INSIDE the letter shapes only
         *  - backgroundSize: 280% + animation: gradDrift = the gradient
         *    drifts horizontally, causing dynamic lighting changes
         * ══════════════════════════════════════════════════════════════
         */}
        <div
          ref={textRef}
          style={{
            position: 'absolute',
            bottom: '-16%',       // grounded to viewport bottom, letters clip here
            left: 0,
            right: 0,
            whiteSpace: 'nowrap',

            /* Heavy geometric sans-serif, 900 weight */
            fontFamily: '"Bebas Neue", "Inter", system-ui, sans-serif',
            fontWeight: 900,
            fontSize: fs,

            /* TIGHT — letters almost touching, reads as one graphic block */
            letterSpacing: '-0.03em',
            lineHeight: 0.82,
            userSelect: 'none',

            /*
             * Gradient fill:
             *   Left: warm coral-white (matches left blob hot spot)
             *   →  ruby red → deep crimson → near-black → burgundy
             *   → magenta-red → warm coral (matches right blob)
             *
             * NO blue or cool purple. Only warm reds, crimsons, magentas.
             */
            background: `linear-gradient(
              90deg,
              rgba(255, 195, 155, 0.95)  0%,
              rgba(255,  80,  35, 0.88) 10%,
              rgba(215,  10,  15, 0.8)  24%,
              rgba(140,   0,   5, 0.72) 38%,
              rgba( 55,   0,   0, 0.65) 50%,
              rgba(140,   0,  10, 0.72) 62%,
              rgba(190,   0,  40, 0.78) 74%,
              rgba(240,  40,  20, 0.85) 86%,
              rgba(255, 185, 140, 0.92) 100%
            )`,
            backgroundSize: '280% 100%',
            animation: 'gradDrift 10s ease-in-out infinite',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',

            /* Apply grain filter — noise lives INSIDE letter shapes */
            filter: 'url(#textGrain)',
          }}
        >
          AIONIS
        </div>
      </motion.div>
    </>
  );
}
