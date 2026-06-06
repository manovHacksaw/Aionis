"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function GettingStarted() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 1. Detect screen size dynamically for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Track scroll progress through the timeline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply a premium spring damping to the scroll progress for organic easing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // 3. Measure SVG path length once rendered
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [isMobile]); // Re-measure when path changes due to layout switch

  // SVG Paths
  const desktopPath = "M 120 200 C 350 200, 250 500, 500 500 C 750 500, 650 200, 900 200 C 1150 200, 1050 500, 1180 500";
  const mobilePath = "M 40 50 L 40 650";
  const activePath = isMobile ? mobilePath : desktopPath;

  // Path Drawing (strokeDashoffset maps from full length to 0)
  const strokeDashoffset = useTransform(
    smoothProgress,
    [0, 0.85], // Start drawing immediately from scroll start
    [pathLength, 0]
  );

  // Glowing Point Position
  const offsetDistance = useTransform(
    smoothProgress,
    [0, 0.85],
    ["0%", "100%"]
  );

  // 4. Parallax Transforms
  const bgY = useTransform(scrollYProgress, [0, 1], ["0px", "-100px"]);
  const svgY = useTransform(smoothProgress, [0, 1], ["0px", "-30px"]);
  const cardsY = useTransform(smoothProgress, [0, 1], ["0px", "15px"]);

  // 5. Header fade/slide entrance as section reaches viewport
  const headerOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.12], [25, 0]);

  // 6. Step Card Triggers: Opacity, Position, and Connector Progress
  // Step 1: Active by default as the starting state when page is visible
  const card1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 1]);
  const card1YOffset = useTransform(smoothProgress, [0, 0.15], [0, 0]);
  const connector1Progress = useTransform(smoothProgress, [0, 0.15], ["100%", "100%"]);

  // Step 2: Waypoint at ~40% progress
  const card2Opacity = useTransform(smoothProgress, [0.30, 0.42], [0, 1]);
  const card2YOffset = useTransform(smoothProgress, [0.30, 0.42], [15, 0]);
  const connector2Progress = useTransform(smoothProgress, [0.34, 0.44], ["0%", "100%"]);

  // Step 3: Waypoint at ~65% progress
  const card3Opacity = useTransform(smoothProgress, [0.52, 0.64], [0, 1]);
  const card3YOffset = useTransform(smoothProgress, [0.52, 0.64], [15, 0]);
  const connector3Progress = useTransform(smoothProgress, [0.56, 0.66], ["0%", "100%"]);

  // Step 4: Waypoint at ~90% progress
  const card4Opacity = useTransform(smoothProgress, [0.75, 0.88], [0, 1]);
  const card4YOffset = useTransform(smoothProgress, [0.75, 0.88], [15, 0]);
  const connector4Progress = useTransform(smoothProgress, [0.79, 0.89], ["0%", "100%"]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none z-30"
      style={{ height: isMobile ? "240vh" : "300vh" }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#020202] flex flex-col justify-start items-center px-6 md:px-16 pt-36 md:pt-44 pb-8 z-30">
        
        {/* Subtle noise layer */}
        <div className="absolute inset-0 noise-texture opacity-[0.055] z-10 pointer-events-none" />

        {/* Ambient background vignettes & drifting light streaks */}
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
          {/* Light Streak 1 */}
          <motion.div
            animate={{ x: ["-10%", "10%"], y: ["-5%", "5%"] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 22, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(circle, rgba(255, 110, 80, 0.075) 0%, transparent 65%)",
            }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[50px]"
          />
          {/* Light Streak 2 */}
          <motion.div
            animate={{ x: ["10%", "-10%"], y: ["5%", "-5%"] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 26, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(circle, rgba(255, 110, 80, 0.065) 0%, transparent 65%)",
            }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[60px]"
          />
        </motion.div>

        {/* Heading Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center z-20 max-w-xl mx-auto flex flex-col items-center select-none"
        >
          <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white leading-tight font-sans">
            From zero to crypto. In minutes.
          </h2>
          <p className="text-neutral-400 text-[13px] md:text-[14px] mt-4 max-w-sm">
            Your automated, seamless onboarding guide to secure asset growth.
          </p>
        </motion.div>

        {/* Timeline Interactive Interactive Area */}
        <div className="relative w-full max-w-7xl flex-1 mt-12 md:mt-6 z-20">
          
          {/* SVG Scroll Drawing Path */}
          <motion.svg
            style={{ y: svgY }}
            viewBox={isMobile ? "0 0 100 700" : "0 0 1440 700"}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            className="absolute inset-0 pointer-events-none z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Premium neon volumetric light filters */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7.5" result="blur1" />
                <feGaussianBlur stdDeviation="2.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Gray baseline background path */}
            <path
              d={activePath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={isMobile ? "1.5" : "1"}
            />

            {/* Glowing neon active drawn path */}
            <motion.path
              ref={pathRef}
              d={activePath}
              fill="none"
              stroke="rgba(255, 110, 80, 0.75)"
              strokeWidth={isMobile ? "1.5" : "1.2"}
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: strokeDashoffset,
              }}
            />

            {/* Volumetric glow duplicate path (drawn underneath for rich look) */}
            <motion.path
              d={activePath}
              fill="none"
              stroke="rgba(255, 110, 80, 0.28)"
              strokeWidth={isMobile ? "5" : "4.5"}
              filter="url(#glow)"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: strokeDashoffset,
              }}
            />

            {/* Glowing Traveling Dot */}
            {pathLength > 0 && (
              <motion.circle
                r={isMobile ? "4" : "3.5"}
                fill="#ff6e50"
                filter="url(#glow)"
                style={{
                  offsetPath: `path("${activePath}")`,
                  offsetDistance: offsetDistance,
                }}
              />
            )}
          </motion.svg>

          {/* Cards & Connectors Overlay */}
          <motion.div 
            style={{ y: cardsY }}
            className="absolute inset-0 z-20"
          >
            {isMobile ? (
              /* ================= MOBILE LAYOUT (VERTICAL TIMELINE) ================= */
              <div className="relative w-full h-full flex flex-col justify-between py-4 pl-16">
                
                {/* Step 01 */}
                <motion.div
                  style={{ opacity: card1Opacity, y: card1YOffset }}
                  className="relative flex items-center justify-start h-[22%]"
                >
                  <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex items-center w-[40px] h-px overflow-hidden">
                    <motion.div style={{ width: connector1Progress }} className="h-full bg-gradient-to-r from-[#ff6e50] to-transparent border-t border-dashed border-[#ff6e50]/40" />
                  </div>
                  <div className="absolute left-[-45px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-30" />
                  <div className="bg-neutral-900/60 border border-white/5 backdrop-blur-md rounded-xl p-4 w-full max-w-[280px]">
                    <span className="text-[9px] font-bold text-[#ff6e50] tracking-widest block uppercase">Step 01</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">Create Wallet</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-normal">Instantiate a secure, non-custodial cryptographic keypair managed by Aionis's zero-knowledge module.</p>
                  </div>
                </motion.div>

                {/* Step 02 */}
                <motion.div
                  style={{ opacity: card2Opacity, y: card2YOffset }}
                  className="relative flex items-center justify-start h-[22%]"
                >
                  <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex items-center w-[40px] h-px overflow-hidden">
                    <motion.div style={{ width: connector2Progress }} className="h-full bg-gradient-to-r from-[#ff6e50] to-transparent border-t border-dashed border-[#ff6e50]/40" />
                  </div>
                  <div className="absolute left-[-45px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-30" />
                  <div className="bg-neutral-900/60 border border-white/5 backdrop-blur-md rounded-xl p-4 w-full max-w-[280px]">
                    <span className="text-[9px] font-bold text-[#ff6e50] tracking-widest block uppercase">Step 02</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">Deposit Funds</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-normal">Fund your wallet with fiat or crypto in a single click, powered by gasless transactions and instant bridging.</p>
                  </div>
                </motion.div>

                {/* Step 03 */}
                <motion.div
                  style={{ opacity: card3Opacity, y: card3YOffset }}
                  className="relative flex items-center justify-start h-[22%]"
                >
                  <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex items-center w-[40px] h-px overflow-hidden">
                    <motion.div style={{ width: connector3Progress }} className="h-full bg-gradient-to-r from-[#ff6e50] to-transparent border-t border-dashed border-[#ff6e50]/40" />
                  </div>
                  <div className="absolute left-[-45px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-30" />
                  <div className="bg-neutral-900/60 border border-white/5 backdrop-blur-md rounded-xl p-4 w-full max-w-[280px]">
                    <span className="text-[9px] font-bold text-[#ff6e50] tracking-widest block uppercase">Step 03</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">Set AI Agent</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-normal">Choose your trading goals and risk parameters. Your autonomous AI agent begins analyzing market opportunities 24/7.</p>
                  </div>
                </motion.div>

                {/* Step 04 */}
                <motion.div
                  style={{ opacity: card4Opacity, y: card4YOffset }}
                  className="relative flex items-center justify-start h-[22%]"
                >
                  <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 flex items-center w-[40px] h-px overflow-hidden">
                    <motion.div style={{ width: connector4Progress }} className="h-full bg-gradient-to-r from-[#ff6e50] to-transparent border-t border-dashed border-[#ff6e50]/40" />
                  </div>
                  <div className="absolute left-[-45px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-30" />
                  <div className="bg-neutral-900/60 border border-white/5 backdrop-blur-md rounded-xl p-4 w-full max-w-[280px]">
                    <span className="text-[9px] font-bold text-[#ff6e50] tracking-widest block uppercase">Step 04</span>
                    <h4 className="text-sm font-semibold text-white mt-0.5">Unlock Growth</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-normal">Watch your portfolio auto-adjust and execute optimized trades in real time. Total control, absolute peace of mind.</p>
                  </div>
                </motion.div>

              </div>
            ) : (
              /* ================= DESKTOP LAYOUT (HORIZONTAL S-CURVE) ================= */
              <div className="relative w-full h-full">
                
                {/* Step 01 Card Group (X: 8.33%, Y: 28.57%, Card positioned above path) */}
                <motion.div
                  style={{ left: "8.33%", top: "28.57%", opacity: card1Opacity, y: card1YOffset }}
                  className="absolute z-30 flex flex-col items-center"
                >
                  <div className="w-[280px] border border-white/5 bg-neutral-900/60 backdrop-blur-md shadow-2xl rounded-xl p-5 translate-y-[-105%] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-[#ff6e50] uppercase">Step 01</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6e50] shadow-[0_0_8px_#ff6e50]" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Create Wallet</h3>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                      Instantly instantiate a secure, non-custodial cryptographic keypair managed by Aionis's zero-knowledge security module.
                    </p>
                  </div>
                  {/* Dashed connector growing downwards from card base to path */}
                  <div className="absolute top-[-25px] bottom-0 w-0.5 overflow-hidden flex flex-col justify-end">
                    <motion.div style={{ height: connector1Progress }} className="w-full bg-gradient-to-t from-[#ff6e50] to-transparent border-r border-dashed border-[#ff6e50]/40" />
                  </div>
                  {/* Waypoint point */}
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-40 translate-y-[-50%]" />
                </motion.div>

                {/* Step 02 Card Group (X: 34.72%, Y: 71.43%, Card positioned below path) */}
                <motion.div
                  style={{ left: "34.72%", top: "71.43%", opacity: card2Opacity, y: card2YOffset }}
                  className="absolute z-30 flex flex-col items-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-40 translate-y-[-50%]" />
                  {/* Dashed connector growing downwards from path to card head */}
                  <div className="absolute top-0 h-[25px] w-0.5 overflow-hidden">
                    <motion.div style={{ height: connector2Progress }} className="w-full bg-gradient-to-b from-[#ff6e50] to-transparent border-r border-dashed border-[#ff6e50]/40" />
                  </div>
                  <div className="w-[280px] border border-white/5 bg-neutral-900/60 backdrop-blur-md shadow-2xl rounded-xl p-5 translate-y-[25px] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-[#ff6e50] uppercase">Step 02</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6e50] shadow-[0_0_8px_#ff6e50]" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Deposit Funds</h3>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                      Fund your wallet with fiat or crypto in a single click, powered by gasless transactions and instant bridging.
                    </p>
                  </div>
                </motion.div>

                {/* Step 03 Card Group (X: 62.5%, Y: 28.57%, Card positioned above path) */}
                <motion.div
                  style={{ left: "62.5%", top: "28.57%", opacity: card3Opacity, y: card3YOffset }}
                  className="absolute z-30 flex flex-col items-center"
                >
                  <div className="w-[280px] border border-white/5 bg-neutral-900/60 backdrop-blur-md shadow-2xl rounded-xl p-5 translate-y-[-105%] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-[#ff6e50] uppercase">Step 03</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6e50] shadow-[0_0_8px_#ff6e50]" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Set AI Agent</h3>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                      Choose your trading goals and risk parameters. Your autonomous AI agent begins analyzing market opportunities 24/7.
                    </p>
                  </div>
                  {/* Dashed connector growing downwards from card base to path */}
                  <div className="absolute top-[-25px] bottom-0 w-0.5 overflow-hidden flex flex-col justify-end">
                    <motion.div style={{ height: connector3Progress }} className="w-full bg-gradient-to-t from-[#ff6e50] to-transparent border-r border-dashed border-[#ff6e50]/40" />
                  </div>
                  {/* Waypoint point */}
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-40 translate-y-[-50%]" />
                </motion.div>

                {/* Step 04 Card Group (X: 81.94%, Y: 71.43%, Card positioned below path) */}
                <motion.div
                  style={{ left: "81.94%", top: "71.43%", opacity: card4Opacity, y: card4YOffset }}
                  className="absolute z-30 flex flex-col items-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-[#ff6e50]/80 shadow-[0_0_6px_rgba(255,110,80,0.5)] z-40 translate-y-[-50%]" />
                  {/* Dashed connector growing downwards from path to card head */}
                  <div className="absolute top-0 h-[25px] w-0.5 overflow-hidden">
                    <motion.div style={{ height: connector4Progress }} className="w-full bg-gradient-to-b from-[#ff6e50] to-transparent border-r border-dashed border-[#ff6e50]/40" />
                  </div>
                  <div className="w-[280px] border border-white/5 bg-neutral-900/60 backdrop-blur-md shadow-2xl rounded-xl p-5 translate-y-[25px] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-[#ff6e50] uppercase">Step 04</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6e50] shadow-[0_0_8px_#ff6e50]" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Unlock Growth</h3>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                      Watch your portfolio auto-adjust and execute optimized trades in real time. Total control, absolute peace of mind.
                    </p>
                  </div>
                </motion.div>

              </div>
            )}
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
