'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Edit, Trash2, UserCog } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { DataTable } from '@/components/features/data-table';
import { StatusChip } from '@/components/features/status-chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { users as fallbackUsers } from '@/data/users';
import { formatDate, formatDateTime } from '@/lib/format';
import type { User } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'BillingManager' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setUserList(data.data);
      } else {
        setUserList(fallbackUsers);
      }
    } catch (err) {
      console.error('[FETCH_USERS_ERROR]', err);
      setUserList(fallbackUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'BillingManager' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, role: formData.role }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('User updated', { description: `User ${formData.name} updated successfully.` });
          setIsModalOpen(false);
          fetchUsers();
        } else {
          toast.error('Update failed', { description: data.error?.message });
        }
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('User created', { description: `User ${formData.name} created successfully.` });
          setIsModalOpen(false);
          fetchUsers();
        } else {
          toast.error('Creation failed', { description: data.error?.message });
        }
      }
    } catch (err) {
      console.error('[SAVE_USER_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error saving user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deactivated');
        setUserList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: 'Inactive' as const } : u))
        );
      }
    } catch (err) {
      console.error('[DEACTIVATE_USER_ERROR]', err);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={`${row.original.avatarColor || 'bg-blue-500'} text-xs font-semibold text-white`}>
              {row.original.name ? row.original.name.split(' ').map((n) => n[0]).join('') : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <span className="text-sm font-medium">{row.original.role}</span> },
    { accessorKey: 'lastLogin', header: 'Last Login', cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.lastLogin ? formatDateTime(String(row.original.lastLogin)) : 'Never'}</span> },
    { accessorKey: 'createdOn', header: 'Created', cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.createdOn ? formatDate(String(row.original.createdOn)) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusChip status={row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenEdit(row.original)}>
              <UserCog className="mr-2 h-4 w-4" /> Change Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDeactivateUser(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Users"
        description={`${userList.length} users in the system`}
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Users" value={String(userList.length)} />
        <StatBox label="Active" value={String(userList.filter((u) => u.status === 'Active').length)} />
        <StatBox label="Inactive" value={String(userList.filter((u) => u.status === 'Inactive').length)} />
        <StatBox label="Suspended" value={String(userList.filter((u) => u.status === 'Suspended').length)} />
      </div>
      <DataTable columns={columns} data={userList} searchKey="name" searchPlaceholder="Search users..." />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update role or profile details.' : 'Create a user account with assigned role.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Alex Morgan"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                required
                type="email"
                disabled={!!editingUser}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex.morgan@hospital.com"
              />
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="BillingManager">Billing Manager</SelectItem>
                  <SelectItem value="Coder">Coder</SelectItem>
                  <SelectItem value="FrontDesk">Front Desk</SelectItem>
                  <SelectItem value="Provider">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
