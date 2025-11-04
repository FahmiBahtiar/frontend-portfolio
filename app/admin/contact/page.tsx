'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Plus, X, Save, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import type { ContactFrequency } from '@/lib/types/admin';

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/contact-info');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

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
        // Update existing contact
        const response = await fetch(`/api/admin/contact-info/${editingContact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update contact');
        }

        const updatedContact = await response.json();
        setContacts(contacts.map(contact =>
          contact.id === editingContact.id ? (Array.isArray(updatedContact) ? updatedContact[0] : updatedContact) : contact
        ));
      } else {
        // Create new contact
        const response = await fetch('/api/admin/contact-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create contact');
        }

        const newContact = await response.json();
        setContacts([...contacts, Array.isArray(newContact) ? newContact[0] : newContact]);
      }

      setIsFormOpen(false);
      setEditingContact(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
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

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(contacts.filter(contact => contact.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const columns = [
    {
      key: 'frequency',
      label: 'Frequency',
      sortable: true,
      render: (item: ContactFrequency) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono font-bold">
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full ${
          item.type === 'primary'
            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
            : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
        } font-medium capitalize`}>
          {item.type}
        </span>
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

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
        <p className="text-white/60">{error}</p>
        <button
          onClick={fetchContacts}
          className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-all"
        >
          Retry
        </button>
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-cyan-500/20 flex items-center justify-center">
            <Radio className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contact Information</h1>
            <p className="text-white/60">Manage contact frequencies and social links</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchContacts}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={contacts}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          searchPlaceholder="Search contacts..."
          emptyMessage={loading ? "Loading contacts..." : "No contacts found. Add your first contact!"}
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
                <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border-b border-orange-500/30 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {editingContact ? 'Edit Contact' : 'Add Contact'}
                      </h2>
                      <p className="text-white/60">
                        {editingContact ? 'Update contact information' : 'Add a new contact method'}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({ ...formData, frequency: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        placeholder="e.g., 121.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as any })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        required
                      >
                        {types.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value.toUpperCase() })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="e.g., EMAIL"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Value
                    </label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="e.g., email@example.com"
                      required
                    />
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

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Color Gradient
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
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
                      Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.link || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      disabled={submitting}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>{editingContact ? 'Update' : 'Create'}</span>
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
        title="Delete Contact"
        description="Are you sure you want to delete this contact method?"
        itemName={deleteTarget?.label}
      />
    </div>
  );
}
