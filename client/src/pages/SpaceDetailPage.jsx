import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Sparkles } from 'lucide-react';
import CalendarAvailability from '../components/CalendarAvailability.jsx';
import { spaces } from '../lib/mockData.js';

const planLabel = {
  MONTHLY: 'Monthly',
  DAILY: 'Daily',
  HOURLY: 'Hourly',
  ANNUAL: 'Annual',
};

export default function SpaceDetailPage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = useMemo(() => spaces.find((item) => item.id === spaceId), [spaceId]);

  if (!space) {
    return (
      <div className="rounded-[2rem] bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-semibold">Space not found</h2>
        <p className="mt-3 text-slate-600">The workspace you were looking for does not exist or has been removed.</p>
        <Link to="/spaces" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white">Back to spaces <ArrowRight size={16} /></Link>
      </div>
    );
  }

  const availablePlans = [
    { label: planLabel.MONTHLY, value: 'MONTHLY', price: space.price_per_month, visible: space.price_per_month > 0 },
    { label: planLabel.DAILY, value: 'DAILY', price: space.price_per_day, visible: space.price_per_day > 0 },
    { label: planLabel.HOURLY, value: 'HOURLY', price: space.price_per_hour, visible: space.price_per_hour > 0 },
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm">
            <img src={space.images[0]} alt={space.name} className="h-[420px] w-full object-cover" />
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-[#1a2744] px-4 py-2 text-sm font-semibold text-white">{space.type.replaceAll('_', ' ')}</span>
              <span className="text-sm text-slate-500">Capacity: {space.capacity} people</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-slate-900">{space.name}</h1>
              <p className="max-w-3xl text-slate-600">{space.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
                <div className="flex items-center gap-3 text-slate-900">
                  <MapPin size={18} />
                  <span>{space.branchName || 'Chennai branch'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Premium location with easy access and amenities for focused work.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
                <div className="flex items-center gap-3 text-slate-900">
                  <Sparkles size={18} />
                  <span>{availablePlans.length} booking options</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Choose the right plan for your team, whether hourly, daily, or monthly.</p>
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-[#f8fafc] p-6">
              <h2 className="text-xl font-semibold text-slate-900">Price details</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {availablePlans.map((plan) => (
                  <div key={plan.value} className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{plan.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-[#1a2744]">₹{plan.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-[#f8fafc] p-6">
              <h2 className="text-xl font-semibold text-slate-900">What’s included</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {space.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                    <Users size={16} className="text-[#c9a84c]" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <CalendarAvailability bookedDates={space.bookedDates || []} />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Ready to book?</h2>
            <p className="mt-3 text-sm text-slate-600">Reserve your workspace and complete your booking in a few easy steps.</p>
            <button
              type="button"
              onClick={() => navigate(`/book/${space.id}`)}
              className="mt-6 w-full rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start booking
            </button>
            <Link to="/spaces" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1a2744]">Back to offers <ArrowRight size={16} /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
