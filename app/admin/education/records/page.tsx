'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Plus, X, Save, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { EducationService } from '@/lib/services/education';
import type { Education } from '@/lib/types/admin';

export default function EducationRecordsPage() {
  const [educationRecords, setEducationRecords] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Education | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);
  const [formData, setFormData] = useState<Partial<Education>>({
    degree: '',
    institution: '',
    period: '',
    gpa: '',
    color: 'cyan',
    description: '',
    order: 0,
  });

  const colors = [
    { value: 'cyan', label: 'Cyan' },
    { value: 'orange', label: 'Orange' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
  ];

  // Load education records
  useEffect(() => {
    const loadEducationRecords = async () => {
      try {
        setLoading(true);
        const data = await EducationService.getEducationRecords();
        setEducationRecords(data);
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    loadEducationRecords();
  }, []);

  const handleCreate = () => {
    setEditingRecord(null);
    setFormData({
      degree: '',
      institution: '',
      period: '',
      gpa: '',
      color: 'cyan',
      description: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (record: Education) => {
    setEditingRecord(record);
    setFormData(record);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingRecord) {
        const updatedRecord = await EducationService.updateEducationRecord(editingRecord.id, formData);
        setEducationRecords(
          educationRecords.map((record) =>
            record.id === editingRecord.id ? updatedRecord : record
          )
        );
      } else {
        const newRecord = await EducationService.createEducationRecord({
          ...formData,
          order: educationRecords.length + 1,
        } as Omit<Education, 'id' | 'createdAt' | 'updatedAt'>);
        setEducationRecords([...educationRecords, newRecord]);
      }
    } catch (error) {
      // Error handled by UI state
    } finally {
      setIsFormOpen(false);
      setEditingRecord(null);
      setSaving(false);
    }
  };

  const handleDelete = (record: Education) => {
    setDeleteTarget(record);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await EducationService.deleteEducationRecord(deleteTarget.id);
        setEducationRecords(educationRecords.filter((record) => record.id !== deleteTarget.id));
      } catch (error) {
        // Error handled by UI state
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  const columns = [
    {
      key: 'degree',
      label: 'Degree',
      sortable: true,
      render: (item: Education) => (
        <div>
          <div className="font-medium text-white">{item.degree}</div>
          <div className="text-sm text-white/60">{item.institution}</div>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Period',
      sortable: true,
    },
    {
      key: 'gpa',
      label: 'GPA/Grade',
      sortable: true,
      render: (item: Education) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
          {item.gpa}
        </span>
      ),
    },
    {
      key: 'color',
      label: 'Color',
      render: (item: Education) => (
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full bg-${item.color}-500`} />
          <span className="capitalize">{item.color}</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Education Records</h1>
            <p className="text-white/60">Manage your educational background</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={educationRecords}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          searchPlaceholder="Search education records..."
          emptyMessage="No education records found. Add your first record!"
        />
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
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {editingRecord ? 'Edit Education' : 'Add Education'}
                      </h2>
                      <p className="text-white/60">
                        {editingRecord ? 'Update education record' : 'Add a new education record'}
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Degree/Certification
                    </label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) =>
                        setFormData({ ...formData, degree: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="e.g., Bachelor of Computer Science"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) =>
                        setFormData({ ...formData, institution: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="e.g., University of Technology"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Period
                      </label>
                      <input
                        type="text"
                        value={formData.period}
                        onChange={(e) =>
                          setFormData({ ...formData, period: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        placeholder="e.g., 2020 - 2024"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        GPA/Grade
                      </label>
                      <input
                        type="text"
                        value={formData.gpa}
                        onChange={(e) =>
                          setFormData({ ...formData, gpa: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        placeholder="e.g., 3.85"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Theme Color
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
                      placeholder="Additional details about this education..."
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>{editingRecord ? 'Update' : 'Create'}</span>
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

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Education Record"
        description="Are you sure you want to delete this education record?"
        itemName={deleteTarget?.degree}
      />
    </div>
  );
}
