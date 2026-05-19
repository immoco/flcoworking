import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAdminDashboard, fetchAdminBookings, fetchAdminRevenue } from '../../lib/api.js';

const chartColors = ['#1a2744', '#c9a84c', '#4f46e5', '#0f766e', '#db2777'];

function getLastSixMonths(revenue) {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = d.toISOString().slice(0, 7);
    return { month: d.toLocaleString('default', { month: 'short' }), value: revenue[key] || 0 };
  });
}

export default function AdminDashboardPage() {
  const dashboardQuery = useQuery(['adminDashboard'], fetchAdminDashboard);
  const bookingsQuery = useQuery(['adminBookings'], () => fetchAdminBookings({}), { staleTime: 1000 * 60 * 30 });
  const revenueQuery = useQuery(['adminRevenue'], fetchAdminRevenue);

  const lastBookings = useMemo(() => {
    if (!bookingsQuery.data) return [];
    return [...bookingsQuery.data]
      .sort((a, b) => new Date(b.createdAt || b.start_date) - new Date(a.createdAt || a.start_date))
      .slice(0, 10);
  }, [bookingsQuery.data]);

  const chartData = useMemo(() => {
    if (!revenueQuery.data) return [];
    return getLastSixMonths(revenueQuery.data.monthly || {});
  }, [revenueQuery.data]);

  const donutData = useMemo(() => {
    if (!revenueQuery.data) return [];
    return Object.entries(revenueQuery.data.byType || {}).map(([name, value]) => ({ name, value }));
  }, [revenueQuery.data]);

  const todayCount = useMemo(() => {
    if (!bookingsQuery.data) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return bookingsQuery.data.filter((booking) => booking.start_date?.slice(0, 10) === today).length;
  }, [bookingsQuery.data]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today's bookings", value: dashboardQuery.data?.totalBookings ?? '—' },
          { label: 'This month revenue', value: `₹${dashboardQuery.data?.revenueThisMonth ?? '—'}` },
          { label: 'Active spaces', value: `${dashboardQuery.data?.activeSpaces ?? '—'} active` },
          { label: 'Pending docs', value: dashboardQuery.data?.pendingVerifications ?? '—' },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Revenue last 6 months</h2>
              <p className="mt-2 text-sm text-slate-500">Tracked from completed payments.</p>
            </div>
          </div>
          <div className="mt-8 h-[320px]">
            {revenueQuery.isLoading ? (
              <div className="h-full animate-pulse rounded-3xl bg-slate-200" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="value" fill="#1a2744" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Space occupancy by plan</h2>
            <p className="mt-2 text-sm text-slate-500">Revenue split by space type.</p>
          </div>
          <div className="mt-8 h-[320px]">
            {revenueQuery.isLoading ? (
              <div className="h-full animate-pulse rounded-3xl bg-slate-200" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label />
                  {donutData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent bookings</h2>
            <p className="mt-2 text-sm text-slate-500">Latest 10 booking records across all branches.</p>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Space</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsQuery.isLoading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-slate-500">Loading bookings...</td></tr>
              ) : lastBookings.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-slate-500">No bookings available.</td></tr>
              ) : (
                lastBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{booking.booking_number}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.user?.name || booking.user?.email}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.space?.name}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-700">{booking.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
