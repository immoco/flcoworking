import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/register', data);
      setSuccess('Account created! Please sign in to continue.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setServerError(error.response?.data?.error || 'Unable to create account.');
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-3 text-sm text-slate-600">Register as a customer and book workspace with verified NOC support.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-700">
            Full name
            <input type="text" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('name', { required: 'Name is required' })} />
            {errors.name && <span className="text-sm text-rose-600">{errors.name.message}</span>}
          </label>
          <label className="block space-y-2 text-sm text-slate-700">
            Email address
            <input type="email" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('email', { required: 'Email is required' })} />
            {errors.email && <span className="text-sm text-rose-600">{errors.email.message}</span>}
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-700">
            Password
            <input type="password" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })} />
            {errors.password && <span className="text-sm text-rose-600">{errors.password.message}</span>}
          </label>
          <label className="block space-y-2 text-sm text-slate-700">
            Phone number
            <input type="tel" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('phone')} />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-700">
            Company name
            <input type="text" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('company_name')} />
          </label>
          <label className="block space-y-2 text-sm text-slate-700">
            GST number
            <input type="text" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('gst_number')} />
          </label>
        </div>
        {serverError && <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{serverError}</div>}
        {success && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-semibold text-[#1a2744]">Sign in</Link>.
      </p>
    </div>
  );
}
