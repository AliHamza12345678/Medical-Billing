'use client';

import * as React from 'react';
import { Download, FileText } from 'lucide-react';
import { PortalLayout } from '@/components/layout/portal-layout';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { portalStatements } from '@/data/dashboard';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PortalStatementsPage() {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? portalStatements : portalStatements.filter((s) => s.status === filter);

  return (
    <PortalLayout>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Billing Statements</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {filtered.map((stmt) => (
          <Card key={stmt.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold">{stmt.period} Statement</p>
                  <p className="text-xs text-muted-foreground">Generated {formatDate(stmt.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm"><span className="text-muted-foreground">Charges:</span> {formatCurrency(stmt.charges)}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Payments:</span> <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(stmt.payments)}</span></p>
                </div>
                <div className={stmt.balance > 0 ? 'text-right' : 'text-right'}>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className={`font-bold ${stmt.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{formatCurrency(stmt.balance)}</p>
                </div>
                <StatusChip status={stmt.status} />
                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalLayout>
  );
}
