'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, CreditCard, Store, Star, LogOut } from 'lucide-react';

const NAV = [
  { href: '/dashboard',              icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { href: '/dashboard/users',        icon: <Users size={18} />,           label: 'Users' },
  { href: '/dashboard/bookings',     icon: <CalendarCheck size={18} />,   label: 'Bookings' },
  { href: '/dashboard/subscriptions',icon: <CreditCard size={18} />,      label: 'Subscriptions' },
  { href: '/dashboard/salons',       icon: <Store size={18} />,           label: 'Salons' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 flex flex-col z-30" style={{ background: '#0a0a1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96C)' }}>
            <span className="text-navy font-black text-sm">S</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">SERAIQ</p>
            <p className="text-white/30 text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-navy font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #C9A84C, #E8C96C)' } : {}}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
