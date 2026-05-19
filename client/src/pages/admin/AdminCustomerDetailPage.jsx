import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminCustomers, fetchAdminBookings, fetchDocumentsForBooking, fetchPaymentsForBooking, verifyDocument } from '../../lib/api.js';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);

  const { data: customers, isLoading: customersLoading } = useQuery(['adminCustomers'], fetchAdminCustomers);
  const { data: bookings, isLoading: bookingsLoading } = useQuery(['adminBookings'], () => fetchAdminBookings({}), { staleTime: 1000 * 60 * 10 });

  const customer = useMemo(() => customers?.find((item) => item.id === id), [customers, id]);
  const customerBookings = useMemo(() => bookings?.filter((booking) => booking.user?.id === id) || [], [bookings, id]);
  const documentsQuery = useQuery(['documents', selectedBooking?.id], () => fetchDocumentsForBooking(selectedBooking.id), { enabled: !!selectedBooking });
  const paymentsQuery = useQuery(['payments', selectedBooking?.id], () => fetchPaymentsForBooking(selectedBooking.id), { enabled: !!selectedBooking });

  const handleVerify = async (docId) => {
    try {
      await verifyDocument(docId);
      documentsQuery.refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const saveNote = () => {
    if (!notes.trim()) return;
    setSavedNotes((prev) => [...prev, notes.trim()]);
    setNotes('');
  };

  if (customersLoading || bookingsLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (!customer) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-600">Customer not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{customer.name || customer.email}</h2>
            <p className="mt-2 text-sm text-slate-500">Customer profile, booking history and verification controls.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm text-slate-700">Bookings: {customer.bookingCount}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Profile information</h3>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Email:</span> {customer.email}</p>
              <p><span className="font-semibold text-slate-900">Name:</span> {customer.name || 'N/A'}</p>
              <p><span className="font-semibold text-slate-900">Bookings:</span> {customer.bookingCount}</p>
              <p><span className="font-semibold text-slate-900">Balance:</span> ₹{customer.balance || 0}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Document verification</h3>
                <p className="mt-2 text-sm text-slate-500">Select a booking to review uploaded documents.</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {selectedBooking ? (
                documentsQuery.isLoading ? (
                  <LoadingSkeleton rows={3} />
                ) : documentsQuery.data?.length ? (
                  documentsQuery.data.map((doc) => (
                    <div key={doc.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{doc.doc_type}</p>
                          <p className="text-sm text-slate-600">{doc.file_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200">Preview</a>
                          <button onClick={() => handleVerify(doc.id)} className="rounded-full bg-[#1a2744] px-4 py-2 text-xs font-semibold text-white">Verify</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No documents uploaded for this booking.</p>
                )
              ) : (
                <p className="text-sm text-slate-500">Choose a booking to inspect documents.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Customer bookings</h3>
            <div className="mt-6 space-y-4">
              {customerBookings.length === 0 ? (
                <p className="text-sm text-slate-500">No bookings have been recorded for this customer.</p>
              ) : (
                customerBookings.map((booking) => (
                  <button key={booking.id} onClick={() => setSelectedBooking(booking)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100">
                    <p className="font-semibold text-slate-900">{booking.booking_number} — {booking.space?.name || booking.booking_type}</p>
                    <p className="mt-1 text-sm text-slate-600">{new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900">Payment history</h3>
            </div>
            {selectedBooking ? (
              paymentsQuery.isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : paymentsQuery.data?.length ? (
                <div className="space-y-3">
                  {paymentsQuery.data.map((payment) => (
                    <div key={payment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">₹{payment.amount}</p>
                      <p className="text-sm text-slate-600">{payment.payment_mode} — {new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No payments recorded for this booking.</p>
              )
            ) : (
              <p className="text-sm text-slate-500">Select a booking to show payment history.</p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Internal notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" className="mt-4 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Add a note for the account" />
            <button onClick={saveNote} className="mt-4 rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Save note</button>
            {savedNotes.length > 0 && (
              <div className="mt-6 space-y-3">
                {savedNotes.map((note, index) => (<div key={index} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">{note}</div>))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
