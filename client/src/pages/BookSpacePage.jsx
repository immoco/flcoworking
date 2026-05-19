import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import BookingSummary from '../components/BookingSummary.jsx';
import { spaces } from '../lib/mockData.js';

const planOptions = {
  MONTHLY: 'Monthly',
  DAILY: 'Daily',
  HOURLY: 'Hourly',
};

export default function BookSpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = useMemo(() => spaces.find((item) => item.id === spaceId), [spaceId]);
  const [bookingResult, setBookingResult] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      plan_type: space?.price_per_month > 0 ? 'MONTHLY' : space?.price_per_day > 0 ? 'DAILY' : 'HOURLY',
      start_date: '',
      end_date: '',
      purpose_of_use: '',
      company_name_for_noc: '',
      director_name: '',
      director_din: '',
    },
  });

  const planType = watch('plan_type');
  const startDate = watch('start_date');
  const endDate = watch('end_date');

  useEffect(() => {
    if (!space) return;
    if (!planType) {
      const defaultPlan = space.price_per_month > 0 ? 'MONTHLY' : space.price_per_day > 0 ? 'DAILY' : 'HOURLY';
      setValue('plan_type', defaultPlan);
    }
  }, [space, planType, setValue]);

  const price = useMemo(() => {
    if (!space) return 0;
    if (planType === 'MONTHLY') return space.price_per_month;
    if (planType === 'DAILY') return space.price_per_day;
    if (planType === 'HOURLY') return space.price_per_hour;
    return 0;
  }, [space, planType]);

  const totalAmount = useMemo(() => {
    if (!price || !startDate || !endDate) return price;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return price;
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    if (planType === 'MONTHLY') return price;
    if (planType === 'DAILY') return price * days;
    if (planType === 'HOURLY') return price;
    return price;
  }, [price, planType, startDate, endDate]);

  const availablePlans = useMemo(() => {
    if (!space) return [];
    return [
      { label: planOptions.MONTHLY, value: 'MONTHLY', available: space.price_per_month > 0 },
      { label: planOptions.DAILY, value: 'DAILY', available: space.price_per_day > 0 },
      { label: planOptions.HOURLY, value: 'HOURLY', available: space.price_per_hour > 0 },
    ].filter((option) => option.available);
  }, [space]);

  const handleBooking = async (formData) => {
    if (!space) return;
    try {
      const payload = {
        spaceId: space.id,
        booking_type: space.type,
        plan_type: formData.plan_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_amount: totalAmount,
        purpose_of_use: formData.purpose_of_use,
        company_name_for_noc: formData.company_name_for_noc,
        director_name: formData.director_name,
        director_din: formData.director_din,
      };
      const response = await axios.post('/api/bookings', payload);
      setBookingResult(response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Unable to complete booking. Please try again.');
    }
  };

  if (!space) {
    return (
      <div className="rounded-[2rem] bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-semibold">Space not found</h2>
        <p className="mt-3 text-slate-600">This workspace does not exist or may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Booking for</p>
            <h1 className="text-3xl font-semibold text-slate-900">{space.name}</h1>
          </div>
          <p className="rounded-full bg-[#f7f8fc] px-4 py-2 text-sm font-semibold text-slate-700">Starting at ₹{price}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(handleBooking)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Booking plan
              <select className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('plan_type', { required: true })}>
                {availablePlans.map((plan) => (
                  <option key={plan.value} value={plan.value}>{plan.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Start date
              <input type="date" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('start_date', { required: true })} />
              {errors.start_date && <span className="text-sm text-rose-600">Start date is required</span>}
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              End date
              <input type="date" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('end_date', { required: true })} />
              {errors.end_date && <span className="text-sm text-rose-600">End date is required</span>}
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Purpose of use
              <input type="text" placeholder="Client meetings, team work, etc." className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('purpose_of_use')} />
            </label>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-6">
            <h2 className="text-xl font-semibold text-slate-900">NOC details</h2>
            <div className="grid gap-5 pt-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Company name
                <input type="text" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('company_name_for_noc')} />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Director name
                <input type="text" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('director_name')} />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Director DIN
                <input type="text" className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none" {...register('director_din')} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
            {isSubmitting ? 'Booking...' : 'Confirm booking'}
          </button>
        </form>
      </section>

      <aside className="space-y-6">
        <BookingSummary booking={{ plan: planOptions[planType], startDate, endDate, price: totalAmount }} onProceed={() => {}} />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Need help?</h2>
          <p className="mt-3 text-sm text-slate-600">Our customer support team can help with custom plans, invoices, and NOC approvals.</p>
        </div>
      </aside>
    </div>
  );
}
