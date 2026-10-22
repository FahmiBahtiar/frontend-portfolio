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

    // Auto-commit technology system input if still has text
    const currentSystems = [...(formData.systems || [])];
    const systemInput = document.getElementById('system-input') as HTMLInputElement | null;
    if (systemInput && systemInput.value.trim()) {
      const typed = systemInput.value.trim();
      if (!currentSystems.includes(typed)) {
        currentSystems.push(typed);
      }
      systemInput.value = '';
    }

    if (!formData.name?.trim() || !formData.model?.trim() || !formData.classification?.trim() || !formData.description?.trim()) {
      alert('Mohon lengkapi field wajib: Project Name, Model/Aircraft, Classification, dan Description');
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        ...formData,
        systems: currentSystems,
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
            <div className="w-12 h-12 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shadow-sm">
              <Plane className="w-6 h-6 text-[#0891b2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0c282d]">Aircraft Hangar</h1>
              <p className="text-sm text-[#527d85] font-medium">Manage your projects and achievements</p>
            </div>
          </div>

          <Button onClick={handleCreate} className="bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </motion.div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-white border border-[#B9E7E6] shadow-sm text-[#0c282d]">
            <CardHeader className="border-b border-[#B9E7E6] pb-4">
              <CardTitle className="text-lg text-[#0c282d] font-bold">{editingItem ? 'Edit Project' : 'Add New Project'}</CardTitle>
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
                      className="w-full h-10 px-3 py-2 rounded-md bg-white border border-[#B9E7E6] text-sm text-[#0c282d] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-white text-[#0c282d]">{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white border border-[#B9E7E6] text-sm text-[#0c282d] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    >
                      {colors.map((color) => (
                        <option key={color.value} value={color.value} className="bg-white text-[#0c282d]">{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-white border border-[#B9E7E6]" placeholder="e.g., react-dashboard-pro" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Model/Aircraft</Label>
                    <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required className="bg-white border border-[#B9E7E6]" placeholder="e.g., Boeing 787" />
                  </div>
                  <div className="space-y-2">
                    <Label>Classification</Label>
                    <Input value={formData.classification} onChange={(e) => setFormData({ ...formData, classification: e.target.value })} required className="bg-white border border-[#B9E7E6]" placeholder="e.g., Heavy Jet" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-white border border-[#B9E7E6] resize-none" placeholder="Project description..." required />
                </div>

                {formData.category === 'github' && (
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input type="url" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="bg-white border border-[#B9E7E6]" placeholder="https://github.com/..." />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[#0c282d] font-bold">Technologies/Systems</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.systems?.map((system, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2F4F3] border border-[#B9E7E6] text-[#0c282d] font-semibold text-xs shadow-sm">
                        {system}
                        <button type="button" onClick={() => removeSystem(index)} className="text-red-500 hover:text-red-700 ml-1"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="system-input"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
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
                    }} className="bg-[#E2F4F3] border border-[#B9E7E6] text-[#0891b2] hover:bg-[#6FD4E1] hover:text-[#0c282d] font-bold shadow-sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-[#527d85] hover:text-[#0c282d] hover:bg-[#E2F4F3] font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold shadow-sm">
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
        <div className="bg-white border border-[#B9E7E6] shadow-sm text-[#0c282d] rounded-2xl p-6">
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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'github':
        return 'bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6] font-semibold';
      case 'flight':
        return 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold';
      case 'mountain':
        return 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold';
      default:
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border border-[#B9E7E6] rounded-2xl p-4 hover:bg-[#E2F4F3]/30 shadow-sm transition-all ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="text-[#527d85] hover:text-[#0c282d] transition-colors p-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="text-2xl">{getIconForCategory(item.category)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[#0c282d] truncate">{item.name}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs ${getCategoryBadge(item.category)}`}>
              {item.category}
            </span>
          </div>
          <p className="text-sm text-[#527d85] font-medium truncate">{item.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#527d85] font-medium">
            <span className="font-semibold text-[#0c282d]">{item.model}</span>
            {item.stats?.stars !== undefined && (
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{item.stats.stars}</span>
            )}
            {item.stats?.forks !== undefined && (
              <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-[#0891b2]" />{item.stats.forks}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="text-[#0891b2] hover:bg-[#E2F4F3] hover:text-[#0c282d] font-bold">
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
