import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBranches, createBranch, updateBranch, disableBranch } from '../../lib/api.js';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

const initialForm = { name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', google_maps_url: '' };

export default function AdminBranchesPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
 const [isOpen, setIsOpen] = useState(false);

  const { data: branches, isLoading } = useQuery(['branches'], fetchBranches);
  const createMutation = useMutation(createBranch, { onSuccess: () => queryClient.invalidateQueries(['branches']) });
  const updateMutation = useMutation(({ id, payload }) => updateBranch(id, payload), { onSuccess: () => queryClient.invalidateQueries(['branches']) });
  const disableMutation = useMutation(disableBranch, { onSuccess: () => queryClient.invalidateQueries(['branches']) });

  const handleOpen = (branch) => {
    setSelected(branch || null);
    setForm(branch || initialForm);
    setIsOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form };
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsOpen(false);
      setSelected(null);
      setForm(initialForm);
    } catch (error) {
      console.error(error);
    }
  };

  const activeCount = useMemo(() => branches?.filter((branch) => branch.is_active).length || 0, [branches]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Branches</h2>
          <p className="mt-2 text-sm text-slate-500">Manage branch locations and contact details.</p>
        </div>
        <button onClick={() => handleOpen(null)} className="inline-flex items-center gap-2 rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Plus size={16} /> Add branch
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.4fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-slate-500">Loading branches...</td></tr>
              ) : branches?.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-slate-500">No branches found.</td></tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{branch.name}</td>
                    <td className="px-6 py-4 text-slate-600">{branch.city}, {branch.state}</td>
                    <td className="px-6 py-4 text-slate-600">{branch.phone || branch.email}</td>
                    <td className="px-6 py-4 text-slate-700">{branch.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleOpen(branch)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100">
                          <Pencil size={14} /> Edit
                        </button>
                        <button onClick={() => disableMutation.mutate(branch.id)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100">
                          {branch.is_active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />} {branch.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Branch summary</h3>
          <p className="mt-3 text-sm text-slate-500">Total branches: {branches?.length ?? '—'}</p>
          <p className="mt-2 text-sm text-slate-500">Active locations: {activeCount}</p>
          <div className="mt-6 rounded-[2rem] bg-[#f8fafc] p-5 text-sm text-slate-600">
            Add new branches for future expansion into more Indian cities.
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{selected ? 'Edit branch' : 'New branch'}</h2>
                <p className="mt-2 text-sm text-slate-500">Enter branch details for city expansion.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                {['name', 'city', 'state', 'pincode', 'phone', 'email', 'google_maps_url'].map((field) => (
                  <label key={field} className="block text-sm text-slate-700">
                    {field.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase())}
                    <input
                      value={form[field] || ''}
                      onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                    />
                  </label>
                ))}
              </div>
              <label className="block text-sm text-slate-700">
                Address
                <textarea
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                  rows="4"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-full border border-slate-200 px-6 py-3 text-sm text-slate-700 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">{selected ? 'Save changes' : 'Create branch'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
