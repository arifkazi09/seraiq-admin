'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface User {
  id: string; phone: string; name: string | null; email: string | null;
  role: string; profile_complete: boolean; created_at: string;
}

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 20, search } });
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="text-white/40 text-sm mt-0.5">{total.toLocaleString('en-IN')} total</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, phone..."
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold w-64"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {['Name', 'Phone', 'Email', 'Role', 'Profile', 'Joined'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-white/30">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-white/30">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{u.name ?? '—'}</td>
                <td className="px-4 py-3 text-white/60 font-mono text-xs">{u.phone}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{u.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    u.role === 'admin' ? 'bg-gold/20 text-gold' :
                    u.role === 'subscriber' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-white/10 text-white/50'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.profile_complete ? 'text-green-400' : 'text-white/30'}`}>
                    {u.profile_complete ? '✓ Complete' : 'Incomplete'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/6">
            <p className="text-white/30 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
