'use client';

import * as React from 'react';
import {
  ChevronDown,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  Users,
  UserPlus,
  List,
  ShieldCheck,
  Building2,
  BadgeCheck,
  FileCheck,
  Calculator,
  ClipboardList,
  Stethoscope,
  FileText,
  FilePlus,
  CreditCard,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
  BarChart3,
  TrendingUp,
  Hourglass,
  Settings,
  KeyRound,
  Lock,
  Hash,
  DollarSign,
  ScrollText,
  Bell,
  Circle,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserPlus,
  List,
  ShieldCheck,
  Building2,
  BadgeCheck,
  FileCheck,
  Calculator,
  ClipboardList,
  Stethoscope,
  FileText,
  FilePlus,
  CreditCard,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
  BarChart3,
  TrendingUp,
  Hourglass,
  Settings,
  KeyRound,
  Lock,
  Hash,
  DollarSign,
  ScrollText,
  Bell,
  HeartPulse,
};
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/constants/navigation';
import type { NavItem } from '@/types';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-sidebar transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">MediBill</p>
                <p className="truncate text-[11px] text-muted-foreground">Billing Suite</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="border-t p-3">
          <div
            className={cn(
              'rounded-lg bg-primary/5 p-3',
              collapsed && 'px-2'
            )}
          >
            {!collapsed ? (
              <>
                <p className="text-xs font-semibold text-primary">Need help?</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Check our knowledge base
                </p>
                <Link
                  href="/notifications"
                  className="mt-2 block rounded-md bg-primary px-2.5 py-1.5 text-center text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Support Center
                </Link>
              </>
            ) : (
              <div className="flex justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  pathname,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  pathname: string;
}) {
  const [expanded, setExpanded] = React.useState(
    item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/')) ?? false
  );
  const Icon = iconMap[item.icon] ?? Circle;

  if (item.children && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            active
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
        {expanded && (
          <div className="ml-4 mt-1 space-y-1 border-l pl-3">
            {item.children.map((child) => {
              const childActive =
                pathname === child.href || pathname.startsWith(child.href + '/');
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                    childActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {child.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.title : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
