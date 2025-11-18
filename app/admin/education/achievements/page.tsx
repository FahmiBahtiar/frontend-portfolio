'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Plus, X, Save, Filter, Loader2, Upload, Link, GripVertical, FileText, Plane, Mountain, Code } from 'lucide-react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EducationService } from '@/lib/services/education';
import type { Achievement } from '@/lib/types/admin';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface SortableAchievementItemProps {
  achievement: Achievement;
  onEdit: (achievement: Achievement) => void;
  onDelete: (achievement: Achievement) => void;
}

function SortableAchievementItem({ achievement, onEdit, onDelete }: SortableAchievementItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: achievement.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      developer: 'cyan',
      aviation: 'orange',
      mountaineering: 'green',
      other: 'purple',
    };
    return colors[category] || 'gray';
  };

  const color = getCategoryColor(achievement.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
        >
          <GripVertical className="w-4 h-4 text-white/40" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white">{achievement.title}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-xs font-medium capitalize`}>
              {achievement.category}
            </span>
          </div>
          <p className="text-white/60 text-sm">{achievement.issuer}</p>
          <p className="text-white/40 text-xs">{achievement.date}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(achievement)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Award className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(achievement)}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<string>('developer');
  const [certificateUploadMode, setCertificateUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Achievement>>({
    category: 'developer',
    title: '',
    issuer: '',
    date: '',
    icon: 'Award',
    description: '',
    certificateUrl: '',
    credentialUrl: '',
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
    setCertificateUploadMode('url');
    setIsUploading(false);
    setFormData({
      category: 'developer',
      title: '',
      issuer: '',
      date: '',
      icon: 'Award',
      description: '',
      certificateUrl: '',
      credentialUrl: '',
      order: 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    // Filter out MongoDB internal fields and unwanted fields
    const achievementData = achievement as any;
    const { _id, __v, createdAt, updatedAt, ...cleanAchievement } = achievementData;
    setFormData({
      ...cleanAchievement,
      certificateUrl: achievement.certificateUrl || '',
    });
    setCertificateUploadMode(achievement.certificateUrl ? 'upload' : 'url');
    setIsUploading(false);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data to send, filtering out empty certificateUrl and unwanted fields
      const { id, createdAt, updatedAt, ...dataToSend } = formData;
      if (!dataToSend.certificateUrl || dataToSend.certificateUrl.trim() === '') {
        delete dataToSend.certificateUrl;
      }
      if (!dataToSend.credentialUrl || dataToSend.credentialUrl.trim() === '') {
        delete dataToSend.credentialUrl;
      }
      
      // Ensure order is a number
      if (dataToSend.order !== undefined) {
        dataToSend.order = Number(dataToSend.order);
      }

      console.log('Data to send:', dataToSend); // Debug log

      if (editingAchievement) {
        const updatedAchievement = await EducationService.updateAchievement(editingAchievement.id, dataToSend);
        setAchievements(
          achievements.map((achievement) =>
            achievement.id === editingAchievement.id ? updatedAchievement : achievement
          )
        );
        // Notify frontend to refresh data
        localStorage.setItem('achievements_updated', Date.now().toString());
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'achievements_updated',
          newValue: Date.now().toString()
        }));
      } else {
        const { id, createdAt, updatedAt, ...createData } = formData;
        if (!createData.certificateUrl || createData.certificateUrl.trim() === '') {
          delete createData.certificateUrl;
        }
        if (!createData.credentialUrl || createData.credentialUrl.trim() === '') {
          delete createData.credentialUrl;
        }
        if (createData.order !== undefined) {
          createData.order = Number(createData.order);
        }
        const newAchievement = await EducationService.createAchievement({
          ...createData,
          order: achievements.length + 1,
        } as Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>);
        setAchievements([...achievements, newAchievement]);
        // Notify frontend to refresh data
        localStorage.setItem('achievements_updated', Date.now().toString());
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'achievements_updated',
          newValue: Date.now().toString()
        }));
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
  const filteredAchievements = achievements; // No longer filtering, showing all achievements

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      developer: 'cyan',
      aviation: 'orange',
      mountaineering: 'green',
    };
    return colors[category] || 'gray';
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the category and items
    const categoryAchievements = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<string, Achievement[]>);

    // Find which category the items belong to
    let sourceCategory = '';
    let sourceIndex = -1;
    let targetIndex = -1;

    for (const [category, items] of Object.entries(categoryAchievements)) {
      const activeIndex = items.findIndex(item => item.id === activeId);
      const overIndex = items.findIndex(item => item.id === overId);

      if (activeIndex !== -1) {
        sourceCategory = category;
        sourceIndex = activeIndex;
      }
      if (overIndex !== -1) {
        targetIndex = overIndex;
      }
    }

    if (sourceCategory && sourceIndex !== -1 && targetIndex !== -1) {
      const categoryItems = categoryAchievements[sourceCategory];
      const reorderedItems = arrayMove(categoryItems, sourceIndex, targetIndex);

      // Update order in database
      try {
        await Promise.all(
          reorderedItems.map((item, index) =>
            EducationService.updateAchievement(item.id, { order: index + 1 })
          )
        );

        // Reload data from server to ensure consistency
        const data = await EducationService.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to update order:', error);
      }
    }
  };

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
              <p className="text-white/60">Manage your certifications and awards with drag & drop reordering</p>
            </div>
          </div>

          <motion.button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Achievement
          </motion.button>
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

      {/* Achievements by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
          {[
            { id: 'developer', label: 'Developer', icon: Code, color: 'cyan' },
            { id: 'aviation', label: 'Aviation', icon: Plane, color: 'orange' },
            { id: 'mountaineering', label: 'Mountaineering', icon: Mountain, color: 'green' },
            { id: 'other', label: 'Other', icon: FileText, color: 'purple' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = achievements.filter(a => a.category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? `bg-${tab.color}-500/30 text-${tab.color}-300`
                    : 'bg-white/10 text-white/50'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievements List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {(() => {
            const categoryAchievements = achievements
              .filter(a => a.category === activeTab)
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            const getCategoryColor = (category: string) => {
              const colors: Record<string, string> = {
                developer: 'cyan',
                aviation: 'orange',
                mountaineering: 'green',
                other: 'purple',
              };
              return colors[category] || 'gray';
            };

            const color = getCategoryColor(activeTab);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white capitalize">{activeTab} Achievements</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 font-medium`}>
                      {categoryAchievements.length} items
                    </span>
                  </div>
                  <p className="text-white/50 text-sm">Drag to reorder</p>
                </div>

                {categoryAchievements.length === 0 ? (
                  <div className="text-center py-12 px-6 rounded-xl border-2 border-dashed border-white/10 bg-white/5">
                    <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-2">No achievements in this category</p>
                    <p className="text-white/40 text-sm">Add your first achievement to get started</p>
                  </div>
                ) : (
                  <SortableContext items={categoryAchievements.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {categoryAchievements.map((achievement) => (
                        <SortableAchievementItem
                          key={achievement.id}
                          achievement={achievement}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            );
          })()}
        </DndContext>
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                      Certificate (Optional)
                    </label>
                    
                    {/* Toggle between URL and Upload */}
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setCertificateUploadMode('url')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          certificateUploadMode === 'url'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Link className="w-4 h-4" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setCertificateUploadMode('upload')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          certificateUploadMode === 'upload'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    </div>

                    {/* URL Input */}
                    {certificateUploadMode === 'url' && (
                      <input
                        type="url"
                        value={formData.certificateUrl || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, certificateUrl: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        placeholder="https://..."
                      />
                    )}

                    {/* Image Upload */}
                    {certificateUploadMode === 'upload' && (
                      <ImageUpload
                        key={`upload-${certificateUploadMode}`}
                        value={formData.certificateUrl || ''}
                        onChange={(url) => setFormData({ ...formData, certificateUrl: url })}
                        onUploadStateChange={setIsUploading}
                        label=""
                        description="Upload certificate image"
                        aspectRatio="16/9"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Credential URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.credentialUrl || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, credentialUrl: e.target.value })
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
                      disabled={saving || isUploading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : isUploading ? (
                        <>
                          <Upload className="w-5 h-5 animate-pulse" />
                          <span>Uploading...</span>
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
