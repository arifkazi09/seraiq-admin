'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Lead {
  id: string; salon_name: string; owner_name: string; phone: string;
  city: string; address: string | null; status: string; created_at: string;
  reviewed_at: string | null; reviewed_by: string | null; notes: string | null;
}

const STATUS_TABS = ['pending', 'approved', 'rejected'];

export default function LeadsPage() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [tab, setTab]           = useState('pending');
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/leads', { params: { status: tab, page, limit: 20 } });
      setLeads(res.data.data.leads);
      setTotal(res.data.data.total);
    } finally { setLoading(false); }
  }, [tab, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const approve = async (id: string) => {
    setActing(id);
    try {
      await api.post(`/admin/leads/${id}/approve`);
      fetchLeads();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed to approve.');
    } finally { setActing(null); }
  };

  const reject = async () => {
    if (!rejectId) return;
    setActing(rejectId);
    try {
      await api.post(`/admin/leads/${rejectId}/reject`, { notes: rejectNote });
      setRejectId(null);
      setRejectNote('');
      fetchLeads();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Failed to reject.');
    } finally { setActing(null); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Salon Leads</h1>
        <p className="text-white/40 text-sm mt-0.5">Partner applications from the website</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => { setTab(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              tab === s
                ? 'text-navy'
                : 'text-white/40 border border-white/10 hover:text-white'
            }`}
            style={tab === s ? { background: 'linear-gradient(135deg, #C9A84C, #E8C96C)' } : {}}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {['Salon', 'Owner', 'Phone', 'City', 'Applied', 'Status', tab === 'pending' ? 'Actions' : 'Reviewed'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30">No {tab} leads</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium text-xs">{lead.salon_name}</td>
                <td className="px-4 py-3 text-white/70 text-xs">{lead.owner_name}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{lead.phone}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{lead.city}</td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    lead.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    lead.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {tab === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approve(lead.id)}
                        disabled={acting === lead.id}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-semibold disabled:opacity-40 transition-all"
                      >
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectId(lead.id); setRejectNote(''); }}
                        disabled={acting === lead.id}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold disabled:opacity-40 transition-all"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-white/30 text-xs">
                      {lead.reviewed_by ?? '—'}{lead.reviewed_at ? ` · ${new Date(lead.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                    </span>
                  )}
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

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-white font-black text-lg mb-2">Reject Application</h3>
            <p className="text-white/40 text-sm mb-4">Add an optional note (internal only).</p>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder-white/20 resize-none outline-none focus:border-white/20"
              rows={3}
              placeholder="Reason for rejection..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={reject}
                disabled={acting !== null}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/30 disabled:opacity-40 transition-all"
              >
                {acting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setRejectId(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 font-bold text-sm hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
