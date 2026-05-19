import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Home, Grid, CalendarDays, User, LogIn, LogOut } from 'lucide-react';

const nav = [
  { label: 'Home', to: '/' , icon: Home},
  { label: 'Spaces', to: '/spaces', icon: Grid},
  { label: 'Dashboard', to: '/dashboard', icon: CalendarDays, auth: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="bg-[#1a2744] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="font-semibold text-xl tracking-tight">FL Smartech Spaces</Link>
          <nav className="hidden items-center gap-4 md:flex">
            {nav.map((item) => {
              if (item.auth && !user) return null;
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${isActive ? 'bg-[#c9a84c]/20 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline-block text-sm text-slate-200">{user.name || user.email}</span>
                <button className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744]" onClick={logout}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744]">
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Outlet />
      </main>
      <footer className="bg-[#1a2744] text-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <p className="text-sm">KP Tower, No. 19/35, Mount Road, Little Mount, Chennai - 600015</p>
          <p className="text-xs text-slate-400">© 2026 FL Smartech Spaces. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
