'use client';

import { useLogout } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <span className="text-sm text-gray-500">
        {user ? `Halo, ${user.name}` : ''}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout()}
        disabled={isPending}
      >
        {isPending ? 'Keluar...' : 'Keluar'}
      </Button>
    </header>
  );
}
