'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { Radio, Plus, X, Save, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import type { ContactFrequency } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
};

export default function ContactPage() {
  const { data: contacts = [], mutate, isLoading, error } = useSWR<ContactFrequency[]>('/api/admin/contact-info', fetcher);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactFrequency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactFrequency | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ContactFrequency>>({
    frequency: '',
    label: '',
    value: '',
    icon: 'Mail',
    type: 'primary',
    color: 'from-cyan-500 to-blue-500',
    link: '',
  });

  const types = [
    { value: 'primary', label: 'Primary Contact' },
    { value: 'social', label: 'Social Media' },
  ];

  const icons = [
    { value: 'Mail', label: 'Mail' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Linkedin', label: 'LinkedIn' },
    { value: 'Github', label: 'GitHub' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Twitter', label: 'Twitter' },
  ];

  const colors = [
    { value: 'from-cyan-500 to-blue-500', label: 'Cyan to Blue' },
    { value: 'from-emerald-500 to-teal-500', label: 'Emerald to Teal' },
    { value: 'from-blue-600 to-blue-400', label: 'Blue' },
    { value: 'from-purple-600 to-pink-500', label: 'Purple to Pink' },
    { value: 'from-pink-600 to-orange-500', label: 'Pink to Orange' },
  ];

  const handleCreate = () => {
    setEditingContact(null);
    setFormData({
      frequency: '',
      label: '',
      value: '',
      icon: 'Mail',
      type: 'primary',
      color: 'from-cyan-500 to-blue-500',
      link: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (contact: ContactFrequency) => {
    setEditingContact(contact);
    setFormData(contact);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingContact) {
        const { id, createdAt, updatedAt, isActive, __v, ...updateData } = formData as any;
        const response = await fetch(`/api/admin/contact-info/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('Failed to update contact');
      } else {
        const response = await fetch('/api/admin/contact-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create contact');
      }
      
      await mutate();
      setIsFormOpen(false);
      setEditingContact(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (contact: ContactFrequency) => {
    setDeleteTarget(contact);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/admin/contact-info/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete contact');

      await mutate(contacts.filter(c => c.id !== deleteTarget.id), false);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete contact');
    }
  };

  const columns = [
    {
      key: 'frequency',
      label: 'Frequency',
      sortable: true,
      render: (item: ContactFrequency) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs font-bold">
          {item.frequency}
        </span>
      ),
    },
    {
      key: 'label',
      label: 'Label',
      sortable: true,
      render: (item: ContactFrequency) => (
        <span className="font-bold text-white">{item.label}</span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (item: ContactFrequency) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
          item.type === 'primary'
            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
            : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
        } font-medium capitalize`}>
          {item.type}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load contacts.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Radio className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Contact Information</h1>
              <p className="text-sm text-muted-foreground">Manage contact frequencies and social links</p>
            </div>
          </div>

          <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">{editingContact ? 'Edit Contact' : 'Add Contact'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Input
                        type="text"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="e.g., 121.5"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        required
                      >
                        {types.map((type) => (
                          <option key={type.value} value={type.value} className="bg-slate-900">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value.toUpperCase() })}
                        className="bg-white/5 border-white/10"
                        placeholder="e.g., EMAIL"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        type="text"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="e.g., email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        required
                      >
                        {icons.map((icon) => (
                          <option key={icon.value} value={icon.value} className="bg-slate-900">
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Color Gradient</Label>
                      <select
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        required
                      >
                        {colors.map((color) => (
                          <option key={color.value} value={color.value} className="bg-slate-900">
                            {color.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label>Link (Optional)</Label>
                      <Input
                        type="url"
                        value={formData.link || ''}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={submitting} className="text-muted-foreground hover:text-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700 text-white">
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingContact ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
          <DataTable
            data={contacts}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Search contacts..."
            emptyMessage="No contacts found."
          />
        </div>
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Contact"
        description="Are you sure you want to delete this contact method?"
        itemName={deleteTarget?.label}
      />
    </div>
  );
}
