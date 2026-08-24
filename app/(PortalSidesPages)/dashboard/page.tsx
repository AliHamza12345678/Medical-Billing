'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { formatCurrency, timeAgo } from '@/lib/format';
import { dashboardData as fallbackStats } from '@/data/dashboard';
import {
  monthlyRevenue as fallbackMonthly,
  claimStatusBreakdown as fallbackStatus,
  revenueTrend as fallbackTrend,
  outstandingBuckets as fallbackBuckets,
  recentActivity as fallbackActivity,
} from '@/data/reports';

const iconMap: Record<string, typeof Users> = {
  Users, DollarSign, AlertCircle, FileText, CheckCircle, Clock, XCircle,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [bucketsData, setBucketsData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState({
    cleanClaimRate: '0.0%',
    denialRate: '0.0%',
    collectionRate: '0.0%',
    avgDaysInAR: '0 days',
  });
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardMetrics = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        if (Array.isArray(data.data.dashboardStats)) setStats(data.data.dashboardStats);
        if (Array.isArray(data.data.monthlyRevenue)) setMonthlyData(data.data.monthlyRevenue);
        if (Array.isArray(data.data.claimStatusBreakdown)) setStatusData(data.data.claimStatusBreakdown);
        if (Array.isArray(data.data.outstandingBuckets)) setBucketsData(data.data.outstandingBuckets);
        if (Array.isArray(data.data.revenueTrend)) setTrendData(data.data.revenueTrend);
        if (data.data.quickStats) setQuickStats(data.data.quickStats);
        if (Array.isArray(data.data.recentActivity)) setActivityData(data.data.recentActivity);
      }
    } catch (err) {
      console.error('[FETCH_DASHBOARD_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening at your practice today."
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
        {stats.slice(0, 4).map((stat, i) => (
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
        {stats.slice(4).map((stat, i) => (
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
              Live DB
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
                  data={monthlyData}
                  xKey="month"
                  areas={[{ key: 'revenue', color: 'hsl(var(--chart-1))', name: 'Revenue' }]}
                />
              </TabsContent>
              <TabsContent value="claims">
                <BarChartCard
                  data={monthlyData}
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
            <DonutChartCard data={statusData} height={260} />
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
              data={trendData}
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
              data={bucketsData}
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
              <CardDescription>Live metrics calculated from database</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 overflow-hidden">
            {[
              { label: 'Clean claim rate', value: quickStats.cleanClaimRate, trend: 'up', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Denial rate', value: quickStats.denialRate, trend: 'down', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Collection rate', value: quickStats.collectionRate, trend: 'up', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Days in A/R', value: quickStats.avgDaysInAR, trend: 'down', color: 'text-emerald-600 dark:text-emerald-400' },
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
            {activityData.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {(activity.actor || 'System').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
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
