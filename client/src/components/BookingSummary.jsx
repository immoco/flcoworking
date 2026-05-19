import { useMemo } from 'react';

export default function BookingSummary({ booking, onProceed }) {
  const total = useMemo(() => booking.price || 0, [booking]);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Booking Summary</h3>
      <div className="mt-5 space-y-3 text-sm text-slate-600">
        <div className="flex justify-between"><span>Plan</span><span>{booking.plan || 'Monthly'}</span></div>
        <div className="flex justify-between"><span>Start</span><span>{booking.startDate || '-'}</span></div>
        <div className="flex justify-between"><span>End</span><span>{booking.endDate || '-'}</span></div>
        <div className="flex justify-between font-semibold text-slate-900"><span>Total</span><span>₹{total}</span></div>
      </div>
      <button onClick={onProceed} className="mt-6 w-full rounded-full bg-[#1a2744] px-5 py-3 text-white transition hover:bg-slate-800">Proceed to Book</button>
    </div>
  );
}
