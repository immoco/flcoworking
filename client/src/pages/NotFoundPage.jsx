import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 text-center shadow-sm">
      <p className="text-sm uppercase tracking-[0.3em] text-[#c9a84c]">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-4 text-sm text-slate-600">The page you are looking for no longer exists or has been moved.</p>
      <Link to="/" className="mt-8 inline-flex rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white">Return home</Link>
    </div>
  );
}
