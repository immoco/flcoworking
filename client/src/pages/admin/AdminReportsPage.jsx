import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAdminRevenue } from '../../lib/api.js';

const chartColors = ['#1a2744', '#c9a84c', '#4f46e5', '#0f766e', '#9333ea'];

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery(['adminRevenue'], fetchAdminRevenue);

  const monthlyData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.monthly || {}).map(([month, value]) => ({ month, value }));
  }, [data]);

  const typeData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byType || {}).map(([type, value]) => ({ name: type.replaceAll('_', ' '), value }));
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-2 text-sm text-slate-500">Revenue, occupancy and booking status breakdowns.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Revenue by month</h3>
          <div className="mt-6 h-[320px]">
            {isLoading ? (
              <div className="h-full animate-pulse rounded-3xl bg-slate-200" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="value" fill="#1a2744" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Occupancy rate by type</h3>
          <div className="mt-6 h-[320px]">
            {isLoading ? (
              <div className="h-full animate-pulse rounded-3xl bg-slate-200" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label />
                  {typeData.map((entry, index) => (<Cell key={entry.name} fill={chartColors[index % chartColors.length]} />))}
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Export</h3>
            <p className="mt-2 text-sm text-slate-500">Download the current report data for offline analysis.</p>
          </div>
          <button onClick={() => {
            const csvRows = [['Metric', 'Value']];
            if (data) {
              Object.entries(data.monthly || {}).forEach(([month, value]) => csvRows.push([month, value]));
            }
            const csv = csvRows.map((row) => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'admin-report.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }} className="rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Export to CSV</button>
        </div>
      </div>
    </div>
  );
}
