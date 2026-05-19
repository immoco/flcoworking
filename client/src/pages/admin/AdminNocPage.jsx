import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchAdminBookings, createNocRequest, fetchNocRequestForBooking, generateNocPdf } from '../../lib/api.js';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

export default function AdminNocPage() {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [requestData, setRequestData] = useState({ company_name: '', director_name: '', director_din: '', purpose: '' });
  const { data: bookings, isLoading } = useQuery(['adminBookings'], () => fetchAdminBookings({}), { staleTime: 1000 * 60 * 10 });
  const nocQuery = useQuery(['nocRequest', selectedBookingId], () => fetchNocRequestForBooking(selectedBookingId), { enabled: !!selectedBookingId });
  const createMutation = useMutation(createNocRequest, { onSuccess: () => nocQuery.refetch() });
  const generateMutation = useMutation((id) => generateNocPdf(id), { onSuccess: () => nocQuery.refetch() });

  const selectedBooking = useMemo(() => bookings?.find((booking) => booking.id === selectedBookingId), [bookings, selectedBookingId]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!selectedBookingId) return;
    try {
      await createMutation.mutateAsync({ booking_id: selectedBookingId, ...requestData });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">NOC requests</h2>
            <p className="mt-2 text-sm text-slate-500">Manage pending NOC requests and generate PDFs for approval.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm text-slate-700">Total bookings: {bookings?.length ?? '—'}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Pending bookings</h3>
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : bookings?.length ? (
              bookings.map((booking) => (
                <button key={booking.id} onClick={() => setSelectedBookingId(booking.id)} className={`w-full rounded-3xl border p-4 text-left transition ${selectedBookingId === booking.id ? 'border-[#1a2744] bg-[#eff2ff]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <p className="font-semibold text-slate-900">{booking.booking_number}</p>
                  <p className="mt-1 text-sm text-slate-600">{booking.user?.name || booking.user?.email} — {booking.company_name_for_noc || 'No company set'}</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No bookings available for NOC management.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Request details</h3>
          {!selectedBooking ? (
            <p className="mt-4 text-sm text-slate-500">Select a booking to view or create an NOC request.</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">{selectedBooking.booking_number}</p>
                <p className="mt-2 text-sm text-slate-600">{selectedBooking.user?.name || selectedBooking.user?.email}</p>
                <p className="mt-2 text-sm text-slate-600">{new Date(selectedBooking.start_date).toLocaleDateString()} — {new Date(selectedBooking.end_date).toLocaleDateString()}</p>
              </div>
              <form className="space-y-4" onSubmit={handleCreate}>
                {['company_name', 'director_name', 'director_din', 'purpose'].map((key) => (
                  <label key={key} className="block text-sm text-slate-700">
                    {key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}
                    <input
                      value={requestData[key]}
                      onChange={(e) => setRequestData((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    />
                  </label>
                ))}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Create request</button>
                  {nocQuery.data?.id && (
                    <button type="button" onClick={() => generateMutation.mutate(nocQuery.data.id)} className="rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-[#1a2744] hover:bg-[#b29b4d]">Generate PDF</button>
                  )}
                </div>
                {nocQuery.data && nocQuery.data.generated_pdf_url && (
                  <p className="text-sm text-slate-500">PDF available at: {nocQuery.data.generated_pdf_url}</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
