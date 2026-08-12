'use client';

import * as React from 'react';
import { Plus, KeyRound, MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { roles } from '@/data/users';
import type { Role } from '@/types';

export default function AdminRolesPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Roles"
        description="Define roles and their permission sets"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Admin', href: '/admin' }, { label: 'Roles' }]}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add Role</Button>}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </DashboardShell>
  );
}

function RoleCard({ role }: { role: Role }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-5 w-5" /></div>
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
          <Button variant="outline" size="sm" className="flex-1"><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
          {!role.system && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
        </div>
      </CardContent>
    </Card>
  );
}
