'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { Users, Plus, X, Save, Shield, Mail, User as UserIcon, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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

interface UserTableItem extends AuthorizedUser {
  id: string; // Map from _id for DataTable compatibility
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  const json = await res.json();
  if (!json.success) throw new Error('Failed to load users');
  return json.data;
};

export default function AuthorizedUsersPage() {
  const { data: users = [], mutate, isLoading, error } = useSWR<AuthorizedUser[]>('/api/admin/auth/users', fetcher);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthorizedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthorizedUser | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'editor' as 'admin' | 'editor',
    isActive: true,
  });

  const tableData: UserTableItem[] = users.map(user => ({
    ...user,
    id: user._id,
  }));

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

    setSaving(true);
    try {
      if (editingUser) {
        const response = await fetch(`/api/admin/auth/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            isActive: formData.isActive,
          }),
        });

        if (response.ok) {
          await mutate();
          setIsFormOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to update user');
        }
      } else {
        const response = await fetch('/api/admin/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          await mutate();
          setIsFormOpen(false);
          resetForm();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to create user');
        }
      }
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        const response = await fetch(`/api/admin/auth/users/${deleteTarget._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await mutate(users.filter(u => u._id !== deleteTarget._id), false);
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
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
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <UserIcon className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
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
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
        <span className="text-sm text-muted-foreground">
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load users.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Authorized Users</h1>
              <p className="text-sm text-muted-foreground">Manage admin panel access</p>
            </div>
          </div>

          <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">{editingUser ? 'Edit User' : 'Add Authorized User'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Email (Google Account)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!!editingUser}
                        className="pl-9 bg-white/5 border-white/10 disabled:opacity-50"
                        placeholder="user@gmail.com"
                        required
                      />
                    </div>
                    {editingUser && <p className="text-xs text-muted-foreground">Email cannot be changed</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-9 bg-white/5 border-white/10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      <option value="editor" className="bg-slate-900">Editor</option>
                      <option value="admin" className="bg-slate-900">Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="isActive" 
                      checked={formData.isActive}
                      onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
                      className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                    >
                      Active (can sign in)
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingUser ? 'Update' : 'Add User'}
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
            data={tableData}
            columns={columns}
            onEdit={(item) => {
              const user = users.find(u => u._id === item.id);
              if (user) handleEdit(user);
            }}
            onDelete={(item) => {
              const user = users.find(u => u._id === item.id);
              if (user) setDeleteTarget(user);
            }}
            searchPlaceholder="Search users..."
            emptyMessage="No authorized users found."
          />
        </div>
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to remove this user's access?"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
