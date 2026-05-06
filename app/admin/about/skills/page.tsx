'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { Code2, Plus, Save, Loader2, X } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Skill {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Tools' | 'Other';
  proficiency: number;
  icon?: string;
  color: string;
  order: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  const json = await res.json();
  return json.data;
};

export default function SkillsPage() {
  const { data: rawSkills = [], mutate, isLoading, error } = useSWR('/api/admin/about/skills', fetcher);
  // Ensure skills is always an array
  const skills: Skill[] = Array.isArray(rawSkills) ? rawSkills : [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: 'Frontend',
    proficiency: 50,
    icon: '',
    color: '#06b6d4',
    order: 0,
  });

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other'];

  const filteredSkills = filterCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === filterCategory);

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id || (skill as any)._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon || '',
      color: skill.color,
      order: skill.order || 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/admin/about/skills/${deleteId}`, { method: 'DELETE' });
      if (response.ok) {
        await mutate(skills.filter(s => (s.id || (s as any)._id) !== deleteId), false);
      } else {
        alert('Failed to delete skill');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete skill');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        order: formData.order || skills.length + 1
      };

      if (editingId) {
        const response = await fetch(`/api/admin/about/skills/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update skill');
      } else {
        const response = await fetch('/api/admin/about/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to create skill');
      }

      await mutate();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Frontend',
      proficiency: 50,
      icon: '',
      color: '#06b6d4',
      order: 0,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const columns: Column<Skill>[] = [
    {
      key: 'icon',
      label: 'Icon',
      render: (skill: Skill) => (
        <span className="text-2xl">{skill.icon || '💻'}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (skill: Skill) => <span className="text-white font-medium">{skill.name}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (skill: Skill) => (
        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-medium">
          {skill.category}
        </span>
      ),
    },
    {
      key: 'proficiency',
      label: 'Proficiency',
      render: (skill: Skill) => (
        <div className="flex items-center gap-3 w-full max-w-[200px]">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${skill.proficiency}%`,
                backgroundColor: skill.color 
              }}
            />
          </div>
          <span className="text-white/80 text-sm font-medium w-12 text-right">
            {skill.proficiency}%
          </span>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load skills.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Code2 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Skills</h1>
            <p className="text-sm text-muted-foreground">Manage your technical skills and proficiencies</p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Skill
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">{editingId ? 'Edit Skill' : 'Add New Skill'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Skill Name</Label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="React"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Skill['category'] })}
                        className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        required
                      >
                        <option value="Frontend" className="bg-slate-900">Frontend</option>
                        <option value="Backend" className="bg-slate-900">Backend</option>
                        <option value="Database" className="bg-slate-900">Database</option>
                        <option value="DevOps" className="bg-slate-900">DevOps</option>
                        <option value="Tools" className="bg-slate-900">Tools</option>
                        <option value="Other" className="bg-slate-900">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Icon (Emoji)</Label>
                      <Input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="bg-white/5 border-white/10 text-xl text-center"
                        placeholder="⚛️"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex items-center gap-3 h-10">
                        <Input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-10 px-1 py-1 bg-white/5 border-white/10 cursor-pointer"
                          required
                        />
                        <Input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="flex-1 bg-white/5 border-white/10 uppercase"
                          placeholder="#06b6d4"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Proficiency: {formData.proficiency}%</Label>
                      <div className="pt-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.proficiency}
                          onChange={(e) => setFormData({ ...formData, proficiency: Number(e.target.value) })}
                          className="w-full"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.filter(c => c !== 'All').map((cat) => {
          const count = skills.filter(s => s.category === cat).length;
          return (
            <Card key={cat} className="bg-black/20 border-white/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <p className="text-muted-foreground text-sm mb-1">{cat}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
          <DataTable
            data={filteredSkills}
            columns={columns}
            onEdit={handleEdit}
            onDelete={(skill) => setDeleteId(skill.id || (skill as any)._id)}
            emptyMessage="No skills found."
          />
        </div>
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone."
        itemName={skills.find(s => (s.id || (s as any)._id) === deleteId)?.name || ''}
      />
    </div>
  );
}
