'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '@/lib/api';

interface Salon {
  id: string; name: string; city: string | null; address: string | null;
  rating: number | null; is_active: boolean; created_at: string;
}

export default function SalonsPage() {
  const [salons, setSalons]   = useState<Salon[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/salons', { params: { page, limit: 20 } });
      setSalons(res.data.data.salons);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Salons</h1>
        <p className="text-white/40 text-sm mt-0.5">{total.toLocaleString('en-IN')} partner salons</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {['Salon Name', 'City', 'Address', 'Rating', 'Status', 'Joined'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-white/30">Loading...</td></tr>
            ) : salons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-white/30">No salons found</td></tr>
            ) : salons.map((s) => (
              <tr key={s.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium text-xs">{s.name}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{s.city ?? '—'}</td>
                <td className="px-4 py-3 text-white/40 text-xs max-w-[180px] truncate">{s.address ?? '—'}</td>
                <td className="px-4 py-3">
                  {s.rating ? (
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-gold text-gold" />
                      <span className="text-white/70 text-xs">{s.rating.toFixed(1)}</span>
                    </div>
                  ) : <span className="text-white/30 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
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
