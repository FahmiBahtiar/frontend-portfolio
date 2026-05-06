'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { Star, Plus, Save, Loader2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AboutService } from '@/lib/services/about';
import { Highlight } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function HighlightsPage() {
  const { data: highlights = [], mutate, isLoading } = useSWR('highlights', () => AboutService.getHighlights());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    icon: '',
    label: '',
    value: '',
    color: 'cyan' as 'cyan' | 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'pink',
    order: 0,
  });

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
      mutate(highlights.filter(h => h.id !== deleteId), false);
      setDeleteId(null);
    } catch (error) {
      alert('Failed to delete highlight');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        icon: formData.icon,
        label: formData.label,
        value: formData.value,
        color: formData.color,
        order: formData.order,
      };

      if (editingId) {
        await AboutService.updateHighlight(editingId, payload);
      } else {
        await AboutService.createHighlight(payload);
      }

      await mutate();
      resetForm();
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
      render: (highlight: Highlight) => <span className="text-2xl">{highlight.icon}</span>,
    },
    { key: 'label', label: 'Label' },
    {
      key: 'value',
      label: 'Value',
      render: (highlight: Highlight) => <span className="text-white font-bold">{highlight.value}</span>,
    },
    {
      key: 'color',
      label: 'Color',
      render: (highlight: Highlight) => (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: highlight.color }} />
          <span className="text-muted-foreground text-xs font-mono">{highlight.color}</span>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading highlights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Highlights</h1>
            <p className="text-sm text-muted-foreground">Showcase your key achievements and statistics</p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Highlight
        </Button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit Highlight' : 'Add New Highlight'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon (Emoji)</Label>
                    <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} required className="bg-white/5 border-white/10 text-xl text-center" placeholder="🚀" />
                  </div>
                  <div className="space-y-2">
                    <Label>Color (Hex)</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={formData.color.startsWith('#') ? formData.color : '#06b6d4'} onChange={(e) => setFormData({ ...formData, color: e.target.value as any })} className="w-12 h-10 rounded-md bg-white/5 border border-white/10 cursor-pointer" required />
                      <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value as any })} className="flex-1 bg-white/5 border-white/10" placeholder="#06b6d4 or cyan" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} required className="bg-white/5 border-white/10" placeholder="Projects Completed" />
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} required className="bg-white/5 border-white/10" placeholder="50" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable data={highlights} columns={columns} onEdit={handleEdit} onDelete={(highlight) => setDeleteId(highlight.id)} />
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Highlight"
        description="Are you sure you want to delete this highlight? This action cannot be undone."
        itemName={highlights.find(h => h.id === deleteId)?.label || ''}
      />
    </div>
  );
}
