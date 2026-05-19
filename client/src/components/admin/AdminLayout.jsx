import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-900">
      <div className="border-b border-slate-200 bg-white/95 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-slate-500">FL Smartech Admin</p>
            <h1 className="text-2xl font-semibold text-slate-900">Admin panel</h1>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="space-y-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
