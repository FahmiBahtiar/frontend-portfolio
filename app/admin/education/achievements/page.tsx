'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { Award, Plus, Save, Loader2, Upload, Link as LinkIcon, GripVertical, FileText, Plane, Mountain, Code, X } from 'lucide-react';
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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EducationService } from '@/lib/services/education';
import type { Achievement } from '@/lib/types/admin';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  const { data: achievements = [], mutate, isLoading } = useSWR('achievements', () => EducationService.getAchievements());
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
      const { id, createdAt, updatedAt, ...dataToSend } = formData;
      if (!dataToSend.certificateUrl || dataToSend.certificateUrl.trim() === '') {
        delete dataToSend.certificateUrl;
      }
      if (!dataToSend.credentialUrl || dataToSend.credentialUrl.trim() === '') {
        delete dataToSend.credentialUrl;
      }
      if (dataToSend.order !== undefined) {
        dataToSend.order = Number(dataToSend.order);
      }

      if (editingAchievement) {
        await EducationService.updateAchievement(editingAchievement.id, dataToSend);
      } else {
        await EducationService.createAchievement({
          ...dataToSend,
          order: achievements.length + 1,
        } as Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>);
      }

      await mutate();
      localStorage.setItem('achievements_updated', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'achievements_updated',
        newValue: Date.now().toString()
      }));

      setIsFormOpen(false);
      setEditingAchievement(null);
    } catch (error) {
      alert('Failed to save achievement');
    } finally {
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
        mutate(achievements.filter((achievement) => achievement.id !== deleteTarget.id), false);
      } catch (error) {
        alert('Failed to delete achievement');
      } finally {
        setDeleteTarget(null);
      }
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

    if (!over || active.id === over.id) return;

    const categoryAchievements = achievements
      .filter(a => a.category === activeTab)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = categoryAchievements.findIndex((item) => item.id === active.id);
    const newIndex = categoryAchievements.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(categoryAchievements, oldIndex, newIndex);
    
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    const newAchievements = achievements.map(achievement => {
      if (achievement.category === activeTab) {
        return updatedItems.find(item => item.id === achievement.id) || achievement;
      }
      return achievement;
    });

    mutate(newAchievements, false);

    try {
      await Promise.all(
        updatedItems.map((item) =>
          EducationService.updateAchievement(item.id, { order: item.order })
        )
      );

      localStorage.setItem('achievements_updated', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'achievements_updated',
        newValue: Date.now().toString()
      }));
    } catch (error) {
      console.error('Failed to update order:', error);
      mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Achievements</h1>
              <p className="text-sm text-muted-foreground">Manage your certifications and awards</p>
            </div>
          </div>

          <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Achievement
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Developer', count: achievements.filter(a => a.category === 'developer').length, color: 'cyan' },
          { label: 'Aviation', count: achievements.filter(a => a.category === 'aviation').length, color: 'orange' },
          { label: 'Mountaineering', count: achievements.filter(a => a.category === 'mountaineering').length, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-black/20 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                <Award className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">{editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      required
                    >
                      {categories.filter(c => c.value !== 'all').map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-slate-900">{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      required
                    >
                      {icons.map((icon) => (
                        <option key={icon.value} value={icon.value} className="bg-slate-900">{icon.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Full Stack Development Certification" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issuer</Label>
                    <Input value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Tech Academy" />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., 2023" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-white/5 border-white/10 resize-none" placeholder="Additional details..." />
                </div>

                <div className="space-y-2">
                  <Label>Certificate (Optional)</Label>
                  <div className="flex gap-2 mb-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setCertificateUploadMode('url')} className={certificateUploadMode === 'url' ? 'bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500/30' : 'bg-transparent border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white'}>
                      <LinkIcon className="w-4 h-4 mr-2" /> URL
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setCertificateUploadMode('upload')} className={certificateUploadMode === 'upload' ? 'bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500/30' : 'bg-transparent border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white'}>
                      <Upload className="w-4 h-4 mr-2" /> Upload
                    </Button>
                  </div>

                  {certificateUploadMode === 'url' && (
                    <Input type="url" value={formData.certificateUrl || ''} onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })} className="bg-white/5 border-white/10" placeholder="https://..." />
                  )}

                  {certificateUploadMode === 'upload' && (
                    <ImageUpload key={`upload-${certificateUploadMode}`} value={formData.certificateUrl || ''} onChange={(url) => setFormData({ ...formData, certificateUrl: url })} onUploadStateChange={setIsUploading} label="" description="Upload certificate image" aspectRatio="16/9" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Credential URL (Optional)</Label>
                  <Input type="url" value={formData.credentialUrl || ''} onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })} className="bg-white/5 border-white/10" placeholder="https://..." />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || isUploading} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isUploading ? <Upload className="w-4 h-4 mr-2 animate-pulse" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingAchievement ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
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
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  isActive ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30` : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? `bg-${tab.color}-500/30 text-${tab.color}-300` : 'bg-white/10 text-white/50'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {(() => {
            const categoryAchievements = achievements
              .filter(a => a.category === activeTab)
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            const getCategoryColor = (category: string) => {
              const colors: Record<string, string> = { developer: 'cyan', aviation: 'orange', mountaineering: 'green', other: 'purple' };
              return colors[category] || 'gray';
            };

            const color = getCategoryColor(activeTab);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-white capitalize">{activeTab} Achievements</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 font-medium`}>
                      {categoryAchievements.length} items
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">Drag to reorder</p>
                </div>

                {categoryAchievements.length === 0 ? (
                  <div className="text-center py-12 px-6 rounded-xl border-2 border-dashed border-white/10 bg-black/20">
                    <Award className="w-10 h-10 text-white/20 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No achievements in this category</p>
                    <p className="text-xs text-white/40">Add your first achievement to get started</p>
                  </div>
                ) : (
                  <SortableContext items={categoryAchievements.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {categoryAchievements.map((achievement) => (
                        <SortableAchievementItem key={achievement.id} achievement={achievement} onEdit={handleEdit} onDelete={handleDelete} />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            );
          })()}
        </DndContext>
      </motion.div>

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
