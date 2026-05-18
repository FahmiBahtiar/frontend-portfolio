import { CalendarClock, Mail, Wrench } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MaintenanceData {
  enabled: boolean;
  startAt?: string | null;
  endAt?: string | null;
  note?: string | null;
  title?: string | null;
  isActive: boolean;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getMaintenanceData = async (): Promise<MaintenanceData | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/maintenance`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data ?? null;
  } catch (error) {
    return null;
  }
};

export default async function MaintenancePage() {
  const maintenance = await getMaintenanceData();
  const title = maintenance?.title?.trim() || 'We are tuning the engines';
  const note = maintenance?.note?.trim() || 'The site is taking a short pit stop while we ship improvements. Thank you for your patience.';
  const startAt = formatDateTime(maintenance?.startAt);
  const endAt = formatDateTime(maintenance?.endAt);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
          <Wrench className="h-8 w-8 text-cyan-300" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">{note}</p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <CalendarClock className="h-4 w-4 text-cyan-300" />
              Maintenance Window
            </div>
            <p className="mt-3 text-base text-white">
              {startAt || 'Now'}
              <span className="text-white/50"> to </span>
              {endAt || 'Until further notice'}
            </p>
            <p className="mt-2 text-xs text-white/50">Times shown in your local timezone.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <div className="flex items-center gap-3 text-sm font-medium text-white/80">
              <Mail className="h-4 w-4 text-cyan-300" />
              Need something urgent?
            </div>
            <p className="mt-3 text-base text-white">
              Reach out at
              <Link href="mailto:fahmibahtiar76@gmail.com" className="ml-1 text-cyan-300 hover:text-cyan-200">
                fahmibahtiar76@gmail.com
              </Link>
            </p>
            <p className="mt-2 text-xs text-white/50">Replace with your primary support email.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Status: {maintenance?.isActive ? 'Maintenance Active' : 'Standby'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Thanks for your patience</span>
        </div>
      </div>
    </div>
  );
}
