'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error ?? 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      const { token, user } = res.data.data;
      if (user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        return;
      }
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error ?? 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-dark">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96C)' }}>
            <span className="text-navy font-black text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-black text-white">SERAIQ Admin</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your admin account</p>
        </div>

        <div className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <>
              <div>
                <label className="text-white/60 text-xs font-medium block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm"
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={loading || !phone}
                className="w-full py-3 rounded-xl font-bold text-navy text-sm disabled:opacity-50 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96C)' }}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-white/60 text-xs font-medium block mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm tracking-widest text-center text-lg"
                />
                <p className="text-white/40 text-xs mt-2 text-center">Sent to {phone}</p>
              </div>
              <button
                onClick={verifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl font-bold text-navy text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96C)' }}
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
              <button
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full py-2 text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                ← Change number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
