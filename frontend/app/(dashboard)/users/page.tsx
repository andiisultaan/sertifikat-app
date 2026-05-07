"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useUserList, useDeleteUser } from "@/lib/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { useDebounce } from "@/hooks/use-debounce";
import { UserRole } from "@/services/api/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge-2";
import { SkeletonTableRows } from "@/components/ui/skeleton-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type BadgeVariant = "success" | "info" | "warning" | "secondary";
const roleVariant: Record<UserRole, BadgeVariant> = {
  super_admin: "success",
  admin: "secondary",
  penguji_internal: "info",
  penguji_external: "warning",
};
const roleLabel: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  penguji_internal: "Penguji Internal",
  penguji_external: "Penguji External",
};

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: users, isLoading, isError, refetch } = useUserList({ search: debouncedSearch || undefined });
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id, {
      onSuccess: () => {
        toast.success("User berhasil dihapus");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Gagal menghapus user"),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <Button variant="outline" onClick={() => router.push("/users/tambah")} className="gap-2">
          <Plus className="size-4" />
          Tambah User
        </Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)} title={`Hapus user "${deleteTarget?.nama}"?`} description="Akun pengguna akan dihapus permanen." onConfirm={handleDelete} isPending={isDeleting} />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Nama", "Email", "Role", "Sekolah", "Aksi"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <SkeletonTableRows cols={5} widths={["w-36", "w-48", "w-28", "w-36", "w-16"]} />
          ) : isError ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <p className="text-red-500 text-sm mb-2">Gagal memuat data pengguna.</p>
                  <button onClick={() => refetch()} className="text-xs text-blue-600 underline hover:text-blue-800">
                    Coba lagi
                  </button>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y">
              {users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              )}
              {users?.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {u.id === currentUser?.id && <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[u.role]} appearance="light">
                      {roleLabel[u.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.sekolah?.nama ?? "-"}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => router.push(`/users/${u.id}/edit`)}>
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="icon-sm" disabled={u.id === currentUser?.id} onClick={() => setDeleteTarget({ id: u.id, nama: u.name })}>
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Hapus</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
