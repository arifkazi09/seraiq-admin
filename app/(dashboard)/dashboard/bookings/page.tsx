'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Booking {
  id: string; booking_date: string; booking_time: string; status: string;
  service_type: string; created_at: string;
  users: { name: string | null; phone: string } | null;
  salons: { name: string } | null;
}

const STATUS_OPTS = ['', 'pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_STYLE: Record<string, string> = {
  confirmed:  'bg-blue-500/20 text-blue-400',
  completed:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
  pending:    'bg-yellow-500/20 text-yellow-400',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', { params: { page, limit: 20, status } });
      setBookings(res.data.data.bookings);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Bookings</h1>
          <p className="text-white/40 text-sm mt-0.5">{total.toLocaleString('en-IN')} total</p>
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-gold"
        >
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s} className="bg-navy">{s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {['Customer', 'Salon', 'Date', 'Time', 'Service', 'Status', 'Booked'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">No bookings found</td></tr>
            ) : bookings.map((b) => (
              <tr key={b.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white font-medium text-xs">{b.users?.name ?? '—'}</p>
                  <p className="text-white/40 text-[10px] font-mono">{b.users?.phone}</p>
                </td>
                <td className="px-4 py-3 text-white/70 text-xs">{b.salons?.name ?? '—'}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{b.booking_date}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{String(b.booking_time ?? '').slice(0,5)}</td>
                <td className="px-4 py-3 text-white/60 text-xs capitalize">{b.service_type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_STYLE[b.status] ?? 'bg-white/10 text-white/50'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/6">
            <p className="text-white/30 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
