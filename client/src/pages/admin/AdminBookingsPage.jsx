import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronRight, Info, Search, SlidersHorizontal } from 'lucide-react';
import { fetchAdminBookings, updateBookingStatus, fetchBookingById } from '../../lib/api.js';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

const statusOptions = ['PENDING', 'CONFIRMED', 'ACTIVE', 'EXPIRED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState({ status: '', booking_type: '', branch_id: '', search: '', start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { data: bookings, isLoading, refetch } = useQuery(['adminBookings', filters], () => fetchAdminBookings(filters), { keepPreviousData: true });
  const statusMutation = useMutation(({ id, status }) => updateBookingStatus(id, status), { onSuccess: () => refetch() });
  const bookingDetailQuery = useQuery(['bookingDetail', selectedBooking?.id], () => fetchBookingById(selectedBooking.id), { enabled: !!selectedBooking });

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    const q = filters.search.toLowerCase();
    return bookings.filter((booking) => {
      if (filters.search && !`${booking.user?.name || ''} ${booking.user?.email || ''} ${booking.company_name_for_noc || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [bookings, filters.search]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Bookings</h2>
            <p className="mt-2 text-sm text-slate-500">Filter and update booking lifecycle status.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
            <SlidersHorizontal size={16} /> Advanced filter
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
            <option value="">All statuses</option>
            {statusOptions.map((status) => (<option key={status} value={status}>{status}</option>))}
          </select>
          <select value={filters.booking_type} onChange={(e) => setFilters((prev) => ({ ...prev, booking_type: e.target.value }))} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
            <option value="">All types</option>
            <option value="VIRTUAL_OFFICE">Virtual Office</option>
            <option value="COWORKING">Coworking</option>
            <option value="PRIVATE_CABIN">Private Cabin</option>
            <option value="MEETING_ROOM">Meeting Room</option>
          </select>
          <input value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} placeholder="Search customer / company" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          <input type="date" value={filters.start} onChange={(e) => setFilters((prev) => ({ ...prev, start: e.target.value }))} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          <input type="date" value={filters.end} onChange={(e) => setFilters((prev) => ({ ...prev, end: e.target.value }))} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          <button type="button" onClick={() => refetch()} className="inline-flex items-center justify-center rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Booking#</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Space</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-slate-500"><LoadingSkeleton rows={1} /></td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-slate-500">No bookings match the current filter.</td></tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{booking.booking_number}</td>
                  <td className="px-6 py-4 text-slate-600">{booking.user?.name || booking.user?.email}</td>
                  <td className="px-6 py-4 text-slate-600">{booking.space?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-600">₹{booking.total_amount || 0}</td>
                  <td className="px-6 py-4 text-slate-700">
                    <select value={booking.status} onChange={(e) => statusMutation.mutate({ id: booking.id, status: e.target.value })} className="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                      {statusOptions.map((status) => (<option key={status} value={status}>{status}</option>))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelectedBooking(booking)} className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-2 text-xs font-semibold text-[#1a2744] hover:bg-[#b29b4d]">
                      Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <CalendarDays size={18} />
            <h3 className="text-lg font-semibold">Booking details</h3>
          </div>
          {!selectedBooking ? (
            <p className="text-sm text-slate-500">Select a booking row to preview the full booking panel.</p>
          ) : bookingDetailQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : bookingDetailQuery.data ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Booking</p>
                <p className="font-semibold text-slate-900">{bookingDetailQuery.data.booking_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="font-semibold text-slate-900">{bookingDetailQuery.data.user?.name || bookingDetailQuery.data.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Space</p>
                <p className="font-semibold text-slate-900">{bookingDetailQuery.data.space?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">{bookingDetailQuery.data.status}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Company:</span> {bookingDetailQuery.data.company_name_for_noc || 'N/A'}</p>
                <p><span className="font-semibold text-slate-900">Purpose:</span> {bookingDetailQuery.data.purpose_of_use || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Unable to load booking details.</p>
          )}
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
            <Info size={16} className="inline-block align-middle" /> Use this panel to review booking details and confirm customer requests.
          </div>
        </aside>
      </div>
    </div>
  );
}
