import { NavLink } from 'react-router-dom';
import {
  Activity,
  Building2,
  CreditCard,
  FileText,
  Home,
  Layers,
  ListChecks,
  Mail,
  Settings,
  Users,
} from 'lucide-react';

const items = [
  { label: 'Dashboard', to: '/admin', icon: Home },
  { label: 'Branches', to: '/admin/branches', icon: Building2 },
  { label: 'Spaces', to: '/admin/spaces', icon: Layers },
  { label: 'Bookings', to: '/admin/bookings', icon: ListChecks },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Documents', to: '/admin/documents', icon: FileText },
  { label: 'NOC Requests', to: '/admin/noc', icon: Mail },
  { label: 'Reports', to: '/admin/reports', icon: Activity },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className="w-full max-w-[280px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
      <div className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin</p>
        <h2 className="text-2xl font-semibold text-slate-900">Control panel</h2>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-[#1a2744] text-white shadow' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
