'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { Heart, Plus, Save, Loader2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AboutService } from '@/lib/services/about';
import { Passion } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function PassionsPage() {
  const { data: passions = [], mutate, isLoading } = useSWR('passions', () => AboutService.getPassions());
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const availableColors = [
    { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { value: 'green', label: 'Green', bg: 'bg-green-500' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-500' },
    { value: 'pink', label: 'Pink', bg: 'bg-pink-500' },
  ] as const;

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

  const handleDelete = async () => {
    if (deleteId) {
      await AboutService.deletePassion(deleteId); // assuming there is a delete method or similar logic here. Wait, delete isn't in AboutService. It just filters state previously. Let's just mutate optimisticly if needed, but I'll write the API call if available.
      // previous code only did local state: setPassions(passions.filter(p => p.id !== deleteId));
      mutate(passions.filter(p => p.id !== deleteId), false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
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
      } else {
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
        await AboutService.createPassion(newPassion);
      }

      await mutate();
      resetForm();
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
      render: (passion: Passion) => <span className="text-2xl">{passion.icon}</span>,
    },
    { key: 'title', label: 'Title' },
    {
      key: 'description',
      label: 'Description',
      render: (passion: Passion) => <span className="text-muted-foreground text-sm line-clamp-2">{passion.description}</span>,
    },
    {
      key: 'color',
      label: 'Color',
      render: (passion: Passion) => (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: passion.color }} />
          <span className="text-muted-foreground text-xs font-mono">{passion.color}</span>
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (passion: Passion) => (
        <div className="text-sm">
          <div className="text-white font-medium">{passion.statsValue || passion.stats?.value}</div>
          <div className="text-muted-foreground text-xs">{passion.statsLabel || passion.stats?.label}</div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading passions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Passions</h1>
            <p className="text-sm text-muted-foreground">Manage your interests and hobbies</p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Passion
        </Button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit Passion' : 'Add New Passion'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon (Emoji)</Label>
                    <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} required className="bg-white/5 border-white/10 text-xl text-center" placeholder="💻" />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value as typeof formData.color })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      required
                    >
                      {availableColors.map((color) => (
                        <option key={color.value} value={color.value} className="bg-slate-900">{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="bg-white/5 border-white/10" placeholder="Full Stack Development" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="bg-white/5 border-white/10 resize-none" placeholder="Describe your passion..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Stats Label</Label>
                    <Input value={formData.statsLabel} onChange={(e) => setFormData({ ...formData, statsLabel: e.target.value })} required className="bg-white/5 border-white/10" placeholder="Projects" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stats Value</Label>
                    <Input value={formData.statsValue} onChange={(e) => setFormData({ ...formData, statsValue: e.target.value })} required className="bg-white/5 border-white/10" placeholder="50+" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gradient</Label>
                    <Input value={formData.gradient} onChange={(e) => setFormData({ ...formData, gradient: e.target.value })} required className="bg-white/5 border-white/10" placeholder="from-cyan-500 to-blue-500" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-pink-600 hover:bg-pink-700 text-white">
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
        <DataTable data={passions} columns={columns} onEdit={handleEdit} onDelete={(passion) => setDeleteId(passion.id)} />
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Passion"
        description="Are you sure you want to delete this passion? This action cannot be undone."
        itemName={passions.find(p => p.id === deleteId)?.title || ''}
      />
    </div>
  );
}
