'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, LayoutDashboard, FileText, CreditCard, Receipt, Bell, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/features/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const portalNav = [
  { title: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { title: 'My Invoices', href: '/portal/invoices', icon: FileText },
  { title: 'Payment History', href: '/portal/payments', icon: CreditCard },
  { title: 'Billing Statements', href: '/portal/statements', icon: Receipt },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">MediBill</p>
                <p className="text-[11px] text-muted-foreground">Patient Portal</p>
              </div>
            </Link>

            <nav className="ml-8 hidden items-center gap-1 md:flex">
              {portalNav.map((item) => {
                const active = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">JS</AvatarFallback></Avatar>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setOpen(!open)}>
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {open && (
            <nav className="border-t px-4 py-3 md:hidden">
              {portalNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent">
                  <item.icon className="h-4 w-4" /> {item.title}
                </Link>
              ))}
            </nav>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-xl font-bold">James Smith</h1>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login"><LogOut className="mr-2 h-4 w-4" /> Sign out</Link>
            </Button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
