import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SpaceCard from '../components/SpaceCard.jsx';
import { spaces } from '../lib/mockData.js';

const types = [
  { label: 'All', value: '' },
  { label: 'Coworking', value: 'COWORKING_HOT_DESK' },
  { label: 'Private Cabin', value: 'PRIVATE_CABIN' },
  { label: 'Meeting Room', value: 'MEETING_ROOM' },
  { label: 'Virtual Office', value: 'VIRTUAL_OFFICE' },
];

export default function SpacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get('type') || '';

  const filteredSpaces = useMemo(() => {
    if (!selectedType) return spaces;
    return spaces.filter((space) => space.type === selectedType);
  }, [selectedType]);

  return (
    <div className="space-y-10">
      <div className="rounded-[2rem] bg-[#1a2744] p-10 text-white shadow-xl">
        <h1 className="text-4xl font-semibold">Available Spaces</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-200">Browse workspaces, meeting rooms, and virtual offices with instant booking details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Filter by type</h2>
            <div className="mt-4 space-y-3">
              {types.map((type) => (
                <button
                  key={type.value}
                  className={`block w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold ${selectedType === type.value ? 'bg-[#c9a84c] text-[#1a2744]' : 'bg-slate-100 text-slate-700'}`}
                  onClick={() => setSearchParams({ type: type.value })}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Explore branches</h2>
            <p className="mt-3 text-sm text-slate-600">Find ideal locations across the city with flexible workspace types.</p>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
