import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings');
        setBookings(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const summary = useMemo(() => {
    const counts = { PENDING: 0, CONFIRMED: 0, ACTIVE: 0, CANCELLED: 0, EXPIRED: 0 };
    bookings.forEach((booking) => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {user?.name || user?.email}</h1>
        <p className="mt-3 text-slate-600">Manage your bookings, agreements, invoices, and upcoming workspace reservations.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['PENDING', 'CONFIRMED', 'ACTIVE', 'CANCELLED'].map((status) => (
          <div key={status} className="rounded-[2rem] bg-[#f8fafc] p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{status.toLowerCase()}</p>
            <p className="mt-4 text-3xl font-semibold text-[#1a2744]">{summary[status] || 0}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Recent bookings</h2>
            <p className="mt-2 text-sm text-slate-600">Review your newest reservations and payment status.</p>
          </div>
          <p className="text-sm text-slate-500">Total bookings: {bookings.length}</p>
        </div>

        {loading ? (
          <div className="mt-8 text-slate-600">Loading booking data...</div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-[#f8fafc] p-6 text-slate-600">No bookings found yet. Book a workspace from the spaces page.</div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8fafc] text-sm uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Booking</th>
                  <th className="px-6 py-4">Space</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-200">
                    <td className="px-6 py-4">{booking.booking_number}</td>
                    <td className="px-6 py-4">{booking.space?.name || booking.booking_type}</td>
                    <td className="px-6 py-4">{new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">₹{booking.total_amount || 0}</td>
                    <td className="px-6 py-4 text-slate-700">{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
