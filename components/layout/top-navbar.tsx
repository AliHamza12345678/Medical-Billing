'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PanelLeftClose, PanelLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/layout/search-bar';
import { NotificationDropdown } from '@/components/layout/notification-dropdown';
import { UserProfileMenu } from '@/components/layout/user-profile-menu';
import { ThemeToggle } from '@/components/features/theme-toggle';
import { navItems } from '@/constants/navigation';

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
  onCollapseToggle: () => void;
  collapsed: boolean;
}

const pageTitles: Record<string, string> = Object.fromEntries(
  navItems.flatMap((n) => [
    [n.href, n.title],
    ...(n.children ?? []).map((c) => [c.href, c.title]),
  ])
);

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/dashboard' }];

  let path = '';
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const title = pageTitles[path] ?? segments[i].replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    crumbs.push(isLast ? { label: title } : { label: title, href: path });
  }
  return crumbs;
}

export function TopNavbar({ onMobileMenuToggle, onCollapseToggle, collapsed }: TopNavbarProps) {
  const breadcrumbs = useBreadcrumbs();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex"
        onClick={onCollapseToggle}
      >
        {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>

      <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
        {breadcrumbs.map((c, i) => (
          <React.Fragment key={i}>
            {c.href ? (
              <Link href={c.href} className="transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground capitalize">{c.label}</span>
            )}
            {i < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </React.Fragment>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <SearchBar />
        <ThemeToggle />
        <NotificationDropdown />
        <div className="ml-1 h-6 w-px bg-border" />
        <UserProfileMenu />
      </div>
    </header>
  );
}
