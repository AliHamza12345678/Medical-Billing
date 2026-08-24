'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { roles as fallbackRoles, permissionGroups as fallbackGroups } from '@/data/users';
import type { Role } from '@/types';

import { toast } from 'sonner';

export default function AdminPermissionsPage() {
  const [roleMatrix, setRoleMatrix] = useState<Role[]>([]);
  const [groups, setGroups] = useState(fallbackGroups);
  const [loading, setLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions'),
      ]);

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      if (rolesRes.ok && rolesData.success && Array.isArray(rolesData.data)) {
        setRoleMatrix(rolesData.data.filter((r: Role) => !r.system || r.name === 'Administrator'));
      } else {
        setRoleMatrix(fallbackRoles.filter((r) => !r.system || r.name === 'Administrator'));
      }

      if (permsRes.ok && permsData.success && Array.isArray(permsData.data)) {
        setGroups(permsData.data);
      }
    } catch (err) {
      console.error('[FETCH_PERMISSIONS_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTogglePermission = async (role: Role, permission: string) => {
    if (role.system && role.name === 'Administrator') {
      toast.info('Administrator permissions are fixed');
      return;
    }

    const currentPerms = role.permissions || [];
    const hasPerm = currentPerms.includes(permission);
    const updatedPerms = hasPerm
      ? currentPerms.filter((p) => p !== permission)
      : [...currentPerms, permission];

    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updatedPerms }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Permission '${permission}' ${hasPerm ? 'removed from' : 'granted to'} ${role.name}`);
        setRoleMatrix((prev) =>
          prev.map((r) => (r.id === role.id ? { ...r, permissions: updatedPerms } : r))
        );
      } else {
        toast.error('Failed to update permission', { description: data.error?.message });
      }
    } catch (err) {
      console.error('[TOGGLE_PERM_ERROR]', err);
      toast.error('Error', { description: 'Unexpected error updating permissions' });
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Permissions"
        description="Manage module-level access for each role"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Permissions' }]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Matrix</CardTitle>
          <CardDescription>Click icons to grant or revoke specific permissions for roles.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card p-4 text-left font-semibold">Permission</th>
                  {roleMatrix.map((role) => (
                    <th key={role.id} className="p-4 text-center font-semibold">{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <PermissionGroup key={group.module} group={group} roles={roleMatrix} onToggle={handleTogglePermission} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function PermissionGroup({
  group,
  roles,
  onToggle,
}: {
  group: typeof fallbackGroups[number];
  roles: Role[];
  onToggle: (role: Role, perm: string) => void;
}) {
  return (
    <>
      <tr className="bg-muted/30">
        <td colSpan={roles.length + 1} className="p-3 font-semibold text-primary">{group.module}</td>
      </tr>
      {group.permissions.map((perm) => (
        <tr key={perm} className="border-b last:border-0 hover:bg-muted/20">
          <td className="p-4 text-sm font-mono">{perm}</td>
          {roles.map((role) => {
            const has = role.permissions.includes('all') || role.permissions.includes(perm);
            return (
              <td key={role.id} className="p-4 text-center">
                <button
                  type="button"
                  onClick={() => onToggle(role, perm)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-95"
                  title={`Click to toggle ${perm} for ${role.name}`}
                >
                  {has ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
