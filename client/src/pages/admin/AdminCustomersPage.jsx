import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchAdminCustomers } from '../../lib/api.js';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useQuery(['adminCustomers'], fetchAdminCustomers);

  const visibleCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter((customer) => `${customer.name || customer.email}`.toLowerCase().includes(search.toLowerCase()));
  }, [customers, search]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Customers</h2>
            <p className="mt-2 text-sm text-slate-500">Review customer profiles, booking counts and balances.</p>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Bookings</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Profile</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-slate-500">Loading customers...</td></tr>
            ) : visibleCustomers.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-slate-500">No customers found.</td></tr>
            ) : visibleCustomers.map((customer) => (
              <tr key={customer.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-900">{customer.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                <td className="px-6 py-4 text-slate-600">{customer.bookingCount}</td>
                <td className="px-6 py-4 text-slate-600">₹{customer.balance || 0}</td>
                <td className="px-6 py-4">
                  <Link to={`/admin/customers/${customer.id}`} className="rounded-full bg-[#c9a84c] px-4 py-2 text-xs font-semibold text-[#1a2744] hover:bg-[#b29b4d]">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
