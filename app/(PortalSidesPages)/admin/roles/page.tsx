'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Plus, KeyRound, Edit, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { roles as fallbackRoles } from '@/data/users';
import type { Role } from '@/types';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminRolesPage() {
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: 'patients.view, claims.view' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRoleList(data.data);
      } else {
        setRoleList(fallbackRoles);
      }
    } catch (err) {
      console.error('[FETCH_ROLES_ERROR]', err);
      setRoleList(fallbackRoles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: 'patients.view, claims.view' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description, permissions: role.permissions.join(', ') });
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const permissionsArray = formData.permissions.split(',').map((p) => p.trim()).filter(Boolean);
    try {
      if (editingRole) {
        const res = await fetch(`/api/admin/roles/${editingRole.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, description: formData.description, permissions: permissionsArray }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('Role updated');
          setIsModalOpen(false);
          fetchRoles();
        } else {
          toast.error('Update failed', { description: data.error?.message });
        }
      } else {
        const res = await fetch('/api/admin/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, description: formData.description, permissions: permissionsArray }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('Role created');
          setIsModalOpen(false);
          fetchRoles();
        } else {
          toast.error('Creation failed', { description: data.error?.message });
        }
      }
    } catch (err) {
      console.error('[SAVE_ROLE_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error saving role' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Role deleted');
        setRoleList((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('[DELETE_ROLE_ERROR]', err);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Roles"
        description="Define roles and their permission sets"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Roles' }]}
        actions={
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Role
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roleList.map((role) => (
          <RoleCard key={role.id} role={role} onEdit={handleOpenEdit} onDelete={handleDeleteRole} />
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>Define system permission access for this role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRole} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Role Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Senior Auditor"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Can audit and approve claims and billing ledgers"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Permissions (comma separated)</Label>
              <Input
                required
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                placeholder="claims.view, claims.edit, reports.view"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function RoleCard({ role, onEdit, onDelete }: { role: Role; onEdit: (role: Role) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{role.name}</CardTitle>
            <CardDescription className="mt-1">{role.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{role.usersCount} user{role.usersCount !== 1 ? 's' : ''} assigned</span>
          {role.system && <Badge variant="secondary" className="text-xs">System</Badge>}
        </div>
        <Separator className="mb-4" />
        <div className="mb-4 flex flex-wrap gap-1.5">
          {role.permissions.slice(0, 6).map((p) => (
            <span key={p} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{p}</span>
          ))}
          {role.permissions.length > 6 && <span className="px-1 py-0.5 text-xs text-muted-foreground">+{role.permissions.length - 6} more</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(role)}>
            <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          {!role.system && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(role.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
