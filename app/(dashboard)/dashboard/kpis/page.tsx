'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Star, QrCode, AlertTriangle, IndianRupee, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface KpiData {
  newSubsWeek: number;
  churnRate: number;
  avgRating: number;
  qrCheckinRate: number;
  priorityBlocked: number;
  noShowFeesThisMonth: number;
  targets: {
    newSubsWeek: number;
    churnRate: number;
    avgRating: number;
    qrCheckinRate: number;
  };
}

function KpiCard({
  label,
  value,
  target,
  targetLabel,
  higherIsBetter,
  icon,
  format,
  note,
}: {
  label: string;
  value: number;
  target: number;
  targetLabel: string;
  higherIsBetter: boolean;
  icon: React.ReactNode;
  format: (v: number) => string;
  note?: string;
}) {
  const onTarget = higherIsBetter ? value >= target : value <= target;
  const pct = target > 0 ? Math.min(Math.round((value / target) * 100), 999) : 0;

  return (
    <div
      className="card p-5 border"
      style={{ borderColor: onTarget ? 'rgba(22,101,52,0.5)' : 'rgba(153,27,27,0.4)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: onTarget ? 'rgba(22,101,52,0.15)' : 'rgba(153,27,27,0.15)',
            color: onTarget ? '#4ADE80' : '#F87171',
          }}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          {onTarget ? (
            <TrendingUp size={14} className="text-green-400" />
          ) : (
            <TrendingDown size={14} className="text-red-400" />
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: onTarget ? 'rgba(22,101,52,0.2)' : 'rgba(153,27,27,0.2)',
              color: onTarget ? '#4ADE80' : '#F87171',
            }}
          >
            {onTarget ? 'ON TARGET' : 'BELOW TARGET'}
          </span>
        </div>
      </div>

      <p className="text-3xl font-black text-white mb-1">{format(value)}</p>
      <p className="text-white/50 text-sm font-medium mb-3">{label}</p>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: onTarget
              ? 'linear-gradient(90deg, #166534, #4ADE80)'
              : 'linear-gradient(90deg, #991B1B, #F87171)',
          }}
        />
      </div>
      <p className="text-white/30 text-xs">Target: {targetLabel}</p>
      {note && <p className="text-white/20 text-[10px] mt-1">{note}</p>}
    </div>
  );
}

export default function KpisPage() {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/kpis')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-white/40 text-center py-16">Failed to load KPI data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">KPI Health</h1>
          <p className="text-white/40 text-sm mt-1">Section 16.1 — Platform performance targets</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="New Subscribers This Week"
          value={data.newSubsWeek}
          target={data.targets.newSubsWeek}
          targetLabel="40+ per week"
          higherIsBetter={true}
          icon={<Users size={20} />}
          format={(v) => v.toLocaleString('en-IN')}
        />
        <KpiCard
          label="Monthly Churn Rate"
          value={data.churnRate}
          target={data.targets.churnRate}
          targetLabel="Below 10% (aim 7%)"
          higherIsBetter={false}
          icon={<TrendingDown size={20} />}
          format={(v) => `${v}%`}
          note="Cancelled this month / (active + cancelled)"
        />
        <KpiCard
          label="Average Subscriber Rating"
          value={data.avgRating}
          target={data.targets.avgRating}
          targetLabel="Above 4.2 / 5"
          higherIsBetter={true}
          icon={<Star size={20} />}
          format={(v) => `${v} ★`}
        />
        <KpiCard
          label="QR Check-in Rate"
          value={data.qrCheckinRate}
          target={data.targets.qrCheckinRate}
          targetLabel="Above 95%"
          higherIsBetter={true}
          icon={<QrCode size={20} />}
          format={(v) => `${v}%`}
          note="Completed / (confirmed + completed) bookings this month"
        />
      </div>

      {/* Supplementary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority blocked */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{data.priorityBlocked.toLocaleString('en-IN')}</p>
              <p className="text-white/40 text-xs">Priority-Blocked Subscribers</p>
            </div>
          </div>
          <p className="text-white/30 text-xs">
            Subscribers with 3+ no-shows in 3 months. Go to <strong className="text-white/50">No-Shows</strong> to review and unblock.
          </p>
        </div>

        {/* No-show fees */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                ₹{data.noShowFeesThisMonth.toLocaleString('en-IN')}
              </p>
              <p className="text-white/40 text-xs">No-Show + Late-Cancel Fees This Month</p>
            </div>
          </div>
          <p className="text-white/30 text-xs">
            Fees earned by salons from subscriber no-shows and late cancellations. See breakdown in <strong className="text-white/50">Earnings</strong>.
          </p>
        </div>
      </div>

      {/* Pending KPIs note */}
      <div className="card p-5 border border-white/5">
        <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Coming in future release</p>
        <div className="grid grid-cols-2 gap-2 text-white/25 text-xs">
          <span>• StylePro Month 2 conversion rate (target 65%+)</span>
          <span>• UPI AutoPay adoption rate (target 70%+)</span>
          <span>• Active salons with 1+ QR scan/month (target 100%)</span>
          <span>• Avg booking lead time</span>
        </div>
      </div>
    </div>
  );
}
