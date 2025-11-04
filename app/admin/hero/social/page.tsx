'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LinkIcon, Plus, X, Save } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { HeroService } from '@/lib/services/hero';
import type { SocialLink } from '@/lib/types/admin';

export default function SocialLinksPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
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

  useEffect(() => {
    // Load data from API
    const fetchData = async () => {
      try {
        const data = await HeroService.getSocialLinks();
        setSocialLinks(data);
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    if (editingLink) {
      // Update existing
      setSocialLinks(
        socialLinks.map((link) =>
          link.id === editingLink.id
            ? { ...link, ...formData }
            : link
        )
      );
    } else {
      // Create new
      const newLink: SocialLink = {
        id: Date.now().toString(),
        ...formData,
        order: socialLinks.length + 1,
      };
      setSocialLinks([...socialLinks, newLink]);
    }

    setIsFormOpen(false);
    setEditingLink(null);
  };

  const handleDelete = (link: SocialLink) => {
    setDeleteTarget(link);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setSocialLinks(socialLinks.filter((link) => link.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (item: SocialLink) => (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium capitalize">
          {item.platform}
        </span>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
    },
    {
      key: 'url',
      label: 'URL',
      render: (item: SocialLink) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 hover:underline"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Social Links</h1>
            <p className="text-white/60">Manage your social media links</p>
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={socialLinks}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          searchPlaceholder="Search social links..."
          emptyMessage="No social links found. Add your first link!"
        />
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {editingLink ? 'Edit Social Link' : 'Add Social Link'}
                      </h2>
                      <p className="text-white/60">
                        {editingLink ? 'Update your social media link' : 'Add a new social media link'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) =>
                        setFormData({ ...formData, platform: e.target.value as any })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      required
                    >
                      {platforms.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="@username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingLink ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
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
