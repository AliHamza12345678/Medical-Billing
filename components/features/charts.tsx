'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  color: 'hsl(var(--popover-foreground))',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

interface AreaChartCardProps {
  data: any[];
  xKey: string;
  areas: { key: string; color: string; name: string }[];
  height?: number;
}

export function AreaChartCard({ data, xKey, areas, height = 280 }: AreaChartCardProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="w-full bg-muted/20 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 4, left: -8, bottom: 0 }}>
        <defs>
          {areas.map((a) => (
            <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={a.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={a.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={tooltipStyle} />
        {areas.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {areas.map((a) => (
          <Area
            key={a.key}
            type="monotone"
            dataKey={a.key}
            name={a.name}
            stroke={a.color}
            strokeWidth={2}
            fill={`url(#grad-${a.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarChartCardProps {
  data: any[];
  xKey: string;
  bars: { key: string; color: string; name: string }[];
  height?: number;
  horizontal?: boolean;
}

export function BarChartCard({ data, xKey, bars, height = 280, horizontal }: BarChartCardProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="w-full bg-muted/20 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 10, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={62} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={46} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineChartCardProps {
  data: any[];
  xKey: string;
  lines: { key: string; color: string; name: string }[];
  height?: number;
}

export function LineChartCard({ data, xKey, lines, height = 280 }: LineChartCardProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="w-full bg-muted/20 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={tooltipStyle} />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DonutChartCardProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
}

export function DonutChartCard({ data, height = 280, innerRadius = 60 }: DonutChartCardProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="w-full bg-muted/20 animate-pulse rounded-lg" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
