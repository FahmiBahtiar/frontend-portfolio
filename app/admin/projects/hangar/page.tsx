'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { Plane, Plus, X, Save, Star, GitFork, GripVertical, Loader2 } from 'lucide-react';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HangarItem } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch projects');
  const json = await res.json();
  if (!json.success) throw new Error('Failed to load projects');
  return json.data.sort((a: HangarItem, b: HangarItem) => (a.order || 0) - (b.order || 0));
};

export default function AircraftHangarPage() {
  const { data: hangarItems = [], mutate, isLoading, error } = useSWR<HangarItem[]>('/api/admin/experience/projects', fetcher);
  const [saving, setSaving] = useState(false);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'github': return '🐙';
      case 'flight': return '✈️';
      case 'mountain': return '🏔️';
      default: return '✈️';
    }
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HangarItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HangarItem | null>(null);
  const [formData, setFormData] = useState({
    category: 'github',
    name: '',
    model: '',
    classification: '',
    description: '',
    icon: getIconForCategory('github'),
    color: 'cyan',
    systems: [] as string[],
    specifications: {
      language: '',
      engine: '',
      maxSpeed: '',
      range: '',
      location: '',
      date: '',
      elevation: '',
    },
    stats: {},
    url: '',
    achievements: [] as string[],
    order: 0,
  });

  const categories = [
    { value: 'github', label: 'GitHub Project' },
    { value: 'flight', label: 'Flight Achievement' },
    { value: 'mountain', label: 'Mountain Achievement' },
  ];

  const colors = [
    { value: 'cyan', label: 'Cyan' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'blue', label: 'Blue' },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = hangarItems.findIndex((item) => item.id === active.id);
      const newIndex = hangarItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(hangarItems, oldIndex, newIndex);
      
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      mutate(updatedItems, false);

      try {
        await Promise.all(
          updatedItems.map((item) =>
            fetch(`/api/admin/experience/projects/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: item.order }),
            })
          )
        );
      } catch (err) {
        console.error('Error updating project order:', err);
        alert('Failed to update project order');
        mutate();
      }
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      category: 'github',
      name: '',
      model: '',
      classification: '',
      description: '',
      icon: '✈️',
      color: 'cyan',
      systems: [],
      specifications: {
        language: '', engine: '', maxSpeed: '', range: '',
        location: '', date: '', elevation: '',
      },
      stats: {},
      url: '',
      achievements: [],
      order: 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item: HangarItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      model: item.model,
      classification: item.classification,
      description: item.description,
      icon: item.icon,
      color: item.color,
      systems: item.systems || [],
      specifications: {
        language: item.specifications?.language || '',
        engine: item.specifications?.engine || '',
        maxSpeed: item.specifications?.maxSpeed || '',
        range: item.specifications?.range || '',
        location: item.specifications?.location || '',
        date: item.specifications?.date || '',
        elevation: item.specifications?.elevation || '',
      },
      stats: item.stats || {},
      url: item.url || '',
      achievements: item.achievements || [],
      order: item.order || 0,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim() || !formData.model?.trim() || !formData.classification?.trim() || !formData.description?.trim()) {
      alert('Please fill in all required fields: Name, Model, Classification, and Description');
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        ...formData,
        order: formData.order || hangarItems.length + 1,
      };

      if (editingItem) {
        const response = await fetch(`/api/admin/experience/projects/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Failed to update project');
      } else {
        const response = await fetch('/api/admin/experience/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Failed to create project');
      }

      await mutate();
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: HangarItem) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        const response = await fetch(`/api/admin/experience/projects/${deleteTarget.id}`, { method: 'DELETE' });
        if (response.ok) {
          mutate(hangarItems.filter((item) => item.id !== deleteTarget.id), false);
        }
      } catch (err) {
        console.error('Error deleting project:', err);
      }
      setDeleteTarget(null);
    }
  };

  const addSystem = (system: string) => {
    if (system.trim() && formData.systems) {
      setFormData({ ...formData, systems: [...formData.systems, system.trim()] });
    }
  };

  const removeSystem = (index: number) => {
    if (formData.systems) {
      setFormData({ ...formData, systems: formData.systems.filter((_, i) => i !== index) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading aircraft hangar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load projects.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Plane className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Aircraft Hangar</h1>
              <p className="text-sm text-muted-foreground">Manage your projects and achievements</p>
            </div>
          </div>

          <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </motion.div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">{editingItem ? 'Edit Project' : 'Add New Project'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setFormData({ ...formData, category: newCategory, icon: getIconForCategory(newCategory) });
                      }}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-slate-900">{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    >
                      {colors.map((color) => (
                        <option key={color.value} value={color.value} className="bg-slate-900">{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., react-dashboard-pro" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Model/Aircraft</Label>
                    <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Boeing 787" />
                  </div>
                  <div className="space-y-2">
                    <Label>Classification</Label>
                    <Input value={formData.classification} onChange={(e) => setFormData({ ...formData, classification: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Heavy Jet" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-white/5 border-white/10 resize-none" placeholder="Project description..." required />
                </div>

                {formData.category === 'github' && (
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input type="url" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="bg-white/5 border-white/10" placeholder="https://github.com/..." />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Technologies/Systems</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.systems?.map((system, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
                        {system}
                        <button type="button" onClick={() => removeSystem(index)} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="system-input"
                      className="bg-white/5 border-white/10"
                      placeholder="Add technology..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addSystem(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      const input = document.getElementById('system-input') as HTMLInputElement;
                      addSystem(input.value);
                      input.value = '';
                    }} className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
          <div className="mb-4">
            <p className="text-muted-foreground text-sm">Drag and drop to reorder projects</p>
          </div>

          {hangarItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No projects found. Add your first project!
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={hangarItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {hangarItems.map((item) => (
                    <SortableHangarItem key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project?"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}

interface SortableHangarItemProps {
  item: HangarItem;
  onEdit: (item: HangarItem) => void;
  onDelete: (item: HangarItem) => void;
}

function SortableHangarItem({ item, onEdit, onDelete }: SortableHangarItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'github': return '🐙';
      case 'flight': return '✈️';
      case 'mountain': return '🏔️';
      default: return '✈️';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="text-white/40 hover:text-white/60 transition-colors p-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="text-2xl">{getIconForCategory(item.category)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{item.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${item.category === 'github' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : item.category === 'flight' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {item.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
            <span>{item.model}</span>
            {item.stats?.stars !== undefined && (
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{item.stats.stars}</span>
            )}
            {item.stats?.forks !== undefined && (
              <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-cyan-400" />{item.stats.forks}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300">
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="text-red-400 hover:bg-red-500/20 hover:text-red-300">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
