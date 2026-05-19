import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeLabel = {
  VIRTUAL_OFFICE: 'Virtual Office',
  COWORKING_HOT_DESK: 'Coworking',
  PRIVATE_CABIN: 'Private Cabin',
  MEETING_ROOM: 'Meeting Room',
};

export default function SpaceCard({ space }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <img src={space.images[0]} alt={space.name} className="h-56 w-full rounded-t-3xl object-cover" />
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#1a2744] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">{typeLabel[space.type]}</span>
          <span className="text-sm text-slate-500">Capacity {space.capacity}</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900">{space.name}</h3>
        <p className="mt-2 text-sm text-slate-600">{space.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {space.amenities.slice(0, 3).map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#f7f7f9] px-3 py-1 text-xs text-slate-600">
              <CheckCircle2 size={14} /> {item}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Starting</p>
            <p className="text-xl font-semibold text-[#1a2744]">₹{space.price_per_month || space.price_per_hour || space.price_per_day}</p>
          </div>
          <Link to={`/spaces/${space.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-3 text-sm font-semibold text-[#1a2744]">
            View Details <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
