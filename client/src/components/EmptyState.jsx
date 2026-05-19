export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-700">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Nothing here yet</p>
      <h2 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}