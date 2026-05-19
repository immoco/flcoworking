import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminBookings, fetchDocumentsForBooking } from '../../lib/api.js';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

export default function AdminDocumentsPage() {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const { data: bookings, isLoading } = useQuery(['adminBookings'], () => fetchAdminBookings({}), { staleTime: 1000 * 60 * 10 });
  const documentsQuery = useQuery(['documents', selectedBookingId], () => fetchDocumentsForBooking(selectedBookingId), { enabled: !!selectedBookingId });

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
            <p className="mt-2 text-sm text-slate-500">Review uploaded documents and verify records by booking.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm text-slate-700">Bookings available: {bookings?.length ?? '—'}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Select booking</h3>
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : bookings?.length ? (
              bookings.map((booking) => (
                <button key={booking.id} onClick={() => setSelectedBookingId(booking.id)} className={`w-full rounded-3xl border p-4 text-left transition ${selectedBookingId === booking.id ? 'border-[#1a2744] bg-[#eff2ff]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <p className="font-semibold text-slate-900">{booking.booking_number}</p>
                  <p className="mt-1 text-sm text-slate-600">{booking.user?.name || booking.user?.email}</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No bookings available.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Document preview</h3>
          {!selectedBookingId ? (
            <p className="mt-4 text-sm text-slate-500">Select a booking to inspect uploaded files.</p>
          ) : documentsQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : documentsQuery.data?.length ? (
            <div className="mt-6 space-y-4">
              {documentsQuery.data.map((doc) => (
                <div key={doc.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{doc.doc_type}</p>
                  <p className="text-sm text-slate-600">{doc.file_name}</p>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-[#1a2744] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">Preview file</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No documents found for this booking.</p>
          )}
        </div>
      </div>
    </div>
  );
}
