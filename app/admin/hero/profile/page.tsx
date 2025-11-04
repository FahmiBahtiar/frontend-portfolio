'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, User, Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { HeroService } from '@/lib/services/hero';
import { HeroProfile } from '@/lib/types/admin';

export default function HeroProfilePage() {
  const [formData, setFormData] = useState<HeroProfile>({
    id: '',
    name: '',
    badge: '',
    titles: [],
    passions: '',
    loginMessage: '',
    ctaText: '',
    techStack: [],
    status: '',
    location: '',
    flightLevel: '',
    description: '',
    createdAt: '',
    updatedAt: '',
  });

  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tech stack management
  const [newTechStackItem, setNewTechStackItem] = useState({
    callsign: '',
    label: '',
    icon: ''
  });

  // Load hero profile data
  useEffect(() => {
    const loadHeroProfile = async () => {
      try {
        setLoading(true);
        const data = await HeroService.getHeroProfile();
        setFormData(data);
      } catch (error) {
        // Keep default empty state if API fails
      } finally {
        setLoading(false);
      }
    };

    loadHeroProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Only send the properties that should be updated
      const updateData = {
        name: formData.name,
        badge: formData.badge,
        titles: formData.titles,
        passions: formData.passions,
        loginMessage: formData.loginMessage,
        ctaText: formData.ctaText,
        techStack: formData.techStack,
        status: formData.status,
        location: formData.location,
        flightLevel: formData.flightLevel,
        description: formData.description,
      };
      await HeroService.updateHeroProfile(updateData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addTitle = () => {
    if (newTitle.trim()) {
      setFormData({
        ...formData,
        titles: [...formData.titles, newTitle.trim()],
      });
      setNewTitle('');
    }
  };

  const removeTitle = (index: number) => {
    setFormData({
      ...formData,
      titles: formData.titles.filter((_, i) => i !== index),
    });
  };

  const addTechStackItem = () => {
    if (newTechStackItem.callsign.trim() && newTechStackItem.label.trim() && newTechStackItem.icon.trim()) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, { ...newTechStackItem }],
      });
      setNewTechStackItem({ callsign: '', label: '', icon: '' });
    }
  };

  const removeTechStackItem = (index: number) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white/70">Loading hero profile...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Hero Profile</h1>
                <p className="text-white/60">Update your main profile information</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Badge/Role
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Backend Developer"
                  required
                />
              </div>

              {/* Rotating Titles */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rotating Titles
                </label>
                <p className="text-white/50 text-sm mb-3">
                  These titles will be displayed in rotation on the hero section
                </p>

                <div className="space-y-2 mb-3">
                  {formData.titles.map((title, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <span className="flex-1 text-white">{title}</span>
                      <button
                        type="button"
                        onClick={() => removeTitle(index)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTitle())}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                    placeholder="Add new title"
                  />
                  <button
                    type="button"
                    onClick={addTitle}
                    className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Passions */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Passions
                </label>
                <p className="text-white/50 text-sm mb-3">
                  Use • to separate multiple passions
                </p>
                <input
                  type="text"
                  value={formData.passions}
                  onChange={(e) => setFormData({ ...formData, passions: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Coding • Aviation • Mountaineering"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hero Description
                </label>
                <p className="text-white/50 text-sm mb-3">
                  Main description displayed in the hero section
                </p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
                  placeholder="e.g., Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital"
                  required
                />
              </div>

              {/* Login Message */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Welcome Message
                </label>
                <input
                  type="text"
                  value={formData.loginMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, loginMessage: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="Welcome message"
                  required
                />
              </div>

              {/* CTA Text */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Call-to-Action Text
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Explore Portfolio"
                  required
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tech Stack
                </label>
                <p className="text-white/50 text-sm mb-3">
                  Add your tech stack items with callsigns. Icon mapping: Code2 (Development), Plane (Aviation), Mountain (Mountaineering), Users (Team), Database (Backend), Globe (Web), Smartphone (Mobile), etc.
                </p>
                
                {/* Current Tech Stack Items */}
                <div className="space-y-2 mb-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-white/10">
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Callsign</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Label</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Icon</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Category</div>
                  </div>
                  
                  {formData.techStack.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <div className="text-cyan-400 font-mono text-sm">
                          {item.callsign}
                        </div>
                        <div className="text-white">
                          {item.label}
                        </div>
                        <div className="text-purple-400 text-sm font-mono">
                          {item.icon}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {item.icon === 'Code2' && '💻 Development'}
                          {item.icon === 'Plane' && '✈️ Aviation'}
                          {item.icon === 'Mountain' && '🏔️ Mountaineering'}
                          {item.icon === 'Users' && '👥 Team/Social'}
                          {item.icon === 'Database' && '🗄️ Backend/Data'}
                          {item.icon === 'Globe' && '🌐 Web/Internet'}
                          {item.icon === 'Smartphone' && '📱 Mobile'}
                          {item.icon === 'Palette' && '🎨 Design/Creative'}
                          {item.icon === 'Camera' && '📷 Photography'}
                          {item.icon === 'Music' && '🎵 Audio/Music'}
                          {item.icon === 'Gamepad' && '🎮 Gaming'}
                          {item.icon === 'Coffee' && '☕ Lifestyle'}
                          {item.icon === 'Heart' && '❤️ Personal'}
                          {item.icon === 'Star' && '⭐ Favorite'}
                          {item.icon === 'Zap' && '⚡ Energy/Power'}
                          {!['Code2', 'Plane', 'Mountain', 'Users', 'Database', 'Globe', 'Smartphone', 'Palette', 'Camera', 'Music', 'Gamepad', 'Coffee', 'Heart', 'Star', 'Zap'].includes(item.icon) && '❓ Custom'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTechStackItem(index)}
                        className="p-1 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Tech Stack Item */}
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newTechStackItem.callsign}
                      onChange={(e) => setNewTechStackItem({ ...newTechStackItem, callsign: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 text-sm"
                      placeholder="Callsign"
                    />
                    <input
                      type="text"
                      value={newTechStackItem.label}
                      onChange={(e) => setNewTechStackItem({ ...newTechStackItem, label: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 text-sm"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={newTechStackItem.icon}
                      onChange={(e) => setNewTechStackItem({ ...newTechStackItem, icon: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 text-sm"
                      placeholder="Icon (Code2, Plane, etc.)"
                    />
                    <button
                      type="button"
                      onClick={addTechStackItem}
                      className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Icon Suggestions */}
                  <div className="text-xs text-slate-400">
                    <span className="font-medium">Available icons: </span>
                    Code2 💻, Plane ✈️, Mountain 🏔️, Users 👥, Database 🗄️, Globe 🌐, Smartphone 📱, 
                    Palette 🎨, Camera 📷, Music 🎵, Gamepad 🎮, Coffee ☕, Heart ❤️, Star ⭐, Zap ⚡
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Available for Collaboration"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Malang, Indonesia"
                  required
                />
              </div>

              {/* Flight Level */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Flight Level
                </label>
                <input
                  type="text"
                  value={formData.flightLevel}
                  onChange={(e) => setFormData({ ...formData, flightLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., FL030 • 3+ Years Experience"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </motion.form>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Preview</h2>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                <span className="text-cyan-400 text-sm font-medium">{formData.badge}</span>
              </div>
              <h1 className="text-4xl font-bold text-white">{formData.name}</h1>
              <div className="space-y-1">
                {formData.titles.map((title, index) => (
                  <p key={index} className="text-cyan-400 text-lg">
                    {title}
                  </p>
                ))}
              </div>
              <p className="text-white/70">{formData.passions}</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
