'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, Lock, Bell, Palette, Globe, Loader2, Wrench, CalendarClock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { MaintenanceSettings } from '@/lib/types/admin';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  const json = await res.json();
  return json.data;
};

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { data: maintenanceSettings, mutate: mutateMaintenance, isLoading: maintenanceLoading } = useSWR<MaintenanceSettings>('/api/admin/maintenance', fetcher);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    siteName: 'My Portfolio',
    tagline: 'Developer & Aviation Enthusiast',
    metaDescription: 'Personal portfolio website',
    theme: 'dark',
    accentColor: '#06b6d4',
    emailNotifications: true,
    commentNotifications: true,
    updateNotifications: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    startAt: '',
    endAt: '',
    note: '',
    title: '',
  });

  const toLocalInput = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  const toIsoString = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  useEffect(() => {
    if (!maintenanceSettings) return;
    setMaintenanceForm({
      enabled: maintenanceSettings.enabled,
      startAt: toLocalInput(maintenanceSettings.startAt),
      endAt: toLocalInput(maintenanceSettings.endAt),
      note: maintenanceSettings.note ?? '',
      title: maintenanceSettings.title ?? '',
    });
  }, [maintenanceSettings]);

  const maintenancePreview = useMemo(() => {
    const startAtIso = toIsoString(maintenanceForm.startAt);
    const endAtIso = toIsoString(maintenanceForm.endAt);
    const now = Date.now();
    const start = startAtIso ? new Date(startAtIso).getTime() : null;
    const end = endAtIso ? new Date(endAtIso).getTime() : null;
    const isActive = maintenanceForm.enabled && (!start || now >= start) && (!end || now <= end);
    const statusLabel = isActive ? 'Active now' : maintenanceForm.enabled ? 'Scheduled' : 'Disabled';

    return {
      isActive,
      statusLabel,
      startAtIso,
      endAtIso,
    };
  }, [maintenanceForm]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleMaintenanceSave = async () => {
    setMaintenanceSaving(true);
    setMaintenanceMessage(null);
    setMaintenanceError(null);

    try {
      const payload = {
        enabled: maintenanceForm.enabled,
        startAt: toIsoString(maintenanceForm.startAt),
        endAt: toIsoString(maintenanceForm.endAt),
        note: maintenanceForm.note.trim() || null,
        title: maintenanceForm.title.trim() || null,
      };

      const response = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update maintenance settings');
      }

      await mutateMaintenance();
      setMaintenanceMessage('Maintenance settings updated.');
    } catch (error) {
      setMaintenanceError('Failed to update maintenance settings.');
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Site Profile', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shadow-lg shadow-slate-500/10">
            <SettingsIcon className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your site configuration</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="bg-slate-700 hover:bg-slate-600 text-white">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-black/20 border-white/5">
            <CardContent className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {activeTab === 'profile' && (
              <Card className="bg-black/20 border-white/5">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg">Site Profile</CardTitle>
                  <CardDescription>Basic information about your website.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={settings.metaDescription}
                      onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                      rows={3}
                      className="bg-white/5 border-white/10 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">This will be used for SEO.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card className="bg-black/20 border-white/5">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of your site.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                    >
                      <option value="dark" className="bg-slate-900">Dark</option>
                      <option value="light" className="bg-slate-900">Light</option>
                      <option value="auto" className="bg-slate-900">Auto</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-4 h-10">
                      <Input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-16 h-10 px-1 py-1 cursor-pointer bg-white/5 border-white/10"
                      />
                      <Input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="flex-1 bg-white/5 border-white/10 font-mono uppercase"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="bg-black/20 border-white/5">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Manage how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="font-medium text-sm text-white">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive email updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="font-medium text-sm text-white">Comment Notifications</p>
                      <p className="text-xs text-muted-foreground">Get notified of new comments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.commentNotifications}
                        onChange={(e) => setSettings({ ...settings, commentNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="font-medium text-sm text-white">Update Notifications</p>
                      <p className="text-xs text-muted-foreground">System and feature updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.updateNotifications}
                        onChange={(e) => setSettings({ ...settings, updateNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="bg-black/20 border-white/5">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg">Security</CardTitle>
                  <CardDescription>Keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="font-medium text-sm text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                      className="bg-white/5 border-white/10"
                      min="5"
                      max="120"
                    />
                    <p className="text-xs text-muted-foreground">Automatically log out after inactivity.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm font-medium text-yellow-500">Change Password</p>
                    <Button variant="outline" className="mt-3 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'maintenance' && (
              <Card className="bg-black/20 border-white/5">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg">Maintenance Mode</CardTitle>
                  <CardDescription>Control downtime messaging and scheduling.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {maintenanceLoading ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading maintenance settings...
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                        <div>
                          <p className="text-sm font-medium text-white">Enable Maintenance Mode</p>
                          <p className="text-xs text-muted-foreground">Visitors will see the maintenance page while enabled.</p>
                        </div>
                        <Switch
                          checked={maintenanceForm.enabled}
                          onCheckedChange={(checked) => {
                            setMaintenanceForm((prev) => ({ ...prev, enabled: checked }));
                            setMaintenanceMessage(null);
                            setMaintenanceError(null);
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            type="text"
                            value={maintenanceForm.title}
                            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                            className="bg-white/5 border-white/10"
                            placeholder="We are tuning the engines"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm">
                            {maintenancePreview.isActive ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-400" />
                            )}
                            <span className="text-white/90">{maintenancePreview.statusLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="datetime-local"
                            value={maintenanceForm.startAt}
                            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, startAt: e.target.value })}
                            className="bg-white/5 border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="datetime-local"
                            value={maintenanceForm.endAt}
                            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, endAt: e.target.value })}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Maintenance Note</Label>
                        <Textarea
                          value={maintenanceForm.note}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, note: e.target.value })}
                          rows={4}
                          className="bg-white/5 border-white/10 resize-none"
                          placeholder="Tell visitors what is happening and when you will be back online."
                        />
                      </div>

                      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <CalendarClock className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-white">Visitor Preview</p>
                            <p className="text-sm text-white/80">
                              {(maintenanceForm.title || 'Maintenance Mode').trim()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {maintenanceForm.note.trim() || 'We are improving the site and will be back shortly.'}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              {maintenancePreview.startAtIso || maintenancePreview.endAtIso ? (
                                <span>
                                  Window: {maintenancePreview.startAtIso ? new Date(maintenancePreview.startAtIso).toLocaleString() : 'Now'}
                                  {' - '}
                                  {maintenancePreview.endAtIso ? new Date(maintenancePreview.endAtIso).toLocaleString() : 'Until further notice'}
                                </span>
                              ) : (
                                <span>Window: Not scheduled</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={handleMaintenanceSave}
                          disabled={maintenanceSaving}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          {maintenanceSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {maintenanceSaving ? 'Saving...' : 'Update Maintenance'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setMaintenanceForm({ ...maintenanceForm, startAt: '', endAt: '' })}
                        >
                          Clear Schedule
                        </Button>
                        {maintenanceMessage && <p className="text-sm text-emerald-400">{maintenanceMessage}</p>}
                        {maintenanceError && <p className="text-sm text-red-400">{maintenanceError}</p>}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
