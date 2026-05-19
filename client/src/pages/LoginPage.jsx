import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.error || 'Invalid credentials, please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-10 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-3 text-sm text-slate-600">Access your dashboard, bookings, and workspace documents.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <label className="block space-y-2 text-sm text-slate-700">
          Email address
          <input type="email" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('email', { required: 'Email is required' })} />
          {errors.email && <span className="text-sm text-rose-600">{errors.email.message}</span>}
        </label>
        <label className="block space-y-2 text-sm text-slate-700">
          Password
          <input type="password" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('password', { required: 'Password is required' })} />
          {errors.password && <span className="text-sm text-rose-600">{errors.password.message}</span>}
        </label>
        {serverError && <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{serverError}</div>}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Don’t have an account? <Link to="/register" className="font-semibold text-[#1a2744]">Create one</Link>.
      </p>
    </div>
  );
}
