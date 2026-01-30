'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icons, D2ILogo } from './ui/Icons';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { href: '/dashboard/modules', label: 'Modules', icon: Icons.Modules },
  { href: '/dashboard/workspace', label: 'Workspace', icon: Icons.Workspace },
  { href: '/dashboard/chat', label: 'Team Chat', icon: Icons.Chat },
  { href: '/dashboard/notes', label: 'My Notes', icon: Icons.Notes },
  { href: '/dashboard/team', label: 'Team', icon: Icons.Team },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <aside className="w-64 p-6 flex flex-col bg-d2i-navy-dark/80 border-r border-d2i-teal/20">
      <div className="mb-8">
        <D2ILogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-d2i-teal/30 to-d2i-cyan/20 border border-d2i-cyan/40 text-d2i-cyan'
                  : 'text-white/50 hover:text-white/80 hover:bg-d2i-navy/50 border border-transparent'
              }`}
            >
              <Icon />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
