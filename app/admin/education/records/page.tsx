'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { GraduationCap, Plus, Save, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { EducationService } from '@/lib/services/education';
import type { Education } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function EducationRecordsPage() {
  const { data: educationRecords = [], mutate, isLoading } = useSWR('education-records', () => EducationService.getEducationRecords());
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
        await EducationService.updateEducationRecord(editingRecord.id, formData);
      } else {
        await EducationService.createEducationRecord({
          ...formData,
          order: educationRecords.length + 1,
        } as Omit<Education, 'id' | 'createdAt' | 'updatedAt'>);
      }
      await mutate();
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (error) {
      alert('Failed to save education record');
    } finally {
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
        mutate(educationRecords.filter((record) => record.id !== deleteTarget.id), false);
      } catch (error) {
        alert('Failed to delete record');
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
          <div className="text-sm text-muted-foreground">{item.institution}</div>
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
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-xs">
          {item.gpa}
        </span>
      ),
    },
    {
      key: 'color',
      label: 'Theme',
      render: (item: Education) => (
        <span className="capitalize text-xs text-muted-foreground">{item.color}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading education records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Education Records</h1>
            <p className="text-sm text-muted-foreground">Manage your educational background</p>
          </div>
        </div>

        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Education
        </Button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">{editingRecord ? 'Edit Education' : 'Add New Education'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Degree/Certification</Label>
                    <Input value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., Bachelor of Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., University of Technology" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Input value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., 2020 - 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>GPA/Grade</Label>
                    <Input value={formData.gpa} onChange={(e) => setFormData({ ...formData, gpa: e.target.value })} required className="bg-white/5 border-white/10" placeholder="e.g., 3.85" />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme Color</Label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value as Education['color'] })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    >
                      {colors.map((color) => (
                        <option key={color.value} value={color.value} className="bg-slate-900">{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-white/5 border-white/10 resize-none" placeholder="Additional details..." />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingRecord ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={educationRecords}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="Search education records..."
          emptyMessage="No education records found. Add your first record!"
        />
      </motion.div>

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
