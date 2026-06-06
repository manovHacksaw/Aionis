// src/app/(app)/dashboard/page.tsx
'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';

const MOCK_STATS = [
  { label: 'aUSD Locked',      value: '700.00',  suffix: 'aUSD' },
  { label: 'Unrealized P&L',   value: '+47.20',  suffix: 'aUSD', positive: true  },
  { label: 'Active Vaults',    value: '2',        suffix: ''     },
];

const MOCK_ACTIVITY = [
  { type: 'Position Opened', leader: '0xAb58…eC9B', token: 'WSOMI', amount: '120.00', time: '2m ago',  sign: null    },
  { type: 'Position Closed', leader: '0xCA35…733c', token: 'WSOMI', amount: '+18.40', time: '1h ago',  sign: 'profit' },
  { type: 'Vault Created',   leader: '0xAb58…eC9B', token: '—',     amount: '500.00', time: '3h ago',  sign: null    },
  { type: 'Position Opened', leader: '0xCA35…733c', token: 'WSOMI', amount: '200.00', time: '5h ago',  sign: null    },
  { type: 'Position Closed', leader: '0xCA35…733c', token: 'WSOMI', amount: '-12.10', time: '8h ago',  sign: 'loss'  },
];

const fade: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-16 py-12 max-w-5xl mx-auto w-full font-sans select-none">

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <h1 className="text-[28px] font-light tracking-[-0.04em] text-white mb-1">Dashboard</h1>
        <p className="text-[14px] text-neutral-400 font-normal">Your copy-trading activity at a glance.</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        {MOCK_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={fade}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 py-5"
          >
            <p className="text-[12px] text-neutral-500 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-2xl font-light tracking-tight ${s.positive ? 'text-emerald-400' : 'text-white'}`}>
              {s.value}
              {s.suffix && <span className="text-[14px] text-neutral-500 ml-1">{s.suffix}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-12">
        <h2 className="text-[14px] text-neutral-400 uppercase tracking-widest mb-6">Recent Activity</h2>

        <div className="flex flex-col gap-1">
          {MOCK_ACTIVITY.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fade}
              initial="hidden"
              animate="show"
              className="flex items-center justify-between rounded-xl px-5 py-4 border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Dot indicator */}
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  item.sign === 'profit' ? 'bg-emerald-400' :
                  item.sign === 'loss'   ? 'bg-red-400'     : 'bg-white/20'
                }`} />
                <div>
                  <p className="text-[14px] text-white/90 font-normal">{item.type}</p>
                  <p className="text-[12px] text-neutral-500 mt-0.5">
                    {item.leader}{item.token !== '—' ? ` · ${item.token}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[14px] font-normal tabular-nums ${
                  item.sign === 'profit' ? 'text-emerald-400' :
                  item.sign === 'loss'   ? 'text-red-400'     : 'text-white/70'
                }`}>
                  {item.amount} {item.token !== '—' ? 'aUSD' : 'aUSD'}
                </p>
                <p className="text-[12px] text-neutral-600 mt-0.5">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-12 flex items-center gap-6">
        <Link href="/traders" className="text-[14px] text-neutral-400 hover:text-white transition-colors duration-300 tracking-wide">
          Browse Traders →
        </Link>
        <Link href="/portfolio" className="text-[14px] text-neutral-400 hover:text-white transition-colors duration-300 tracking-wide">
          View Portfolio →
        </Link>
      </div>

    </div>
  );
}
