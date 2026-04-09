'use client';

import { useEffect, useState } from 'react';
import { Users, CalendarCheck, CreditCard, Store, TrendingUp, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/api';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalBookings: number;
  todayBookings: number;
  totalSalons: number;
  monthlyRevenue: number;
}

interface ChartPoint { month: string; bookings: number; subscriptions: number; }

const STAT_CARDS = (s: Stats) => [
  { label: 'Total Users',           value: s.totalUsers.toLocaleString('en-IN'),            icon: <Users size={20} />,         color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { label: 'Active Subscriptions',  value: s.activeSubscriptions.toLocaleString('en-IN'),   icon: <CreditCard size={20} />,    color: '#C9A84C', bg: 'rgba(201,168,76,0.1)'  },
  { label: 'Total Bookings',        value: s.totalBookings.toLocaleString('en-IN'),          icon: <CalendarCheck size={20} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  { label: "Today's Bookings",      value: s.todayBookings.toLocaleString('en-IN'),          icon: <TrendingUp size={20} />,    color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  { label: 'Partner Salons',        value: s.totalSalons.toLocaleString('en-IN'),            icon: <Store size={20} />,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  { label: 'Monthly Revenue',       value: `₹${s.monthlyRevenue.toLocaleString('en-IN')}`,  icon: <IndianRupee size={20} />,   color: '#EC4899', bg: 'rgba(236,72,153,0.1)'  },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 text-sm">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [chart, setChart]   = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/chart'),
    ]).then(([s, c]) => {
      setStats(s.data.data);
      setChart(c.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Overview</h1>
        <p className="text-white/40 text-sm mt-1">Platform performance at a glance</p>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_CARDS(stats).map((card, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-1">{card.value}</p>
              <p className="text-white/40 text-xs">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chart.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-bold text-white mb-6">Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chart} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="bookings"      fill="#C9A84C" radius={[4,4,0,0]} name="Bookings" />
              <Bar dataKey="subscriptions" fill="#3B82F6" radius={[4,4,0,0]} name="Subscriptions" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4 justify-end">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gold" /><span className="text-white/50 text-xs">Bookings</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500" /><span className="text-white/50 text-xs">Subscriptions</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
