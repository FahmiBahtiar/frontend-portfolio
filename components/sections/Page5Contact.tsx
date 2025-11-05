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
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  createdAt: string;
  updatedAt: string;
}

interface Page5ContactProps {
  onNavigate?: (sectionIndex: number) => void;
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/admin/communication/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ipAddress: '', // Could be populated from request headers
          userAgent: navigator.userAgent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div>
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2 font-mono">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2 font-mono">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                placeholder="What's this about?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2 font-mono">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 resize-none transition-colors"
              placeholder="Tell me about your project, idea, or just say hello..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="text-xs text-slate-500 font-mono">
              * Required fields
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-mono">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="font-mono">Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium">Message sent successfully!</span>
            </div>
            <p className="text-green-300 text-sm mt-1">
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-3 h-3" />
              </div>
              <span className="font-medium">Failed to send message</span>
            </div>
            <p className="text-red-300 text-sm mt-1">
              Something went wrong. Please try again or contact me directly.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function Page5Contact({ onNavigate }: Page5ContactProps = {}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [frequencies, setFrequencies] = useState<ContactFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string>('2025-05-07');

  // Fetch contact frequencies on component mount
  useEffect(() => {
    fetchContactFrequencies();
    fetchLastModified();
  }, []);

  const fetchContactFrequencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/contact-info');
      if (!response.ok) {
        throw new Error('Failed to fetch contact information');
      }
      const data = await response.json();
      setFrequencies(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contact information');
      // Fallback to empty array
      setFrequencies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastModified = async () => {
    try {
      const response = await fetch('/api/last-modified');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.formattedDate) {
          // Format: MM/DD/YYYY -> YYYY,MM,DD
          const [month, day, year] = data.formattedDate.split('/');
          setLastModified(`${year},${month},${day}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch last modified date:', err);
      // Keep default date
    }
  };

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
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
    // Fallback method for copying text (compatible with all browsers)
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
    if (freq.link) {
      window.open(freq.link, '_blank');
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
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Radar Icon with Pulse */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative inline-block mb-6"
          >
            {/* Pulsing glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl"
            />
            
            {/* Icon container */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Radar className="w-8 h-8 text-cyan-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white mb-3 tracking-wider"
          >
            COMMUNICATION PANEL
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-cyan-400"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm md:text-base font-mono">
              7°15'S 112°45'E • ALT 667M
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 mt-4 max-w-2xl mx-auto"
          >
            Select your preferred radio frequency to establish communication
          </motion.p>
        </motion.div>

        {/* Primary Contacts - Emergency Frequencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-red-500"
              />
              <span className="text-red-400 font-mono text-sm md:text-base">EMERGENCY FREQUENCIES</span>
            </div>
            <div className="flex-1 h-1 bg-red-500 border-2 border-red-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading frequencies...</span>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-400 mb-2">Failed to load contact information</div>
                <button
                  onClick={fetchContactFrequencies}
                  className="text-sm text-red-300 hover:text-red-200 underline"
                >
                  Try again
                </button>
              </div>
            ) : frequencies.filter(f => f.type === 'primary').length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No emergency frequencies configured
              </div>
            ) : (
              frequencies.filter(f => f.type === 'primary').map((freq, index) => {
                const Icon = getIconComponent(freq.icon);
                return (
                  <motion.div
                    key={freq.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative"
                  >
                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${freq.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                    
                    <div className="relative p-6 md:p-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
                      {/* Frequency Display */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br ${freq.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl md:text-3xl text-white font-mono">{freq.frequency}</span>
                              <span className="text-slate-400 text-sm">MHz</span>
                            </div>
                            <span className="text-xs md:text-sm text-slate-400 font-mono">{freq.label}</span>
                          </div>
                        </div>
                        <Radio className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                      </div>

                      {/* Value */}
                      <div className="flex items-center justify-between gap-4 p-3 md:p-4 rounded-lg bg-black/20 border border-white/5">
                        <span className="text-white font-mono text-sm md:text-base truncate">{freq.value}</span>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleCopy(freq.id, freq.value)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title="Copy"
                          >
                            {copiedId === freq.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleContact(freq)}
                            className={`px-4 py-2 rounded-lg bg-gradient-to-r ${freq.color} text-white hover:shadow-lg hover:shadow-${freq.color}/20 transition-all flex items-center gap-2`}
                          >
                            <Send className="w-4 h-4" />
                            <span className="hidden md:inline">Connect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Discord Presence - Live Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  opacity: [1, 0.3, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 rounded-full bg-purple-500"
              />
              <span className="text-purple-400 font-mono text-sm md:text-base">LIVE STATUS</span>
            </div>
            <div className="flex-1 h-1 bg-purple-500 border-2 border-red-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Discord Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative group h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                
                {/* Card Container */}
                <div className="relative h-full p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/30 transition-all">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-purple-400">DISCORD • LIVE</div>
                      <div className="text-xs text-slate-400">Real-time Activity</div>
                    </div>
                    <div className="ml-auto">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-purple-500"
                      />
                    </div>
                  </div>
                  
                  {/* Discord Lanyard */}
                  <div className="rounded-lg overflow-hidden border border-white/5">
                    <img 
                      src="https://lanyard.cnrad.dev/api/467600406000697354?borderRadius=8px&theme=dark" 
                      alt="Discord Status"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* IVAO Flight Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="relative group h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                
                {/* Card Container */}
                <div className="relative h-full p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 transition-all">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Radar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-cyan-400">IVAO • NETWORK</div>
                      <div className="text-xs text-slate-400">Flight Status</div>
                    </div>
                    <div className="ml-auto">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="w-2 h-2 rounded-full bg-cyan-500"
                      />
                    </div>
                  </div>
                  
                  {/* IVAO Status with Dark Mode */}
                  <div className="rounded-lg overflow-hidden border border-white/5 bg-slate-900/80 flex items-center justify-center min-h-[200px]">
                    <img 
                      src="https://status.ivao.aero/704291.png" 
                      alt="IVAO Flight Status"
                      className="w-full h-auto mix-blend-lighten opacity-90"
                      style={{
                        filter: 'invert(0.92) hue-rotate(180deg) brightness(1.1) contrast(0.9)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Social Media - Navigation Frequencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 min-w-[240px]">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 rounded-full bg-cyan-500"
              />
              <span className="text-cyan-400 font-mono text-sm md:text-base">NAVIGATION FREQUENCIES</span>
            </div>
            <div className="flex-1 h-1 bg-cyan-500 border-2 border-red-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading frequencies...</span>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-400 mb-2">Failed to load contact information</div>
                <button
                  onClick={fetchContactFrequencies}
                  className="text-sm text-red-300 hover:text-red-200 underline"
                >
                  Try again
                </button>
              </div>
            ) : frequencies.filter(f => f.type === 'social').length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No navigation frequencies configured
              </div>
            ) : (
              frequencies.filter(f => f.type === 'social').map((freq, index) => {
                const Icon = getIconComponent(freq.icon);
                return (
                  <motion.div
                    key={freq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative cursor-pointer"
                    onClick={() => handleContact(freq)}
                  >
                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${freq.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`} />
                    
                    <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
                      {/* Frequency Gauge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${freq.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl md:text-2xl text-white font-mono">{freq.frequency}</span>
                            <span className="text-xs text-slate-400">MHz</span>
                          </div>
                        </div>
                      </div>

                      {/* Label & Value */}
                      <div className="space-y-2">
                        <div className="text-xs md:text-sm text-slate-400 font-mono">{freq.label}</div>
                        <div className="text-white font-mono text-sm md:text-base truncate">{freq.value}</div>
                      </div>

                      {/* Status Indicator */}
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-500">STATUS</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs text-emerald-400">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 md:mt-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
                className="w-3 h-3 rounded-full bg-emerald-500"
              />
              <span className="text-emerald-400 font-mono text-sm md:text-base">CONTACT FORM</span>
            </div>
            <div className="flex-1 h-1 bg-emerald-500 border-2 border-red-500" />
          
          </div>

          <ContactForm />
        </motion.div>

      </div>
    </div>
  );
}
