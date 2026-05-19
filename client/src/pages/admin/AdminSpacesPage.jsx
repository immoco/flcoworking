import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBranches, fetchSpaces, createSpace, updateSpace } from '../../lib/api.js';
import { Plus, Edit3 } from 'lucide-react';

const spaceTypes = [
  { value: 'VIRTUAL_OFFICE', label: 'Virtual Office' },
  { value: 'COWORKING_HOT_DESK', label: 'Coworking Hot Desk' },
  { value: 'DEDICATED_DESK', label: 'Dedicated Desk' },
  { value: 'PRIVATE_CABIN', label: 'Private Cabin' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
];

const initialForm = {
  branchId: '',
  name: '',
  type: 'COWORKING_HOT_DESK',
  description: '',
  capacity: 1,
  area_sqft: 0,
  price_per_month: 0,
  price_per_day: 0,
  price_per_hour: 0,
  amenities: [],
  images: [],
  is_active: true,
};

export default function AdminSpacesPage() {
  const queryClient = useQueryClient();
  const { data: branches } = useQuery(['branches'], fetchBranches);
  const { data: spaces, isLoading } = useQuery(['spaces'], () => fetchSpaces({}), { staleTime: 1000 * 60 * 10 });
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const createMutation = useMutation(createSpace, { onSuccess: () => queryClient.invalidateQueries(['spaces']) });
  const updateMutation = useMutation(({ id, payload }) => updateSpace(id, payload), { onSuccess: () => queryClient.invalidateQueries(['spaces']) });

  const filteredSpaces = useMemo(() => {
    if (!spaces) return [];
    return spaces.filter((space) => {
      if (filterBranch && space.branchId !== filterBranch) return false;
      if (filterType && space.type !== filterType) return false;
      return true;
    });
  }, [spaces, filterBranch, filterType]);

  const handleEdit = (space) => {
    setSelected(space);
    setForm({
      ...space,
      amenities: space.amenities || [],
      images: space.images || [],
    });
    setIsOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, amenities: form.amenities.filter(Boolean), images: form.images.filter(Boolean) };
    try {
      if (selected) await updateMutation.mutateAsync({ id: selected.id, payload });
      else await createMutation.mutateAsync(payload);
      setIsOpen(false);
      setSelected(null);
      setForm(initialForm);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTagAdd = (value) => {
    if (!value.trim()) return;
    setForm((prev) => ({ ...prev, amenities: [...prev.amenities, value.trim()] }));
  };

  const activeCount = useMemo(() => spaces?.filter((space) => space.is_active).length || 0, [spaces]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Spaces</h2>
          <p className="mt-2 text-sm text-slate-500">Manage inventory, pricing and availability for your branches.</p>
        </div>
        <button onClick={() => { setSelected(null); setForm(initialForm); setIsOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Plus size={16} /> Add space
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.35fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <select value={filterBranch} onChange={(event) => setFilterBranch(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none">
              <option value="">All branches</option>
              {branches?.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}
            </select>
            <select value={filterType} onChange={(event) => setFilterType(event.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none">
              <option value="">All types</option>
              {spaceTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
            </select>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Space</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-slate-500">Loading spaces...</td></tr>
                ) : filteredSpaces.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-slate-500">No spaces found.</td></tr>
                ) : filteredSpaces.map((space) => (
                  <tr key={space.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{space.name}</td>
                    <td className="px-6 py-4 text-slate-600">{space.branchId}</td>
                    <td className="px-6 py-4 text-slate-600">{space.type.replaceAll('_', ' ')}</td>
                    <td className="px-6 py-4 text-slate-600">₹{space.price_per_month || space.price_per_day || space.price_per_hour || 0}</td>
                    <td className="px-6 py-4 text-slate-700">{space.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(space)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">
                        <Edit3 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Inventory</h3>
          <p className="mt-3 text-sm text-slate-500">Total spaces: {spaces?.length ?? '—'}</p>
          <p className="mt-2 text-sm text-slate-500">Active spaces: {activeCount}</p>
          <div className="mt-6 rounded-[2rem] bg-[#f8fafc] p-5 text-sm text-slate-600">
            Use this page to publish new workspace options and manage pricing plans.
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{selected ? 'Edit space' : 'Add new space'}</h2>
                <p className="mt-2 text-sm text-slate-500">Full pricing, attributes and amenities.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  Branch
                  <select value={form.branchId} onChange={(event) => setForm((prev) => ({ ...prev, branchId: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                    <option value="">Select branch</option>
                    {branches?.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}
                  </select>
                </label>
                <label className="block text-sm text-slate-700">
                  Space name
                  <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                </label>
                <label className="block text-sm text-slate-700">
                  Type
                  <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                    {spaceTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
                  </select>
                </label>
                <label className="block text-sm text-slate-700">
                  Capacity
                  <input type="number" value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                </label>
                <label className="block text-sm text-slate-700">
                  Area (sqft)
                  <input type="number" value={form.area_sqft} onChange={(event) => setForm((prev) => ({ ...prev, area_sqft: Number(event.target.value) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                </label>
                <label className="block text-sm text-slate-700">
                  Active
                  <select value={form.is_active ? 'true' : 'false'} onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.value === 'true' }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <label className="block text-sm text-slate-700">
                  Monthly price
                  <input type="number" value={form.price_per_month} onChange={(event) => setForm((prev) => ({ ...prev, price_per_month: Number(event.target.value) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                </label>
                <label className="block text-sm text-slate-700">
                  Daily price
                  <input type="number" value={form.price_per_day} onChange={(event) => setForm((prev) => ({ ...prev, price_per_day: Number(event.target.value) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                </label>
                <label className="block text-sm text-slate-700">
                  Hourly price
                  <input type="number" value={form.price_per_hour} onChange={(event) => setForm((prev) => ({ ...prev, price_per_hour: Number(event.target.value) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                </label>
              </div>
              <label className="block text-sm text-slate-700">
                Description
                <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" rows="4" />
              </label>
              <label className="block text-sm text-slate-700">
                Amenities (comma separated)
                <input value={form.amenities.join(', ')} onChange={(event) => setForm((prev) => ({ ...prev, amenities: event.target.value.split(',').map((item) => item.trim()) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
              </label>
              <label className="block text-sm text-slate-700">
                Image URLs (comma separated)
                <input value={form.images.join(', ')} onChange={(event) => setForm((prev) => ({ ...prev, images: event.target.value.split(',').map((item) => item.trim()) }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-full border border-slate-200 px-6 py-3 text-sm text-slate-700 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">{selected ? 'Save space' : 'Add space'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
