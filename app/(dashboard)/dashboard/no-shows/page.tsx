'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldOff, ShieldCheck, CalendarX, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface BlockedSub {
  id: string;
  user_id: string;
  plan_type: string;
  plan_price: number;
  user: { name: string | null; phone: string } | null;
}

interface NoShowBooking {
  id: string;
  subscriber_id: string;
  salon_name: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  user: { name: string | null; phone: string } | null;
}

interface NoShowData {
  blockedSubscribers: BlockedSub[];
  recentNoShows: NoShowBooking[];
  feesThisMonth: { no_show_fee: number; late_cancel_fee: number };
}

export default function NoShowsPage() {
  const [data, setData] = useState<NoShowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/no-shows')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnblock = async (subscriptionId: string) => {
    setUnblocking(subscriptionId);
    try {
      await api.patch(`/admin/subscriptions/${subscriptionId}/unblock`);
      // Remove from blocked list optimistically
      setData(prev => prev
        ? { ...prev, blockedSubscribers: prev.blockedSubscribers.filter(s => s.id !== subscriptionId) }
        : prev
      );
    } catch {
      // reload on error
      load();
    } finally {
      setUnblocking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-white/40 text-center py-16">Failed to load no-show data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">No-Shows</h1>
          <p className="text-white/40 text-sm mt-1">Blocked subscribers and recent incidents</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Fee summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-white/40 text-xs mb-1">Blocked Subscribers</p>
          <p className="text-2xl font-black text-amber-400">{data.blockedSubscribers.length}</p>
          <p className="text-white/30 text-[10px] mt-1">3+ no-shows in 3 months</p>
        </div>
        <div className="card p-4">
          <p className="text-white/40 text-xs mb-1">No-Show Fees This Month</p>
          <p className="text-2xl font-black text-white">₹{data.feesThisMonth.no_show_fee.toLocaleString('en-IN')}</p>
          <p className="text-white/30 text-[10px] mt-1">100% to salon</p>
        </div>
        <div className="card p-4">
          <p className="text-white/40 text-xs mb-1">Late-Cancel Fees This Month</p>
          <p className="text-2xl font-black text-white">₹{data.feesThisMonth.late_cancel_fee.toLocaleString('en-IN')}</p>
          <p className="text-white/30 text-[10px] mt-1">50% to salon</p>
        </div>
      </div>

      {/* Blocked subscribers */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <ShieldOff size={16} className="text-amber-400" />
          Priority-Blocked Subscribers
          {data.blockedSubscribers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
              {data.blockedSubscribers.length}
            </span>
          )}
        </h2>

        {data.blockedSubscribers.length === 0 ? (
          <div className="card p-8 text-center">
            <ShieldCheck size={32} className="mx-auto mb-3 text-green-400/50" />
            <p className="text-white/40 text-sm">No blocked subscribers — great!</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['Subscriber', 'Phone', 'Plan', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.blockedSubscribers.map(sub => (
                  <tr key={sub.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                        <span className="text-white font-medium">{sub.user?.name ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50 font-mono text-xs">{sub.user?.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/10 text-gold capitalize">
                        {sub.plan_type.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnblock(sub.id)}
                        disabled={unblocking === sub.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: 'rgba(22,101,52,0.15)',
                          color: '#4ADE80',
                          border: '1px solid rgba(22,101,52,0.3)',
                        }}
                      >
                        <ShieldCheck size={12} />
                        {unblocking === sub.id ? 'Unblocking...' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent no-show incidents */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <CalendarX size={16} className="text-red-400" />
          Recent No-Shows (Last 30 Days)
        </h2>

        {data.recentNoShows.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-white/40 text-sm">No no-shows in the last 30 days</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['Subscriber', 'Phone', 'Salon', 'Date', 'Services'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentNoShows.map(b => (
                  <tr key={b.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{b.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-white/50 font-mono text-xs">{b.user?.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-white/70 text-xs">{b.salon_name}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {b.booking_time && (
                        <span className="ml-1 text-white/30">{b.booking_time.slice(0, 5)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs max-w-[180px] truncate">{b.service_type ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Policy note */}
      <div className="card p-4 border border-white/5">
        <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Section 9.6 — No-Show Policy</p>
        <div className="space-y-1 text-white/25 text-xs">
          <p>• No-show (no cancellation): visit USED, 100% of visit fee to salon</p>
          <p>• Cancel within 4 hours: visit USED, 50% of visit fee to salon</p>
          <p>• Cancel 4+ hours before: visit restored, Rs 0 to salon</p>
          <p>• 3+ no-shows in 3 months: subscriber loses priority booking privilege (blocked above)</p>
        </div>
      </div>
    </div>
  );
}
