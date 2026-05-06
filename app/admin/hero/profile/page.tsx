'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { Save, User, Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { HeroService } from '@/lib/services/hero';
import { HeroProfile } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function HeroProfilePage() {
  const { data, mutate, isLoading } = useSWR('hero-profile', () => HeroService.getHeroProfile());
  
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

  const [newTechStackItem, setNewTechStackItem] = useState({
    callsign: '',
    label: '',
    icon: ''
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
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
      mutate();
    } catch (error) {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addTitle = () => {
    if (newTitle.trim()) {
      setFormData({ ...formData, titles: [...formData.titles, newTitle.trim()] });
      setNewTitle('');
    }
  };

  const removeTitle = (index: number) => {
    setFormData({ ...formData, titles: formData.titles.filter((_, i) => i !== index) });
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
    setFormData({ ...formData, techStack: formData.techStack.filter((_, i) => i !== index) });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading hero profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <User className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Hero Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your main introduction and roles</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge/Role</Label>
                    <Input value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Backend Developer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rotating Titles</Label>
                  <p className="text-xs text-muted-foreground">Titles displayed in rotation on the hero section.</p>
                  <div className="space-y-2">
                    {formData.titles.map((title, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10">
                        <span className="text-sm text-white/90">{title}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20" onClick={() => removeTitle(index)} type="button">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTitle())} className="bg-white/5 border-white/10" placeholder="Add new title" />
                    <Button type="button" variant="secondary" onClick={addTitle} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Passions</Label>
                  <Input value={formData.passions} onChange={(e) => setFormData({ ...formData, passions: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Coding • Aviation • Mountaineering" />
                </div>

                <div className="space-y-2">
                  <Label>Hero Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="bg-white/5 border-white/10 resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Input value={formData.loginMessage} onChange={(e) => setFormData({ ...formData, loginMessage: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Text</Label>
                    <Input value={formData.ctaText} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Input value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Flight Level</Label>
                    <Input value={formData.flightLevel} onChange={(e) => setFormData({ ...formData, flightLevel: e.target.value })} required className="bg-white/5 border-white/10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tech Stack</Label>
                  <p className="text-xs text-muted-foreground">Manage your technology stack references.</p>
                  <div className="space-y-2">
                    {formData.techStack.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-white/5 border border-white/10">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <span className="text-sm font-mono text-cyan-400">{item.callsign}</span>
                          <span className="text-sm text-white">{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.icon}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/20" onClick={() => removeTechStackItem(index)} type="button">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <Input value={newTechStackItem.callsign} onChange={(e) => setNewTechStackItem({ ...newTechStackItem, callsign: e.target.value })} className="bg-white/5 border-white/10" placeholder="Callsign" />
                    <Input value={newTechStackItem.label} onChange={(e) => setNewTechStackItem({ ...newTechStackItem, label: e.target.value })} className="bg-white/5 border-white/10" placeholder="Label" />
                    <Input value={newTechStackItem.icon} onChange={(e) => setNewTechStackItem({ ...newTechStackItem, icon: e.target.value })} className="bg-white/5 border-white/10" placeholder="Icon" />
                    <Button type="button" variant="secondary" onClick={addTechStackItem} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-black/20 border-white/5 sticky top-6">
            <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center gap-2 space-y-0">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">{formData.badge || 'BADGE'}</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{formData.name || 'Hero Name'}</h1>
                <div className="space-y-1">
                  {formData.titles.length > 0 ? formData.titles.map((title, index) => (
                    <p key={index} className="text-blue-400 text-sm font-medium">{title}</p>
                  )) : (
                    <p className="text-muted-foreground text-sm">Titles will appear here</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{formData.passions || 'Your passions will be listed here.'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
