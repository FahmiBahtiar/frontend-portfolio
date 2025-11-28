'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Plus, X, Save, Star, GitFork, GripVertical } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
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

export default function AircraftHangarPage() {
  const [hangarItems, setHangarItems] = useState<HangarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'github':
        return '🐙'; // GitHub icon
      case 'flight':
        return '✈️'; // Airplane icon
      case 'mountain':
        return '🏔️'; // Mountain icon
      default:
        return '✈️';
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/experience/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const result = await response.json();
      if (result.success) {
        // Sort by order
        const sortedItems = result.data.sort((a: HangarItem, b: HangarItem) => a.order - b.order);
        setHangarItems(sortedItems);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
      alert('Failed to load projects: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = hangarItems.findIndex((item) => item.id === active.id);
      const newIndex = hangarItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(hangarItems, oldIndex, newIndex);
      
      // Update order property for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      setHangarItems(updatedItems);

      // Save the new order to backend
      try {
        await Promise.all(
          updatedItems.map((item) =>
            fetch(`/api/admin/experience/projects/${item.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ order: item.order }),
            })
          )
        );
      } catch (error) {
        console.error('Error updating project order:', error);
        alert('Failed to update project order');
        // Revert on error
        fetchProjects();
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

    // Client-side validation
    if (!formData.name?.trim() || !formData.model?.trim() || !formData.classification?.trim() || !formData.description?.trim()) {
      alert('Please fill in all required fields: Name, Model, Classification, and Description');
      return;
    }

    try {
      const projectData = {
        category: formData.category,
        name: formData.name,
        model: formData.model,
        classification: formData.classification,
        description: formData.description,
        stats: formData.stats,
        specifications: formData.specifications,
        systems: formData.systems,
        url: formData.url,
        icon: formData.icon,
        color: formData.color,
        achievements: formData.achievements,
        order: formData.order || hangarItems.length + 1,
      };

      if (editingItem) {
        const response = await fetch(`/api/admin/experience/projects/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });
        if (response.ok) {
          await fetchProjects();
        } else {
          console.error('Failed to update project:', await response.text());
          alert('Failed to update project');
        }
      } else {
        const response = await fetch('/api/admin/experience/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });
        if (response.ok) {
          await fetchProjects();
        } else {
          console.error('Failed to create project:', await response.text());
          alert('Failed to create project');
        }
      }

      setIsFormOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = (item: HangarItem) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        const response = await fetch(`/api/admin/experience/projects/${deleteTarget.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchProjects();
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
      setDeleteTarget(null);
    }
  };

  const addSystem = (system: string) => {
    if (system.trim() && formData.systems) {
      setFormData({
        ...formData,
        systems: [...formData.systems, system.trim()],
      });
    }
  };

  const removeSystem = (index: number) => {
    if (formData.systems) {
      setFormData({
        ...formData,
        systems: formData.systems.filter((_, i) => i !== index),
      });
    }
  };

  const resetForm = () => {
    const defaultCategory = 'github';
    setFormData({
      category: defaultCategory,
      name: '',
      model: '',
      classification: '',
      description: '',
      icon: getIconForCategory(defaultCategory),
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
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading aircraft hangar...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-cyan-500/20 flex items-center justify-center">
                <Plane className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Aircraft Hangar</h1>
                <p className="text-white/60">Manage your projects and achievements</p>
              </div>
            </div>

            {/* Add Project Button */}
            <div className="ml-auto">
              <motion.button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/30 transition-all font-mono uppercase tracking-wider text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Sortable List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-4">
                <p className="text-white/60 text-sm">
                  Drag and drop to reorder projects
                </p>
              </div>

              {hangarItems.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  No projects found. Add your first project!
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={hangarItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {hangarItems.map((item) => (
                        <SortableHangarItem
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
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

                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border-b border-orange-500/30 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">
                            {editingItem ? 'Edit Project' : 'Add Project'}
                          </h2>
                          <p className="text-white/60">
                            {editingItem ? 'Update project information' : 'Add a new project to your hangar'}
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

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Category
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => {
                              const newCategory = e.target.value as any;
                              setFormData({ 
                                ...formData, 
                                category: newCategory,
                                icon: getIconForCategory(newCategory)
                              });
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            required
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Color
                          </label>
                          <select
                            value={formData.color}
                            onChange={(e) =>
                              setFormData({ ...formData, color: e.target.value as any })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            required
                          >
                            {colors.map((color) => (
                              <option key={color.value} value={color.value}>
                                {color.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          placeholder="e.g., react-dashboard-pro"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Model/Aircraft
                          </label>
                          <input
                            type="text"
                            value={formData.model}
                            onChange={(e) =>
                              setFormData({ ...formData, model: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="e.g., Boeing 787"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Classification
                          </label>
                          <input
                            type="text"
                            value={formData.classification}
                            onChange={(e) =>
                              setFormData({ ...formData, classification: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="e.g., Heavy Jet"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all resize-none"
                          placeholder="Project description..."
                          required
                        />
                      </div>

                      {formData.category === 'github' && (
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            GitHub URL
                          </label>
                          <input
                            type="url"
                            value={formData.url || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, url: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Technologies/Systems
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.systems?.map((system, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm"
                            >
                              {system}
                              <button
                                type="button"
                                onClick={() => removeSystem(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id="system-input"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
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
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('system-input') as HTMLInputElement;
                              addSystem(input.value);
                              input.value = '';
                            }}
                            className="px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
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
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all"
                        >
                          <Save className="w-5 h-5" />
                          <span>{editingItem ? 'Update' : 'Create'}</span>
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
            title="Delete Project"
            description="Are you sure you want to delete this project?"
            itemName={deleteTarget?.name}
          />
        </>
      )}
    </div>
  );
}

interface SortableHangarItemProps {
  item: HangarItem;
  onEdit: (item: HangarItem) => void;
  onDelete: (item: HangarItem) => void;
}

function SortableHangarItem({ item, onEdit, onDelete }: SortableHangarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'github':
        return '🐙';
      case 'flight':
        return '✈️';
      case 'mountain':
        return '🏔️';
      default:
        return '✈️';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-white/40 hover:text-white/60 transition-colors p-1"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="text-2xl">{getIconForCategory(item.category)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{item.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              item.category === 'github' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
              item.category === 'flight' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
              'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              {item.category}
            </span>
          </div>
          <p className="text-sm text-white/60 truncate">{item.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
            <span>{item.model}</span>
            {item.stats?.stars !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                {item.stats.stars}
              </span>
            )}
            {item.stats?.forks !== undefined && (
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3 text-cyan-400" />
                {item.stats.forks}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
