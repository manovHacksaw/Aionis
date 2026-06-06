// src/app/(app)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Tab = 'overview' | 'performance' | 'trades' | 'analytics';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [allocation, setAllocation] = useState<number>(65);
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  // SVG Chart path generator for Growth and Benchmark
  const generateGrowthPath = () => {
    return "M 0 350 Q 100 280 200 320 T 400 180 T 600 120 T 800 60 T 1000 40";
  };

  const generateAreaPath = () => {
    return `${generateGrowthPath()} L 1000 450 L 0 450 Z`;
  };

  const generateBenchmarkPath = () => {
    return "M 0 350 Q 100 320 200 340 T 400 280 T 600 260 T 800 210 T 1000 180";
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 py-8 select-none font-sans">
      
      {/* 12-Column Grid Layout: Max Width 1500px, Centered, Gap 24px */}
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT MAIN AREA: 9 COLUMNS ================= */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Hero Dashboard Card */}
          <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,120,80,0.05)]">
            
            {/* Cinematic subtle orange glow in background */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header: Selected Trader Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06] relative z-10">
              <div className="flex items-center gap-4">
                {/* Trader Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff7850] to-[#d97706] flex items-center justify-center text-black text-2xl font-bold shadow-[0_4px_20px_rgba(255,120,80,0.3)]">
                  Æ
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Selected Trader</div>
                  <h2 className="text-xl font-medium tracking-tight text-white/95">Aetherius Trading</h2>
                </div>
              </div>

              {/* Quick Trader Performance Stats */}
              <div className="flex gap-8">
                <div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-0.5">Win Rate</span>
                  <span className="text-base font-semibold text-[#22c55e]">78.4%</span>
                </div>
                <div className="border-l border-white/[0.08] pl-6">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-0.5">Total ROI</span>
                  <span className="text-base font-semibold text-[#ff7850]">+142.8%</span>
                </div>
                <div className="border-l border-white/[0.08] pl-6">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-0.5">Followers</span>
                  <span className="text-base font-semibold text-white/90">2,408</span>
                </div>
                <div className="border-l border-white/[0.08] pl-6">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-0.5">AUM</span>
                  <span className="text-base font-semibold text-white/90">$4.2M</span>
                </div>
              </div>
            </div>

            {/* Metrics Row (4 Sub-cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 relative z-10">
              {/* Card 1 */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 transition-all duration-300 hover:border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-1">Total Capital Following</span>
                <span className="text-lg font-mono font-medium text-white">$1,248,500</span>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 transition-all duration-300 hover:border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-1">Total Profit</span>
                <span className="text-lg font-mono font-medium text-[#22c55e]">+$324,190</span>
              </div>

              {/* Card 3 */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 transition-all duration-300 hover:border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-1">Monthly Return</span>
                <span className="text-lg font-mono font-medium text-[#ff7850]">+18.4%</span>
              </div>

              {/* Card 4 */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 transition-all duration-300 hover:border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-white/30 block mb-1">Risk Score</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-lg font-mono font-medium text-white">3</span>
                  <span className="text-xs text-white/30">/ 5</span>
                  <div className="flex gap-1 ml-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`w-1 h-3 rounded-full ${s <= 3 ? 'bg-[#ff7850]' : 'bg-white/15'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Tabs Section */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-px">
            {(['overview', 'performance', 'trades', 'analytics'] as Tab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 -mb-px text-xs font-semibold tracking-wide capitalize transition-all duration-300 border border-transparent cursor-pointer rounded-t-lg select-none ${
                    isActive
                      ? 'bg-[#ff7850]/15 border-[#ff7850]/40 text-[#ff7850] shadow-[0_-4px_20px_rgba(255,120,80,0.05)]'
                      : 'text-white/40 hover:text-white/70 hover:border-white/5'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* ================= TAB CONTENTS ================= */}
          <div className="min-h-[400px]">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* 4 Equal Trader Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Portfolio Allocation */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(255,120,80,0.06)] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Portfolio Allocation</h4>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-white/75">WSOMI</span>
                          <span className="font-semibold text-white/90">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/75">USDC.e</span>
                          <span className="font-semibold text-white/90">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/75">WETH</span>
                          <span className="font-semibold text-white/90">15%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex">
                      <div className="bg-[#ff7850] h-full" style={{ width: '45%' }} />
                      <div className="bg-amber-500 h-full" style={{ width: '30%' }} />
                      <div className="bg-white/40 h-full flex-1" />
                    </div>
                  </div>

                  {/* Card 2: Active Strategies */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(255,120,80,0.06)] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Active Strategies</h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7850]" />
                          <span className="text-white/80">Momentum Copying</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="text-white/80">Mean Reversion Vault</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span className="text-white/80">Breakout Trigger</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-white/30 uppercase tracking-wide">3 Active Execution models</span>
                  </div>

                  {/* Card 3: Current Positions */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(255,120,80,0.06)] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Current Positions</h4>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-white/80">WSOMI Long</span>
                          <span className="text-[#22c55e] font-semibold">+$2,480</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">WETH Long</span>
                          <span className="text-[#ef4444] font-semibold">-$410</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/40 flex justify-between">
                      <span>Leverage: 1x</span>
                      <span className="text-[#22c55e]">+8.2% Net P&L</span>
                    </div>
                  </div>

                  {/* Card 4: Trade Frequency */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(255,120,80,0.06)] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Trade Frequency</h4>
                      <div className="space-y-1 mt-1">
                        <span className="text-2xl font-mono font-medium text-white">14</span>
                        <span className="text-xs text-white/40 ml-1.5">trades / week</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-white/30 uppercase tracking-wide">Hold Duration: 3.2d Avg</span>
                  </div>
                </div>

                {/* Sub-block description placeholder */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-6 text-sm text-white/60 leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7850]/5 rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-white font-medium text-base mb-2">Overview Summary</h3>
                  Aetherius Trading is currently running dynamic momentum triggers on QuickSwap, matching WSOMI, USDC.e, and gasless smart transactions. By following this vault, your smart wallet copies executed trades directly through Somnia's ultra-low-latency executor client.
                </div>
              </motion.div>
            )}

            {/* 2. PERFORMANCE TAB (The main centerpiece SVG line chart) */}
            {activeTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-6 space-y-6 shadow-2xl relative"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff7850]/5 rounded-full blur-[120px] pointer-events-none" />
                
                {/* Chart Header */}
                <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
                  <div>
                    <h3 className="text-base font-semibold text-white/95">Performance Chart</h3>
                    <p className="text-xs text-white/40">Portfolio growth of Aetherius Trading vs QuickSwap benchmark</p>
                  </div>

                  <div className="flex items-center gap-5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-[#ff7850]" />
                      <span className="text-white/85">Aetherius Portfolio Growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 border-t border-dashed border-white/40" />
                      <span className="text-white/40">Benchmark Return</span>
                    </div>
                  </div>
                </div>

                {/* SVG Centered line chart: Height 450px */}
                <div className="relative w-full h-[420px] pt-6 z-10">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                    {[1, 2, 3, 4, 5].map((g) => (
                      <div key={g} className="w-full h-px bg-white" />
                    ))}
                  </div>

                  {/* SVG paths wrapper */}
                  <svg viewBox="0 0 1000 450" className="absolute inset-0 w-full h-full text-[#ff7850]/5" preserveAspectRatio="none">
                    {/* Growth Area background gradient glow */}
                    <path d={generateAreaPath()} fill="currentColor" />
                  </svg>

                  <svg viewBox="0 0 1000 450" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    {/* Benchmark path */}
                    <path
                      d={generateBenchmarkPath()}
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />

                    {/* Growth path */}
                    <path
                      d={generateGrowthPath()}
                      fill="none"
                      stroke="#ff7850"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_12px_rgba(255,120,80,0.5)]"
                    />
                  </svg>
                </div>

                {/* X Axis Ticks */}
                <div className="flex justify-between items-center text-[9px] font-mono text-white/30 px-2 pt-1 border-t border-white/[0.05]">
                  <span>Feb 17</span>
                  <span>Mar 03</span>
                  <span>Mar 17</span>
                  <span>Mar 31</span>
                  <span>Apr 14</span>
                  <span>Apr 28</span>
                  <span>May 12</span>
                </div>
              </motion.div>
            )}

            {/* 3. TRADES TAB */}
            {activeTab === 'trades' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-6 space-y-4"
              >
                <h3 className="text-base font-semibold text-white/95">Recent Copy Trades</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-white/30 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Token</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Value (USDC)</th>
                        <th className="py-3 px-4 text-right">Profit / Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] font-mono">
                      {[
                        { date: '2026-06-06 14:23', action: 'BUY', token: 'WSOMI', price: '$0.8250', value: '450.00', pnl: '—' },
                        { date: '2026-06-05 09:12', action: 'SELL', token: 'WETH', price: '$3,184.20', value: '1,200.00', pnl: '+$84.50', pos: true },
                        { date: '2026-06-04 18:02', action: 'BUY', token: 'USDC.e', price: '$1.0002', value: '3,000.00', pnl: '—' },
                        { date: '2026-06-02 11:45', action: 'SELL', token: 'WBTC', price: '$98,420.00', value: '850.00', pnl: '-$12.30', pos: false },
                      ].map((tx, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 px-4 text-white/60">{tx.date}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.action === 'BUY' ? 'bg-[#ff7850]/15 text-[#ff7850]' : 'bg-white/10 text-white/80'
                            }`}>
                              {tx.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-white/95 font-sans font-semibold">{tx.token}</td>
                          <td className="py-3.5 px-4 text-white/80">{tx.price}</td>
                          <td className="py-3.5 px-4 text-right text-white/80">${tx.value}</td>
                          <td className={`py-3.5 px-4 text-right ${
                            tx.pos === true ? 'text-[#22c55e]' : tx.pos === false ? 'text-[#ef4444]' : 'text-white/40'
                          }`}>
                            {tx.pnl}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* 4. ANALYTICS TAB (2-Column details) */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Left side: Historical performance table */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-6 space-y-4">
                  <h3 className="text-base font-semibold text-white/95">Historical Monthly Performance</h3>
                  
                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { period: 'May 2026', trades: 58, volume: '$124.5k', return: '+18.4%', pos: true },
                      { period: 'Apr 2026', trades: 64, volume: '$180.2k', return: '+22.1%', pos: true },
                      { period: 'Mar 2026', trades: 42, volume: '$98.0k', return: '-4.8%', pos: false },
                      { period: 'Feb 2026', trades: 51, volume: '$110.4k', return: '+12.9%', pos: true },
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                        <span className="text-white/80 font-sans">{row.period}</span>
                        <div className="flex gap-6">
                          <span className="text-white/40">{row.trades} trades</span>
                          <span className="text-white/60">{row.volume} vol</span>
                          <span className={`font-semibold min-w-[50px] text-right ${row.pos ? 'text-[#ff7850]' : 'text-[#ef4444]'}`}>
                            {row.return}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Win/Loss breakdown & Risk metrics */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-6 space-y-6">
                  <h3 className="text-base font-semibold text-white/95">Risk & Efficiency Metrics</h3>
                  
                  {/* Gauge indicator: Win/Loss Ratio */}
                  <div className="flex items-center justify-between gap-6 pb-4 border-b border-white/[0.04]">
                    <div>
                      <span className="text-xs text-white/50 block mb-0.5">Win / Loss Breakdown</span>
                      <span className="text-xl font-mono font-medium text-[#ff7850]">78.4% Wins</span>
                      <span className="text-[10px] text-white/30 block mt-1">Total: 215 winning trades / 59 losing</span>
                    </div>

                    {/* Circle SVG Gauge */}
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                        <circle cx="32" cy="32" r="26" stroke="#ff7850" strokeWidth="4" fill="transparent" strokeDasharray="163" strokeDashoffset="35" />
                      </svg>
                      <span className="absolute text-[10px] font-semibold text-white/90">78%</span>
                    </div>
                  </div>

                  {/* List of risk factors */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Sharpe Ratio</span>
                      <span className="text-base font-semibold text-white/90">2.84</span>
                      <span className="text-[9px] text-[#22c55e] block mt-0.5">High efficiency</span>
                    </div>
                    
                    <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Max Drawdown</span>
                      <span className="text-base font-semibold text-white/90">-6.8%</span>
                      <span className="text-[9px] text-white/30 block mt-0.5">Conservative cap</span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Avg Trade Profit</span>
                      <span className="text-base font-semibold text-[#22c55e]">+$42.30</span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-3.5">
                      <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Alpha Ratio</span>
                      <span className="text-base font-semibold text-white/90">0.32</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </div>

        </div>

        {/* ================= RIGHT COLUMN: STICKY SIDEBAR (3 COLUMNS) ================= */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-[96px]">
          
          {/* Card 1: Portfolio Summary */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">Portfolio Summary</h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-white/40 font-sans">Invested Capital</span>
                <span className="text-white font-medium">5,000 aUSD</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-white/40 font-sans">Current Value</span>
                <span className="text-white font-medium">6,240 aUSD</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-white/40 font-sans">Unrealized Profit</span>
                <span className="text-[#22c55e] font-semibold">+$1,240 (24.8%)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Copy Trader Settings */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 space-y-5">
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">Copy Settings</h3>
            
            {/* Allocation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-white/50 uppercase">
                <span>Allocation</span>
                <span className="font-mono text-[#ff7850]">{allocation}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={allocation}
                onChange={(e) => setAllocation(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff7850]"
              />
              <span className="text-[9px] text-white/30 block">Target percentage of vault capital following</span>
            </div>

            {/* Risk Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-white/50 uppercase block">Risk Level</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const isSelected = riskLevel === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRiskLevel(idx)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff7850]/20 border-[#ff7850]/40 text-[#ff7850]'
                          : 'bg-white/[0.02] border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {idx}
                    </button>
                  );
                })}
              </div>
              <span className="text-[9px] text-white/30 block">Higher risk expands order size thresholds</span>
            </div>

          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-[20px] p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">Quick Actions</h3>
            
            {/* Primary Action: Start Copying (orange-to-red gradient CTA) */}
            <button
              type="button"
              onClick={() => setIsCopying(!isCopying)}
              className={`w-full font-medium text-xs rounded-full py-3 transition-all duration-300 cursor-pointer text-center ${
                isCopying
                  ? 'bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/40'
                  : 'bg-gradient-to-r from-[#ff7850] to-[#d97706] text-white shadow-[0_4px_20px_rgba(255,120,80,0.2)] hover:opacity-95'
              }`}
            >
              {isCopying ? 'Stop Copying Trader' : 'Start Copying'}
            </button>

            {/* Secondary CTA: Deposit */}
            <button
              type="button"
              className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white font-medium text-xs rounded-full py-2.5 transition-all cursor-pointer"
            >
              Deposit Funds
            </button>

            {/* Secondary CTA: Withdraw */}
            <button
              type="button"
              className="w-full bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-xs rounded-full py-2.5 cursor-pointer"
            >
              Withdraw
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
