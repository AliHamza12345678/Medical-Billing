'use client';

import { Lock, Check, ShieldCheck } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { roles, permissionGroups } from '@/data/users';

const roleMatrix = roles.filter((r) => !r.system || r.name === 'Administrator');

export default function AdminPermissionsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Permissions"
        description="Manage module-level access for each role"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Permissions' }]}
      />
      <Card>
        <CardHeader><CardTitle className="text-base">Permission Matrix</CardTitle><CardDescription>Check the permissions granted to each role per module</CardDescription></CardHeader>
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
                {permissionGroups.map((group) => (
                  <PermissionGroup key={group.module} group={group} roles={roleMatrix} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function PermissionGroup({ group, roles }: { group: typeof permissionGroups[number]; roles: typeof roleMatrix }) {
  return (
    <>
      <tr className="bg-muted/30">
        <td colSpan={roles.length + 1} className="p-3 font-semibold text-primary">{group.module}</td>
      </tr>
      {group.permissions.map((perm) => (
        <tr key={perm} className="border-b last:border-0">
          <td className="p-4 text-sm">{perm}</td>
          {roles.map((role) => {
            const has = role.permissions.includes('all') || role.permissions.includes(perm);
            return (
              <td key={role.id} className="p-4 text-center">
                {has ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Check className="h-3.5 w-3.5" /></span>
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground"><Lock className="h-3 w-3" /></span>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
