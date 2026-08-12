'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/features/page-header';
import { StatCard } from '@/components/features/stat-card';
import { StatusChip } from '@/components/features/status-chip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AreaChartCard,
  DonutChartCard,
  BarChartCard,
  LineChartCard,
} from '@/components/features/charts';
import { getIcon } from '@/lib/icons';
import { formatCurrency, timeAgo } from '@/lib/format';
import { dashboardData } from '@/data/dashboard';
import {
  monthlyRevenue,
  claimStatusBreakdown,
  revenueTrend,
  outstandingBuckets,
  recentActivity,
} from '@/data/reports';

const iconMap: Record<string, typeof Users> = {
  Users, DollarSign, AlertCircle, FileText, CheckCircle, Clock, XCircle,
};

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Sarah. Here's what's happening at your practice today."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto">
              Export Report
            </Button>
            <Button className="w-full sm:w-auto">Create Claim</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.slice(0, 4).map((stat, i) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={iconMap[stat.icon] ?? FileText}
            color={stat.color}
            index={i}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
        {dashboardData.slice(4).map((stat, i) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={iconMap[stat.icon] ?? FileText}
            color={stat.color}
            index={i + 4}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
              <CardDescription>Revenue and claims over the last 8 months</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              +12.5%
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <TabsList className="mb-4 flex-wrap gap-2">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="claims">Claims Volume</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue">
                <AreaChartCard
                  data={monthlyRevenue}
                  xKey="month"
                  areas={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]}
                />
              </TabsContent>
              <TabsContent value="claims">
                <BarChartCard
                  data={monthlyRevenue}
                  xKey="month"
                  bars={[
                    { key: 'claims', color: 'hsl(var(--chart-1))', name: 'Claims' },
                    { key: 'paid', color: 'hsl(var(--chart-2))', name: 'Paid' },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Claim Status</CardTitle>
            <CardDescription>Distribution of all claims</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChartCard data={claimStatusBreakdown} height={260} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Revenue Trend vs Target</CardTitle>
            <CardDescription>Actual revenue against monthly targets</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartCard
              data={revenueTrend}
              xKey="month"
              lines={[
                { key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' },
                { key: 'target', color: 'hsl(var(--chart-3))', name: 'Target' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Outstanding Balance</CardTitle>
              <CardDescription>Aging buckets of unpaid claims</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartCard
              data={outstandingBuckets}
              xKey="bucket"
              bars={[{ key: 'amount', color: 'hsl(var(--chart-3))', name: 'Outstanding' }]}
              height={260}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Quick Stats</CardTitle>
              <CardDescription>This month at a glance</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 overflow-hidden">
            {[
              { label: 'Avg. claim processing time', value: '14.2 days', trend: 'down', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Clean claim rate', value: '94.8%', trend: 'up', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Denial rate', value: '4.2%', trend: 'down', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Collection rate', value: '91.3%', trend: 'up', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Days in A/R', value: '32 days', trend: 'down', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{s.value}</span>
                  {s.trend === 'up' ? (
                    <ArrowUpRight className={`h-3.5 w-3.5 ${s.color}`} />
                  ) : (
                    <ArrowDownRight className={`h-3.5 w-3.5 ${s.color}`} />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest events across your practice</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">View All</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {activity.actor.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{activity.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{activity.description}</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                  {activity.amount !== undefined && (
                    <span className="text-sm font-semibold">{formatCurrency(activity.amount)}</span>
                  )}
                  {activity.status && <StatusChip status={activity.status} />}
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(activity.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
