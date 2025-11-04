'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AboutService } from '@/lib/services/about';
import { Highlight } from '@/lib/types/admin';

export default function HighlightsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    icon: '',
    label: '',
    value: '',
    color: 'cyan' as 'cyan' | 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'pink',
    order: 0,
  });

  // Load highlights data
  useEffect(() => {
    const loadHighlights = async () => {
      try {
        setLoading(true);
        const data = await AboutService.getHighlights();
        setHighlights(data);
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    loadHighlights();
  }, []);

  const handleEdit = (highlight: Highlight) => {
    setFormData({
      icon: highlight.icon,
      label: highlight.label,
      value: highlight.value,
      color: highlight.color as typeof formData.color,
      order: highlight.order,
    });
    setEditingId(highlight.id);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await AboutService.deleteHighlight(deleteId);
      setHighlights(highlights.filter(h => h.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      alert('Failed to delete highlight');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Update existing highlight
        const updateData = {
          icon: formData.icon,
          label: formData.label,
          value: formData.value,
          color: formData.color,
          order: formData.order,
        };
        await AboutService.updateHighlight(editingId, updateData);
        setHighlights(highlights.map(h =>
          h.id === editingId ? { ...h, ...updateData } : h
        ));
      } else {
        // Create new highlight
        const newHighlight = {
          icon: formData.icon,
          label: formData.label,
          value: formData.value,
          color: formData.color,
          order: formData.order,
        };
        const created = await AboutService.createHighlight(newHighlight);
        setHighlights([...highlights, created]);
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        icon: '',
        label: '',
        value: '',
        color: 'cyan',
        order: 0,
      });
    } catch (error) {
      alert('Failed to save highlight');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      icon: '',
      label: '',
      value: '',
      color: 'cyan',
      order: 0,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const columns: Column<Highlight>[] = [
    {
      key: 'icon',
      label: 'Icon',
      render: (highlight: Highlight) => (
        <span className="text-2xl">{highlight.icon}</span>
      ),
    },
    {
      key: 'label',
      label: 'Label',
    },
    {
      key: 'value',
      label: 'Value',
      render: (highlight: Highlight) => (
        <span className="text-white font-bold">
          {highlight.value}
        </span>
      ),
    },
    {
      key: 'color',
      label: 'Color',
      render: (highlight: Highlight) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-white/20"
            style={{ backgroundColor: highlight.color }}
          />
          <span className="text-white/60 text-sm font-mono">{highlight.color}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white/70">Loading highlights...</p>
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Highlights</h1>
                  <p className="text-white/60 text-sm mt-1">Showcase your achievements and statistics</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Highlight
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
                {editingId ? 'Edit Highlight' : 'Add New Highlight'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all text-2xl text-center"
                      placeholder="🚀"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value as typeof formData.color })}
                      className="w-full h-[52px] rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="Projects Completed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Value
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="50"
                    required
                  />
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
              data={highlights}
              columns={columns}
              onEdit={handleEdit}
              onDelete={(highlight) => setDeleteId(highlight.id)}
            />
          </motion.div>

          {/* Delete Dialog */}
          <DeleteDialog
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Delete Highlight"
            description="Are you sure you want to delete this highlight? This action cannot be undone."
            itemName={highlights.find(h => h.id === deleteId)?.label || ''}
          />
        </>
      )}
    </div>
  );
}
