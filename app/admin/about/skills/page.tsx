'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Plus, Trash2, Save } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';

interface Skill {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Tools' | 'Other';
  proficiency: number; // 0-100
  icon?: string;
  color: string;
  order: number;
}

export default function SkillsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Mock data
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: '1',
      name: 'React',
      category: 'Frontend',
      proficiency: 95,
      icon: '⚛️',
      color: '#61dafb',
      order: 1,
    },
    {
      id: '2',
      name: 'Node.js',
      category: 'Backend',
      proficiency: 90,
      icon: '🟢',
      color: '#339933',
      order: 2,
    },
    {
      id: '3',
      name: 'PostgreSQL',
      category: 'Database',
      proficiency: 85,
      icon: '🐘',
      color: '#336791',
      order: 3,
    },
    {
      id: '4',
      name: 'Docker',
      category: 'DevOps',
      proficiency: 80,
      icon: '🐳',
      color: '#2496ed',
      order: 4,
    },
  ]);

  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: 'Frontend',
    proficiency: 50,
    icon: '',
    color: '#06b6d4',
    order: skills.length + 1,
  });

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other'];

  const filteredSkills = filterCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === filterCategory);

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon || '',
      color: skill.color,
      order: skill.order,
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      setSkills(skills.filter(s => s.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setSkills(skills.map(s =>
        s.id === editingId ? { ...formData, id: editingId } : s
      ));
    } else {
      const newSkill = {
        ...formData,
        id: Date.now().toString(),
      };
      setSkills([...skills, newSkill]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Frontend',
      proficiency: 50,
      icon: '',
      color: '#06b6d4',
      order: skills.length + 1,
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
    },
    {
      key: 'category',
      label: 'Category',
      render: (skill: Skill) => (
        <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs font-medium">
          {skill.category}
        </span>
      ),
    },
    {
      key: 'proficiency',
      label: 'Proficiency',
      render: (skill: Skill) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${skill.proficiency}%`,
                backgroundColor: skill.color 
              }}
            />
          </div>
          <span className="text-white/80 text-sm font-medium w-12">
            {skill.proficiency}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Skills</h1>
              <p className="text-white/60 text-sm mt-1">Manage your technical skills and proficiencies</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterCategory === cat
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Form */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            {editingId ? 'Edit Skill' : 'Add New Skill'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="React"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Skill['category'] })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  required
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

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
                  placeholder="⚛️"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-[52px] rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Proficiency: {formData.proficiency}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.proficiency}
                  onChange={(e) => setFormData({ ...formData, proficiency: Number(e.target.value) })}
                  className="w-full h-[52px]"
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
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.filter(c => c !== 'All').map((cat) => {
          const count = skills.filter(s => s.category === cat).length;
          return (
            <div key={cat} className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">{cat}</p>
              <p className="text-2xl font-bold text-white mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          data={filteredSkills}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(skill) => setDeleteId(skill.id)}
        />
      </motion.div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone."
        itemName={skills.find(s => s.id === deleteId)?.name || ''}
      />
    </div>
  );
}
