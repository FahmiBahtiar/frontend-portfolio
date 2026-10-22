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
import { FALLBACK_CONTACT_FREQUENCIES } from '@/lib/fallback-data';

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
      <Card className="border border-[#B9E7E6] bg-white/95 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[#0c282d] mb-2 font-mono">
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
                <label htmlFor="email" className="block text-sm font-bold text-[#0c282d] mb-2 font-mono">
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
              <label htmlFor="subject" className="block text-sm font-bold text-[#0c282d] mb-2 font-mono">
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
              <label htmlFor="message" className="block text-sm font-bold text-[#0c282d] mb-2 font-mono">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                disabled={isPending}
                className="w-full px-4 py-3 bg-white border border-[#B9E7E6] rounded-md text-[#0c282d] placeholder:text-[#527d85] focus:outline-none focus:ring-1 focus:ring-[#6FD4E1] focus:border-[#6FD4E1] resize-none transition-colors shadow-sm disabled:opacity-50"
                placeholder="Tell me about your project, idea, or just say hello..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#B9E7E6]">
              <div className="text-xs text-[#527d85] font-mono">
                * Required fields
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#6FD4E1] text-[#0c282d] hover:bg-[#B9E7E6] transition-colors font-bold shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#0c282d]" />
                    <span className="font-mono">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 text-[#0c282d]" />
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
    fallbackData: FALLBACK_CONTACT_FREQUENCIES,
  });

  const frequencies: ContactFrequency[] = Array.isArray(contactData)
    ? contactData
    : contactData?.data || FALLBACK_CONTACT_FREQUENCIES;

  const showLoading = isLoading && frequencies.length === 0;

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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#B9E7E6] mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-sm text-[#0891b2]">
            <Radar className="w-10 h-10 text-[#0891b2]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#0c282d] mb-4 tracking-tight">
            COMMUNICATION PANEL
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-[#0891b2] mb-6 font-mono font-bold">
            <MapPin className="w-4 h-4 text-[#0891b2]" />
            <span className="text-sm md:text-base tracking-widest text-[#0891b2] font-semibold">
              7°15&apos;S 112°45&apos;E • ALT 667M
            </span>
          </div>

          <p className="text-[#2d5f68] max-w-2xl mx-auto text-lg font-medium">
            Establish a direct connection. Choose your preferred frequency to initiate communication.
          </p>
        </div>

        {/* Primary Contacts - Emergency Frequencies */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6FD4E1]" />
              <span className="text-[#0c282d] font-mono font-bold tracking-wider text-sm md:text-base">EMERGENCY FREQUENCIES</span>
            </div>
            <div className="flex-1 h-px bg-[#B9E7E6]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#0891b2] animate-spin" />
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-500 mb-2">Failed to load communication protocols.</div>
              </div>
            ) : frequencies.filter(f => f.type === 'primary').length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#527d85]">
                No emergency frequencies configured.
              </div>
            ) : (
              frequencies.filter(f => f.type === 'primary').map((freq) => {
                const Icon = getIconComponent(freq.icon);
                return (
                  <Card key={freq.id} className="group overflow-hidden border border-[#B9E7E6] bg-white/90 hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 shadow-sm">
                    <CardContent className="p-0">
                      <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shrink-0 text-[#0891b2] shadow-sm">
                            <Icon className="w-7 h-7 text-[#0891b2]" />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-2xl md:text-3xl text-[#0c282d] font-mono font-bold tracking-tight">{freq.frequency}</span>
                              <span className="text-[#527d85] text-sm font-semibold">MHz</span>
                            </div>
                            <span className="text-sm text-[#527d85] font-mono tracking-wide">{freq.label}</span>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col gap-3">
                          <div className="bg-[#E2F4F3]/60 border border-[#B9E7E6] px-4 py-2 rounded-md truncate w-full sm:max-w-[200px] text-center sm:text-left">
                            <span className="text-[#0c282d] font-mono text-sm font-medium">{freq.value}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => handleCopy(freq.id, freq.value)}
                              className="w-full border-[#B9E7E6] text-[#0c282d] hover:border-[#6FD4E1]"
                            >
                              {copiedId === freq.id ? <Check className="w-4 h-4 text-[#0891b2]" /> : <Copy className="w-4 h-4 text-[#527d85]" />}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleContact(freq)}
                              className="w-full bg-[#6FD4E1] text-[#0c282d] hover:bg-[#B9E7E6] font-bold shadow-sm"
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
              <div className="w-2.5 h-2.5 rounded-full bg-[#6FD4E1]" />
              <span className="text-[#0c282d] font-mono font-bold tracking-wider text-sm md:text-base">LIVE STATUS</span>
            </div>
            <div className="flex-1 h-px bg-[#B9E7E6]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Discord Status Card */}
            <Card className="border border-[#B9E7E6] hover:border-[#6FD4E1] hover:shadow-md transition-all bg-white/90 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm">
                    <Radio className="w-6 h-6 text-[#0891b2]" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-[#0c282d] tracking-wide font-bold">DISCORD NETWORK</div>
                    <div className="text-sm text-[#527d85]">Real-time presence</div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#B9E7E6] bg-[#E2F4F3]/30 p-2">
                  <Image
                    src="https://lanyard.cnrad.dev/api/467600406000697354?borderRadius=8px&theme=dark"
                    alt="Discord Status"
                    width={400}
                    height={150}
                    className="w-full aspect-[8/3] object-contain opacity-95 hover:opacity-100 transition-opacity"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>

            {/* IVAO Flight Status Card */}
            <Card className="border border-[#B9E7E6] hover:border-[#6FD4E1] hover:shadow-md transition-all bg-white/90 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm">
                    <Radar className="w-6 h-6 text-[#0891b2]" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-[#0c282d] tracking-wide font-bold">IVAO NETWORK</div>
                    <div className="text-sm text-[#527d85]">Flight Telemetry</div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#B9E7E6] bg-[#E2F4F3]/30 flex items-center justify-center min-h-[160px] p-2">
                  <Image
                    src="https://status.ivao.aero/704291.png"
                    alt="IVAO Flight Status"
                    width={400}
                    height={200}
                    className="w-full aspect-[2/1] object-contain mix-blend-multiply opacity-90 hover:opacity-100 transition-opacity"
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
              <div className="w-2.5 h-2.5 rounded-full bg-[#6FD4E1]" />
              <span className="text-[#0c282d] font-mono font-bold tracking-wider text-sm md:text-base">NAVIGATION FREQUENCIES</span>
            </div>
            <div className="flex-1 h-px bg-[#B9E7E6]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {showLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#0891b2]" />
              </div>
            ) : frequencies.filter(f => f.type === 'social').map((freq) => {
              const Icon = getIconComponent(freq.icon);
              return (
                <Card 
                  key={freq.id} 
                  className="group cursor-pointer border border-[#B9E7E6] bg-white/90 hover:border-[#6FD4E1] hover:shadow-md transition-all duration-300 hover:-translate-y-1 shadow-sm"
                  onClick={() => handleContact(freq)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] group-hover:scale-105 transition-transform shadow-sm">
                        <Icon className="w-6 h-6 text-[#0891b2]" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl text-[#0c282d] font-mono font-bold">{freq.frequency}</span>
                          <span className="text-xs text-[#527d85] font-bold">MHz</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#527d85] font-mono uppercase tracking-wide mb-1">{freq.label}</div>
                      <div className="text-[#0c282d] font-mono text-sm truncate font-medium">{freq.value}</div>
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
              <div className="w-3 h-3 rounded-full bg-[#6FD4E1]" />
              <span className="text-[#0c282d] font-mono font-bold tracking-wider text-sm md:text-base">DIRECT TRANSMISSION</span>
            </div>
            <div className="flex-1 h-px bg-[#B9E7E6]" />
          </div>
          <ContactForm />
        </div>

      </div>
    </div>
  );
}
