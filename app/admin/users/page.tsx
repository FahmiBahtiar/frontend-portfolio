'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, X, Save, Shield, Mail, User as UserIcon } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';

interface AuthorizedUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// DataTable compatible format
interface UserTableItem extends AuthorizedUser {
  id: string; // Map from _id for DataTable compatibility
}

export default function AuthorizedUsersPage() {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthorizedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthorizedUser | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'editor' as 'admin' | 'editor',
    isActive: true,
  });

  // Transform users to include id field for DataTable
  const tableData: UserTableItem[] = users.map(user => ({
    ...user,
    id: user._id,
  }));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      role: 'editor',
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (user: AuthorizedUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.name.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        const response = await fetch(`/api/admin/auth/users/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            isActive: formData.isActive,
          }),
        });

        if (response.ok) {
          await fetchUsers();
          setIsFormOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to update user');
        }
      } else {
        const response = await fetch('/api/admin/auth/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          await fetchUsers();
          setIsFormOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleDelete = (user: AuthorizedUser) => {
    setDeleteTarget(user);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        const response = await fetch(`/api/admin/auth/users/${deleteTarget._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchUsers();
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'editor',
      isActive: true,
    });
    setEditingUser(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (user: UserTableItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
            <UserIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-sm text-white/60">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user: UserTableItem) => (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            user.role === 'admin'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {user.role}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (user: UserTableItem) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.isActive
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user: UserTableItem) => (
        <span className="text-sm text-white/60">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Never'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading users...</div>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Authorized Users</h1>
                <p className="text-white/60">Manage admin panel access</p>
              </div>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DataTable
              data={tableData}
              columns={columns}
              onEdit={(item) => {
                const user = users.find(u => u._id === item.id);
                if (user) handleEdit(user);
              }}
              onDelete={(item) => {
                const user = users.find(u => u._id === item.id);
                if (user) handleDelete(user);
              }}
              onCreate={handleCreate}
              searchPlaceholder="Search users..."
              emptyMessage="No authorized users found. Add your first user!"
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
                    className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-cyan-500/30 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">
                            {editingUser ? 'Edit User' : 'Add Authorized User'}
                          </h2>
                          <p className="text-white/60">
                            {editingUser
                              ? 'Update user information'
                              : 'Add a new user to the authorized list'}
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
                          Email (Google Account)
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            disabled={!!editingUser}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="user@gmail.com"
                            required
                          />
                        </div>
                        {editingUser && (
                          <p className="text-xs text-white/40 mt-1">
                            Email cannot be changed
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Role
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as 'admin' | 'editor',
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="w-5 h-5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500/50"
                        />
                        <label htmlFor="isActive" className="text-white cursor-pointer">
                          Active (can sign in)
                        </label>
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
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                        >
                          <Save className="w-5 h-5" />
                          <span>{editingUser ? 'Update' : 'Add User'}</span>
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
            title="Delete User"
            description="Are you sure you want to remove this user's access?"
            itemName={deleteTarget?.name}
          />
        </>
      )}
    </div>
  );
}
