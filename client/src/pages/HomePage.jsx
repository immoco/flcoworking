import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Calendar, CheckCircle2, Users } from 'lucide-react';
import { branches, serviceCards, testimonials } from '../lib/mockData.js';

const stepCards = [
  { title: 'Browse', description: 'Choose your ideal workspace.', icon: Briefcase },
  { title: 'Book', description: 'Reserve dates and confirm instantly.', icon: Calendar },
  { title: 'Upload Docs', description: 'Submit required documents securely.', icon: Users },
  { title: 'Get NOC', description: 'Receive approval and move in.', icon: CheckCircle2 },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="rounded-[2rem] bg-[#1a2744] px-6 py-14 text-white shadow-xl md:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#c9a84c]">Premium Office Spaces in Chennai</p>
            <h1 className="max-w-2xl text-4xl font-semibold md:text-5xl">Modern coworking and virtual office solutions for growing teams.</h1>
            <p className="max-w-xl text-base text-slate-200">Discover flexible workspace plans, professional meeting rooms, and virtual office services with a premium Chennai business address.</p>
            <div className="grid gap-4 sm:grid-cols-2 sm:max-w-lg">
              <Link to="/spaces" className="rounded-full bg-[#c9a84c] px-7 py-3 text-sm font-semibold text-[#1a2744]">Explore spaces</Link>
              <button className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm text-white hover:border-white">Schedule a tour</button>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-xl">
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-[#c9a84c]">Branch</p>
              <select className="mt-4 w-full rounded-3xl border border-slate-200 bg-white/10 px-4 py-3 text-slate-900 outline-none">
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4">
              {serviceCards.map((service) => {
                const Icon = service.icon === 'Briefcase' ? Briefcase : service.icon === 'Users' ? Users : Calendar;
                return (
                  <div key={service.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c9a84c] text-[#1a2744]"><Icon size={20} /></div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
                        <p className="text-sm text-slate-600">{service.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-semibold text-slate-900">How it works</h2>
          <div className="mt-6 grid gap-4">
            {stepCards.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1a2744] text-white"><Icon size={20} /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-[2rem] bg-[#c9a84c] p-8 text-[#1a2744] shadow-sm">
          <h2 className="text-3xl font-semibold">Testimonials</h2>
          <div className="mt-6 space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-3xl bg-white p-6 text-slate-900 shadow-sm">
                <p className="text-sm leading-7">“{testimonial.quote}”</p>
                <div className="mt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Your premium coworking destination</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Book a workspace, upload documents, and get your NOC all from one platform.</p>
          </div>
          <Link to="/spaces" className="inline-flex items-center gap-2 rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white">Browse spaces <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
