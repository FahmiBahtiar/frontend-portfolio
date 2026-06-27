'use client';

import { motion } from 'motion/react';
import { 
  Radio, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Instagram,
  Twitter,
  Send,
  MapPin,
  Copy,
  Check,
  Radar,
  X,
  Loader2,
  type LucideIcon
} from 'lucide-react';
import { useState, useActionState, useEffect } from 'react';
import { safeExternalUrl } from '@/lib/safe-url';
import Image from 'next/image';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/config';

interface ContactFrequency {
  id: string;
  frequency: string;
  label: string;
  value: string;
  icon: string;
  type: 'primary' | 'social';
  color: string;
  link?: string;
  order: number;
}

interface Page5ContactProps {
  onNavigate?: (sectionIndex: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

async function submitMessage(prevState: { status: string }, formData: FormData) {
  try {
    // Public contact form -> backend's public, rate-limited /contact-messages endpoint.
    const API_BASE = API_BASE_URL;
    const response = await fetch(`${API_BASE}/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
      }),
    });

    const result = await response.json();

    if (result.success) {
      return { status: 'success' };
    } else {
      return { status: 'error' };
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return { status: 'error' };
  }
}

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitMessage, { status: 'idle' });

  // Reset form on success visually if needed (though uncontrolled components keep values).
  // React 19 form actions reset automatically when successful if bound natively.

  return (
    <div>
      <Card className="border-cyan-500/20 bg-slate-900/60 shadow-2xl">
        <CardContent className="p-6 md:p-8">
          <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-cyan-50 mb-2 font-mono">
                  Name *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Your full name"
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-50 mb-2 font-mono">
                  Email *
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="your.email@example.com"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-cyan-50 mb-2 font-mono">
                Subject *
              </label>
              <Input
                type="text"
                id="subject"
                name="subject"
                required
                placeholder="What's this about?"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-cyan-50 mb-2 font-mono">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                disabled={isPending}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-colors backdrop-blur-sm disabled:opacity-50"
                placeholder="Tell me about your project, idea, or just say hello..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="text-xs text-slate-400 font-mono">
                * Required fields
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="font-mono">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    <span className="font-mono">Send Message</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Status Messages */}
          {state.status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Message sent successfully!</span>
              </div>
              <p className="text-emerald-300/80 text-sm mt-1">
                Thank you for reaching out. I&apos;ll get back to you as soon as possible.
              </p>
            </motion.div>
          )}

          {state.status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-3 h-3" />
                </div>
                <span className="font-medium">Failed to send message</span>
              </div>
              <p className="text-red-300/80 text-sm mt-1">
                Something went wrong. Please try again or contact me directly.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function Page5Contact({ onNavigate }: Page5ContactProps = {}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // SWR for automated deduping, caching, and revalidation
  const { data: contactData, error, isLoading } = useSWR('/api/contact-info', fetcher, {
    revalidateOnFocus: false,
  });

  const frequencies: ContactFrequency[] = Array.isArray(contactData) ? contactData : contactData?.data || [];

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, LucideIcon> = {
      Mail,
      Phone,
      Linkedin,
      Github,
      Instagram,
      Twitter,
    };
    return iconMap[iconName] || Mail;
  };

  const handleCopy = (id: string, value: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    
    document.body.removeChild(textarea);
  };

  const handleContact = (freq: ContactFrequency) => {
    const safeLink = safeExternalUrl(freq.link);
    if (safeLink) {
      window.open(safeLink, '_blank', 'noopener,noreferrer');
    } else if (freq.id === 'email') {
      window.location.href = `mailto:${freq.value}`;
    } else if (freq.id === 'phone') {
      window.location.href = `tel:${freq.value}`;
    }
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-8 lg:px-16 py-12 md:py-16 pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Radar Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="relative inline-block mb-8 group">
            {/* Pulsing glow */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl group-hover:bg-cyan-500/40 transition-colors duration-700" />
            
            {/* Icon container */}
            <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Radar className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            COMMUNICATION PANEL
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-cyan-400/80 mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm md:text-base font-mono tracking-widest">
              7°15&apos;S 112°45&apos;E • ALT 667M
            </span>
          </div>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Establish a direct connection. Choose your preferred frequency to initiate communication.
          </p>
        </div>

        {/* Primary Contacts - Emergency Frequencies */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <span className="text-red-400 font-mono font-semibold tracking-wider text-sm md:text-base">EMERGENCY FREQUENCIES</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-400 mb-2">Failed to load communication protocols.</div>
              </div>
            ) : frequencies.filter(f => f.type === 'primary').length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No emergency frequencies configured.
              </div>
            ) : (
              frequencies.filter(f => f.type === 'primary').map((freq) => {
                const Icon = getIconComponent(freq.icon);
                return (
                  <Card key={freq.id} className="group overflow-hidden border-white/5 hover:border-cyan-500/30 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-${freq.color}-500/10 border border-${freq.color}-500/20 flex items-center justify-center shrink-0`}>
                            <Icon className={`w-7 h-7 text-${freq.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-2xl md:text-3xl text-white font-mono font-bold tracking-tight">{freq.frequency}</span>
                              <span className="text-slate-400 text-sm font-semibold">MHz</span>
                            </div>
                            <span className="text-sm text-slate-400 font-mono tracking-wide">{freq.label}</span>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col gap-3">
                          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-md truncate w-full sm:max-w-[200px] text-center sm:text-left">
                            <span className="text-slate-300 font-mono text-sm">{freq.value}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => handleCopy(freq.id, freq.value)}
                              className="w-full"
                            >
                              {copiedId === freq.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleContact(freq)}
                              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                            >
                              Connect
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Discord Presence - Live Status */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-purple-400 font-mono font-semibold tracking-wider text-sm md:text-base">LIVE STATUS</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Discord Status Card */}
            <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors bg-slate-900/40">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-purple-400 tracking-wide font-bold">DISCORD NETWORK</div>
                    <div className="text-sm text-slate-400">Real-time presence</div>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border border-white/5 bg-black/40 p-2">
                  <Image
                    src="https://lanyard.cnrad.dev/api/467600406000697354?borderRadius=8px&theme=dark"
                    alt="Discord Status"
                    width={400}
                    height={150}
                    className="w-full aspect-[8/3] object-contain opacity-90 hover:opacity-100 transition-opacity"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>

            {/* IVAO Flight Status Card */}
            <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors bg-slate-900/40">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Radar className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-cyan-400 tracking-wide font-bold">IVAO NETWORK</div>
                    <div className="text-sm text-slate-400">Flight Telemetry</div>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center min-h-[160px] p-2">
                  <Image
                    src="https://status.ivao.aero/704291.png"
                    alt="IVAO Flight Status"
                    width={400}
                    height={200}
                    className="w-full aspect-[2/1] object-contain mix-blend-lighten opacity-80 hover:opacity-100 transition-opacity"
                    style={{ filter: 'invert(0.92) hue-rotate(180deg) brightness(1.1) contrast(0.9)' }}
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Media - Navigation Frequencies */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-cyan-400 font-mono font-semibold tracking-wider text-sm md:text-base">NAVIGATION FREQUENCIES</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
              </div>
            ) : frequencies.filter(f => f.type === 'social').map((freq) => {
              const Icon = getIconComponent(freq.icon);
              return (
                <Card 
                  key={freq.id} 
                  className="group cursor-pointer border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => handleContact(freq)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-full bg-${freq.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 text-${freq.color}-400`} />
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl text-white font-mono font-bold">{freq.frequency}</span>
                          <span className="text-xs text-slate-400 font-bold">MHz</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 font-mono uppercase tracking-wide mb-1">{freq.label}</div>
                      <div className="text-white font-mono text-sm truncate opacity-80 group-hover:opacity-100 transition-opacity">{freq.value}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 font-mono font-semibold tracking-wider text-sm md:text-base">DIRECT TRANSMISSION</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
          </div>
          <ContactForm />
        </div>

      </div>
    </div>
  );
}
