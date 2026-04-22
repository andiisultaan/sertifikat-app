'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/siswa', label: 'Siswa' },
  { href: '/ukk', label: 'UKK' },
  { href: '/nilai', label: 'Nilai' },
  { href: '/sertifikat', label: 'Sertifikat' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r min-h-screen flex flex-col">
      <div className="px-5 py-4 border-b">
        <span className="font-bold text-sm tracking-wide uppercase text-gray-700">
          Sertifikat UKK
        </span>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-3">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-gray-100 font-semibold text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
