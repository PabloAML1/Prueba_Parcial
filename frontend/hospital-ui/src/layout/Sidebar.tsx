import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  LogOut,
  CalendarCheck
} from 'lucide-react';
import { Ctx } from '../features/auth/AuthContext';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/appointments', label: 'Appointments', icon: CalendarCheck },

];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(Ctx) ?? {};

  const handleLogout = () => {
    if (!logout) return;
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen flex-col justify-between border-r border-slate-200 bg-white/90 backdrop-blur">
      <div>
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#274c77] text-lg font-semibold text-white">
            AD
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Admin</p>
            <p className="text-base font-semibold text-slate-900">Control Center</p>
          </div>
        </div>
        <nav className="px-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Areas</p>
          <ul className="mt-4 space-y-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={Boolean(end)}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-indigo-100 text-[#1a659e] shadow-sm ring-1 ring-indigo-200'
                        : 'text-slate-600 hover:bg-indigo-50/95 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  <Icon className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-[#00509d]" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-200 px-4 py-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00509d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00296b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Securely end your session when you're done.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
