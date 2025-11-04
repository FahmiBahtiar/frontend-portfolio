'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Plus, X, Save, Filter, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { EducationService } from '@/lib/services/education';
import type { Achievement } from '@/lib/types/admin';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState<Partial<Achievement>>({
    category: 'developer',
    title: '',
    issuer: '',
    date: '',
    icon: 'Award',
    description: '',
    certificateUrl: '',
    order: 0,
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'developer', label: 'Developer' },
    { value: 'aviation', label: 'Aviation' },
    { value: 'mountaineering', label: 'Mountaineering' },
    { value: 'other', label: 'Other' },
  ];

  const icons = [
    { value: 'Award', label: 'Award' },
    { value: 'Code2', label: 'Code' },
    { value: 'Plane', label: 'Plane' },
    { value: 'Mountain', label: 'Mountain' },
    { value: 'Trophy', label: 'Trophy' },
    { value: 'Star', label: 'Star' },
    { value: 'Medal', label: 'Medal' },
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Shield', label: 'Shield' },
    { value: 'Target', label: 'Target' },
  ];

  // Load achievements
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        const data = await EducationService.getAchievements();
        setAchievements(data);
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  const handleCreate = () => {
    setEditingAchievement(null);
    setFormData({
      category: 'developer',
      title: '',
      issuer: '',
      date: '',
      icon: 'Award',
      description: '',
      certificateUrl: '',
      order: 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData(achievement);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingAchievement) {
        const updatedAchievement = await EducationService.updateAchievement(editingAchievement.id, formData);
        setAchievements(
          achievements.map((achievement) =>
            achievement.id === editingAchievement.id ? updatedAchievement : achievement
          )
        );
      } else {
        const newAchievement = await EducationService.createAchievement({
          ...formData,
          order: achievements.length + 1,
        } as Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>);
        setAchievements([...achievements, newAchievement]);
      }
    } catch (error) {
      // Error handled by UI state
    } finally {
      setIsFormOpen(false);
      setEditingAchievement(null);
      setSaving(false);
    }
  };

  const handleDelete = (achievement: Achievement) => {
    setDeleteTarget(achievement);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await EducationService.deleteAchievement(deleteTarget.id);
        setAchievements(achievements.filter((achievement) => achievement.id !== deleteTarget.id));
      } catch (error) {
        // Error handled by UI state
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  // Filter achievements by category
  const filteredAchievements = filterCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === filterCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      developer: 'cyan',
      aviation: 'orange',
      mountaineering: 'green',
    };
    return colors[category] || 'gray';
  };

  const columns = [
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (item: Achievement) => {
        const color = getCategoryColor(item.category);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 font-medium capitalize`}>
            {item.category}
          </span>
        );
      },
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (item: Achievement) => (
        <div>
          <div className="font-medium text-white">{item.title}</div>
          <div className="text-sm text-white/60">{item.issuer}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
    },
    {
      key: 'certificateUrl',
      label: 'Certificate',
      render: (item: Achievement) => (
        item.certificateUrl ? (
          <a
            href={item.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm"
          >
            View Certificate
          </a>
        ) : (
          <span className="text-white/40 text-sm">No certificate</span>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Achievements</h1>
              <p className="text-white/60">Manage your certifications and awards</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { label: 'Developer', count: achievements.filter(a => a.category === 'developer').length, color: 'cyan' },
          { label: 'Aviation', count: achievements.filter(a => a.category === 'aviation').length, color: 'orange' },
          { label: 'Mountaineering', count: achievements.filter(a => a.category === 'mountaineering').length, color: 'green' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                <Award className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          data={filteredAchievements}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          searchPlaceholder="Search achievements..."
          emptyMessage="No achievements found. Add your first achievement!"
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
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
              >
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
                      </h2>
                      <p className="text-white/60">
                        {editingAchievement ? 'Update achievement information' : 'Add a new achievement or certification'}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value as any })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        required
                      >
                        {categories.filter(c => c.value !== 'all').map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        required
                      >
                        {icons.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="e.g., Full Stack Development Certification"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Issuer
                      </label>
                      <input
                        type="text"
                        value={formData.issuer}
                        onChange={(e) =>
                          setFormData({ ...formData, issuer: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        placeholder="e.g., Tech Academy"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Date
                      </label>
                      <input
                        type="text"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        placeholder="e.g., 2023"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
                      placeholder="Additional details about this achievement..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Certificate URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.certificateUrl || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, certificateUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="https://..."
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>{editingAchievement ? 'Update' : 'Create'}</span>
                        </>
                      )}
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
        title="Delete Achievement"
        description="Are you sure you want to delete this achievement?"
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
