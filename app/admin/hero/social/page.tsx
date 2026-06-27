'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { LinkIcon, Plus, Save, Loader2, X } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { HeroService } from '@/lib/services/hero';
import type { SocialLink } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SocialLinksPage() {
  const { data: socialLinks = [], mutate, isLoading, error } = useSWR('social-links', () => HeroService.getSocialLinks());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    platform: 'github' | 'linkedin' | 'instagram' | 'twitter';
    url: string;
    username: string;
  }>({
    platform: 'github',
    url: '',
    username: '',
  });

  const platforms = [
    { value: 'github', label: 'GitHub' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
  ];

  const handleCreate = () => {
    setEditingLink(null);
    setFormData({ platform: 'github', url: '', username: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      username: link.username,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingLink) {
        // Here you would call updateSocialLink if it existed in HeroService
        // For now, doing it manually or expecting API route
        const res = await fetch(`/api/admin/hero/social/${editingLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update social link');
      } else {
        const payload = { ...formData, order: socialLinks.length + 1 };
        const res = await fetch('/api/admin/hero/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create social link');
      }
      
      await mutate();
      setIsFormOpen(false);
      setEditingLink(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save social link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (link: SocialLink) => {
    setDeleteTarget(link);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/admin/hero/social/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete social link');

      await mutate(socialLinks.filter((link) => link.id !== deleteTarget.id), false);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete social link');
    }
  };

  const columns = [
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (item: SocialLink) => (
        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium capitalize text-xs">
          {item.platform}
        </span>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (item: SocialLink) => <span className="text-white font-medium">{item.username}</span>,
    },
    {
      key: 'url',
      label: 'URL',
      render: (item: SocialLink) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm truncate max-w-[200px] block"
          onClick={(e) => e.stopPropagation()}
        >
          {item.url}
        </a>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      sortable: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading social links...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load social links.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <LinkIcon className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Social Links</h1>
            <p className="text-sm text-muted-foreground">Manage your social media links</p>
          </div>
        </div>

        <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Link
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">{editingLink ? 'Edit Social Link' : 'Add Social Link'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value as SocialLink['platform'] })}
                        className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        required
                      >
                        {platforms.map((platform) => (
                          <option key={platform.value} value={platform.value} className="bg-slate-900">
                            {platform.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="@username"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-white/5 border-white/10"
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingLink ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
          <DataTable
            data={socialLinks}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Search social links..."
            emptyMessage="No social links found. Add your first link!"
          />
        </div>
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Social Link"
        description="Are you sure you want to delete this social link?"
        itemName={deleteTarget?.platform}
      />
    </div>
  );
}
