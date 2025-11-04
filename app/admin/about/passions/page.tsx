'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Plus, Trash2, Save, GripVertical, Loader2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AboutService } from '@/lib/services/about';
import { Passion } from '@/lib/types/admin';

export default function PassionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passions, setPassions] = useState<Passion[]>([]);

  // Available colors
  const availableColors = [
    { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { value: 'green', label: 'Green', bg: 'bg-green-500' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-500' },
    { value: 'pink', label: 'Pink', bg: 'bg-pink-500' },
  ] as const;

  // Form state
  const [formData, setFormData] = useState({
    icon: '',
    title: '',
    description: '',
    color: 'cyan' as 'cyan' | 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'pink',
    statsLabel: '',
    statsValue: '',
    gradient: '',
    order: 0,
  });

  // Load passions data
  useEffect(() => {
    const loadPassions = async () => {
      try {
        setLoading(true);
        const data = await AboutService.getPassions();
        setPassions(data);
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    loadPassions();
  }, []);

  const handleEdit = (passion: Passion) => {
    setFormData({
      icon: passion.icon,
      title: passion.title,
      description: passion.description,
      color: passion.color,
      statsLabel: passion.statsLabel || passion.stats?.label || '',
      statsValue: passion.statsValue || passion.stats?.value || '',
      gradient: passion.gradient || '',
      order: passion.order,
    });
    setEditingId(passion.id);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      setPassions(passions.filter(p => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Update existing passion
        const updateData = {
          icon: formData.icon,
          title: formData.title,
          description: formData.description,
          color: formData.color,
          statsLabel: formData.statsLabel,
          statsValue: formData.statsValue,
          gradient: formData.gradient,
          order: formData.order,
        };
        await AboutService.updatePassion(editingId, updateData);
        setPassions(passions.map(p =>
          p.id === editingId ? { ...p, ...updateData } : p
        ));
      } else {
        // Create new passion
        const newPassion = {
          icon: formData.icon,
          title: formData.title,
          description: formData.description,
          color: formData.color,
          statsLabel: formData.statsLabel,
          statsValue: formData.statsValue,
          gradient: formData.gradient,
          order: formData.order,
        };
        const created = await AboutService.createPassion(newPassion);
        setPassions([...passions, created]);
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        icon: '',
        title: '',
        description: '',
        color: 'cyan',
        statsLabel: '',
        statsValue: '',
        gradient: '',
        order: 0,
      });
    } catch (error) {
      alert('Failed to save passion');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      icon: '',
      title: '',
      description: '',
      color: 'cyan',
      statsLabel: '',
      statsValue: '',
      gradient: '',
      order: 0,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const columns: Column<Passion>[] = [
    {
      key: 'icon',
      label: 'Icon',
      render: (passion: Passion) => (
        <span className="text-2xl">{passion.icon}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'description',
      label: 'Description',
      render: (passion: Passion) => (
        <span className="text-white/60 text-sm line-clamp-2">{passion.description}</span>
      ),
    },
    {
      key: 'color',
      label: 'Color',
      render: (passion: Passion) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-white/20"
            style={{ backgroundColor: passion.color }}
          />
          <span className="text-white/60 text-sm font-mono">{passion.color}</span>
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (passion: Passion) => (
        <div className="text-sm">
          <div className="text-white font-medium">{passion.statsValue || passion.stats?.value}</div>
          <div className="text-white/60">{passion.statsLabel || passion.stats?.label}</div>
        </div>
      ),
    },
    {
      key: 'gradient',
      label: 'Gradient',
      render: (passion: Passion) => (
        <span className="text-white/60 text-sm font-mono">{passion.gradient}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white/70">Loading passions...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/50">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Passions</h1>
                  <p className="text-white/60 text-sm mt-1">Manage your interests and hobbies</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Passion
            </button>
          </div>

          {/* Form */}
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? 'Edit Passion' : 'Add New Passion'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all text-2xl text-center"
                      placeholder="💻"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Color
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value as typeof formData.color })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                      required
                    >
                      {availableColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="Full Stack Development"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Describe your passion..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Stats Label
                    </label>
                    <input
                      type="text"
                      value={formData.statsLabel}
                      onChange={(e) => setFormData({ ...formData, statsLabel: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="Projects"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Stats Value
                    </label>
                    <input
                      type="text"
                      value={formData.statsValue}
                      onChange={(e) => setFormData({ ...formData, statsValue: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="50+"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Gradient
                    </label>
                    <input
                      type="text"
                      value={formData.gradient}
                      onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="from-cyan-500 to-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingId ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DataTable
              data={passions}
              columns={columns}
              onEdit={handleEdit}
              onDelete={(passion) => setDeleteId(passion.id)}
            />
          </motion.div>

          {/* Delete Dialog */}
          <DeleteDialog
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Delete Passion"
            description="Are you sure you want to delete this passion? This action cannot be undone."
            itemName={passions.find(p => p.id === deleteId)?.title || ''}
          />
        </>
      )}
    </div>
  );
}
