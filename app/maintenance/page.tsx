import type { Metadata } from 'next';
import { CalendarClock, Mail, Wrench, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Under Maintenance | Fahmi Bahtiar',
  description: 'System is currently undergoing scheduled infrastructure upgrades.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const BACKEND_URL = API_BASE_URL;

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
  } catch {
    return null;
  }
};

export default async function MaintenancePage() {
  const maintenance = await getMaintenanceData();
  const title = maintenance?.title?.trim() || 'SYSTEM MAINTENANCE';
  const note = maintenance?.note?.trim() || 
    'The hangar is currently undergoing scheduled infrastructure upgrades and system tuning. We are clearing technical debt to ensure all services run smoothly at peak altitudes.';
  const startAt = formatDateTime(maintenance?.startAt);
  const endAt = formatDateTime(maintenance?.endAt);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#E2F4F3] via-[#F4FBFA] to-[#E2F4F3] text-[#0c282d] flex flex-col justify-between">
      {/* Arctic Ice ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#6FD4E1]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-[#B9E7E6]/30 blur-[100px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[400px] rounded-full bg-[#6FD4E1]/15 blur-[110px]" />
        {/* Subtle grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16 md:py-24 flex-1 flex flex-col items-center justify-center text-center">
        {/* Radar / Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#B9E7E6] shadow-sm text-xs font-mono font-bold text-[#0891b2] tracking-[0.2em] uppercase mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0891b2] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0891b2]" />
          </span>
          Flight Deck Standby Mode
        </div>

        {/* Hero Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-[#B9E7E6] shadow-md flex items-center justify-center text-[#0891b2] rotate-3 hover:rotate-0 transition-transform duration-300">
            <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-[#0891b2]" strokeWidth={1.75} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shadow-sm text-[#0891b2]">
            <ShieldAlert className="w-4 h-4 text-[#0891b2]" />
          </div>
        </div>

        {/* Heading & Note */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0c282d] tracking-tight mb-4">
          {title}
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-[#2d5f68] leading-relaxed font-medium mb-12">
          {note}
        </p>

        {/* Info Cards Grid */}
        <div className="grid w-full gap-5 sm:grid-cols-2 text-left mb-10">
          {/* Card 1: Maintenance Window */}
          <div className="group rounded-2xl border border-[#B9E7E6] bg-white/90 backdrop-blur-md p-6 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] group-hover:scale-105 transition-transform">
                <CalendarClock className="h-5 w-5 text-[#0891b2]" />
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold tracking-wider text-[#527d85] uppercase">
                  Schedule Telemetry
                </p>
                <h3 className="text-sm font-bold text-[#0c282d]">Maintenance Window</h3>
              </div>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#0c282d] mt-2 font-mono">
              {startAt || 'Now'}
              <span className="text-[#527d85] font-normal font-sans"> to </span>
              {endAt || 'Until further notice'}
            </p>
            <p className="mt-2 text-xs text-[#527d85] font-medium">
              Times displayed according to local timezone.
            </p>
          </div>

          {/* Card 2: Emergency Contact */}
          <div className="group rounded-2xl border border-[#B9E7E6] bg-white/90 backdrop-blur-md p-6 shadow-sm hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] group-hover:scale-105 transition-transform">
                <Mail className="h-5 w-5 text-[#0891b2]" />
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold tracking-wider text-[#527d85] uppercase">
                  Direct Line
                </p>
                <h3 className="text-sm font-bold text-[#0c282d]">Need Urgent Assistance?</h3>
              </div>
            </div>
            <p className="text-sm sm:text-base text-[#0c282d] mt-2 font-medium">
              Reach the cockpit directly at{' '}
              <Link 
                href="mailto:fahmibahtiar76@gmail.com" 
                className="font-bold text-[#0891b2] hover:text-[#0c282d] underline decoration-[#6FD4E1] decoration-2 underline-offset-4 transition-colors font-mono"
              >
                fahmibahtiar76@gmail.com
              </Link>
            </p>
            <p className="mt-2 text-xs text-[#527d85] font-medium">
              Priority communication protocol remains active.
            </p>
          </div>
        </div>

        {/* Footer Status Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B9E7E6] bg-white px-3.5 py-1.5 font-bold text-[#0c282d] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Status: {maintenance?.isActive ? 'Maintenance Active' : 'Standby'}
          </span>
          <span className="rounded-full border border-[#B9E7E6] bg-white/70 px-3.5 py-1.5 font-semibold text-[#527d85] shadow-sm">
            Thank you for your patience
          </span>
        </div>
      </div>
    </div>
  );
}