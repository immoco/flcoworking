export default function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 rounded-3xl bg-slate-200/70 animate-pulse" />
      ))}
    </div>
  );
}
