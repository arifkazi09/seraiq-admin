'use client';

import { useEffect, useState } from 'react';
import { IndianRupee, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import api from '@/lib/api';

interface SalonEarning {
  salon_id: string;
  salon_name: string;
  city: string;
  visit_fee: number;
  no_show_fee: number;
  late_cancel_fee: number;
  total: number;
  paid_out: boolean;
}

interface EarningsData {
  earnings: SalonEarning[];
  month: number;
  year: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function EarningsPage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData]   = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = (y: number, m: number) => {
    setLoading(true);
    api.get('/admin/earnings', { params: { year: y, month: m } })
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(year, month); }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    // Don't go beyond current month
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const grandTotal = data?.earnings.reduce((s, e) => s + e.total, 0) ?? 0;
  const totalVisitFees = data?.earnings.reduce((s, e) => s + e.visit_fee, 0) ?? 0;
  const totalNoShowFees = data?.earnings.reduce((s, e) => s + e.no_show_fee + e.late_cancel_fee, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Salon Earnings</h1>
          <p className="text-white/40 text-sm mt-1">Per-salon breakdown — payable on 1st of next month</p>
        </div>

        {/* Month picker */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth}
            className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="px-4 py-2 rounded-xl border border-white/10 text-white text-sm font-semibold min-w-[140px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="text-white/40 text-xs">Total Owed to Salons</p>
              <p className="text-xl font-black text-white">₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-white/40 text-xs mb-1">Visit Fees</p>
          <p className="text-xl font-black text-white">₹{totalVisitFees.toLocaleString('en-IN')}</p>
          <p className="text-white/30 text-[10px] mt-1">From QR scan check-ins</p>
        </div>
        <div className="card p-5">
          <p className="text-white/40 text-xs mb-1">No-Show + Late-Cancel Fees</p>
          <p className="text-xl font-black text-white">₹{totalNoShowFees.toLocaleString('en-IN')}</p>
          <p className="text-white/30 text-[10px] mt-1">Penalty fees to salons</p>
        </div>
      </div>

      {/* Earnings table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : !data || data.earnings.length === 0 ? (
        <div className="card p-12 text-center">
          <Store size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">No earnings recorded for {MONTH_NAMES[month - 1]} {year}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold">Salon</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold">City</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-semibold">Visit Fees</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-semibold">No-Show</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-semibold">Late-Cancel</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-semibold">Total</th>
                <th className="text-center px-4 py-3 text-white/40 text-xs font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.earnings.map((e) => (
                <tr key={e.salon_id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{e.salon_name}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{e.city}</td>
                  <td className="px-4 py-3 text-right text-white/70 font-mono text-xs">
                    {e.visit_fee > 0 ? `₹${e.visit_fee.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-white/70 font-mono text-xs">
                    {e.no_show_fee > 0 ? `₹${e.no_show_fee.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-white/70 font-mono text-xs">
                    {e.late_cancel_fee > 0 ? `₹${e.late_cancel_fee.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-white">
                    ₹{e.total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.paid_out
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {e.paid_out ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Grand total row */}
            <tfoot>
              <tr className="border-t border-white/10 bg-white/3">
                <td colSpan={5} className="px-4 py-3 text-white/50 text-xs font-semibold">
                  Grand Total — {data.earnings.length} salon{data.earnings.length !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-right font-black text-gold text-base">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Payment note */}
      <div className="card p-4 border border-white/5">
        <p className="text-white/40 text-xs font-semibold mb-1 uppercase tracking-wider">Payment Schedule</p>
        <p className="text-white/25 text-xs">
          SERAIQ pays salons on the 1st of every month for the previous month&apos;s earnings.
          Platform fee deducted for salons with 30+ visits/month (Founding Partners: waived Year 1).
          TDS at 5% for annual payments exceeding Rs 15,000 (Section 9.2).
        </p>
      </div>
    </div>
  );
}
