import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchAdminBookings, fetchPaymentsForBooking, createPayment } from '../../lib/api.js';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

const paymentModes = ['CASH', 'NEFT', 'UPI', 'CHEQUE', 'CARD'];

export default function AdminPaymentsPage() {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [form, setForm] = useState({ booking_id: '', amount: 0, payment_mode: 'CASH', transaction_reference: '', receipt_number: '', notes: '' });
  const { data: bookings, isLoading } = useQuery(['adminBookings'], () => fetchAdminBookings({}), { staleTime: 1000 * 60 * 10 });
  const paymentsQuery = useQuery(['payments', selectedBookingId], () => fetchPaymentsForBooking(selectedBookingId), { enabled: !!selectedBookingId });
  const mutation = useMutation(createPayment, { onSuccess: () => paymentsQuery.refetch() });

  const selectedBooking = useMemo(() => bookings?.find((booking) => booking.id === selectedBookingId), [bookings, selectedBookingId]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await mutation.mutateAsync({ ...form, booking_id: selectedBookingId, amount: Number(form.amount) });
      setForm({ booking_id: '', amount: 0, payment_mode: 'CASH', transaction_reference: '', receipt_number: '', notes: '' });
      setSelectedBookingId('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Payments</h2>
            <p className="mt-2 text-sm text-slate-500">Record payments and download receipts for bookings.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm text-slate-700">Total bookings: {bookings?.length ?? '—'}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Record payment</h3>
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-700">
              Booking
              <select value={selectedBookingId} onChange={(e) => { setSelectedBookingId(e.target.value); setForm((prev) => ({ ...prev, booking_id: e.target.value })); }} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                <option value="">Select booking</option>
                {bookings?.map((booking) => (<option key={booking.id} value={booking.id}>{booking.booking_number} — {booking.user?.name || booking.user?.email}</option>))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Amount
                <input type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
              </label>
              <label className="block text-sm text-slate-700">
                Mode
                <select value={form.payment_mode} onChange={(e) => setForm((prev) => ({ ...prev, payment_mode: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                  {paymentModes.map((mode) => (<option key={mode} value={mode}>{mode}</option>))}
                </select>
              </label>
            </div>
            <label className="block text-sm text-slate-700">
              Reference
              <input value={form.transaction_reference} onChange={(e) => setForm((prev) => ({ ...prev, transaction_reference: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
            </label>
            <label className="block text-sm text-slate-700">
              Receipt number
              <input value={form.receipt_number} onChange={(e) => setForm((prev) => ({ ...prev, receipt_number: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
            </label>
            <label className="block text-sm text-slate-700">
              Notes
              <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" rows="3" />
            </label>
            <button type="submit" className="rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">Save payment</button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Payment history</h3>
          {selectedBookingId ? (
            paymentsQuery.isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : paymentsQuery.data?.length ? (
              <div className="mt-6 space-y-4">
                {paymentsQuery.data.map((payment) => (
                  <div key={payment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">₹{payment.amount}</p>
                    <p className="mt-1 text-sm text-slate-600">{payment.payment_mode} • {new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">No payments recorded for the selected booking.</p>
            )
          ) : (
            <p className="mt-6 text-sm text-slate-500">Choose a booking to see payment history.</p>
          )}
        </div>
      </div>
    </div>
  );
}
