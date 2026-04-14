'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Sub {
  id: string; plan_type: string; plan_price: number; status: string;
  current_period_end: string | null; services_used_this_month: number;
  services_limit: number; created_at: string;
  users: { name: string | null; phone: string } | null;
}

const PLAN_LABEL: Record<string, string> = {
  'groom-basic':    'Groom Basic',
  'groom-plus':     'Groom Plus',
  'groom-elite':    'Groom Elite',
  'beauty-basic':   'Beauty Basic',
  'beauty-plus':    'Beauty Plus',
  'beauty-elite':   'Beauty Elite',
  'relax':          'Relax',
  'wellness-elite': 'Wellness Elite',
  'couple':         'SERAIQ Couple',
};

const PLAN_STYLE: Record<string, string> = {
  'groom-elite':    'bg-gold/20 text-gold',
  'beauty-elite':   'bg-gold/20 text-gold',
  'wellness-elite': 'bg-gold/20 text-gold',
  'couple':         'bg-gold/20 text-gold',
  'groom-plus':     'bg-blue-500/20 text-blue-400',
  'beauty-plus':    'bg-blue-500/20 text-blue-400',
  'groom-basic':    'bg-white/10 text-white/60',
  'beauty-basic':   'bg-white/10 text-white/60',
  'relax':          'bg-purple-500/20 text-purple-400',
};
const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  expired:   'bg-white/10 text-white/40',
  pending:   'bg-yellow-500/20 text-yellow-400',
};

export default function SubscriptionsPage() {
  const [subs, setSubs]       = useState<Sub[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscriptions', { params: { page, limit: 20 } });
      setSubs(res.data.data.subscriptions);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Subscriptions</h1>
        <p className="text-white/40 text-sm mt-0.5">{total.toLocaleString('en-IN')} total</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {['Member', 'Plan', 'Status', 'Price', 'Services Used', 'Renews', 'Started'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">Loading...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">No subscriptions found</td></tr>
            ) : subs.map((s) => (
              <tr key={s.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white font-medium text-xs">{s.users?.name ?? '—'}</p>
                  <p className="text-white/40 text-[10px] font-mono">{s.users?.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PLAN_STYLE[s.plan_type] ?? 'bg-white/10 text-white/50'}`}>
                    {PLAN_LABEL[s.plan_type] ?? s.plan_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_STYLE[s.status] ?? 'bg-white/10 text-white/50'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70 text-xs">₹{((s.plan_price ?? 0) / 100).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{s.services_used_this_month} / {s.services_limit === 999 ? '∞' : s.services_limit}</td>
                <td className="px-4 py-3 text-white/60 text-xs">
                  {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
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
