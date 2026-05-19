import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const tileClassName = ({ date, view, bookedDates }) => {
  if (view !== 'month') return null;
  const available = bookedDates.some((range) => {
    const start = new Date(range.start).setHours(0, 0, 0, 0);
    const end = new Date(range.end).setHours(0, 0, 0, 0);
    const current = date.setHours(0, 0, 0, 0);
    return current >= start && current <= end;
  });
  return available ? 'react-calendar__tile--booked' : null;
};

export default function CalendarAvailability({ bookedDates = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Availability</h3>
      <Calendar tileClassName={({ date, view }) => tileClassName({ date, view, bookedDates })} />
      <style>{`.react-calendar__tile--booked { background: #f87171 !important; color: white !important; }`}</style>
    </div>
  );
}
