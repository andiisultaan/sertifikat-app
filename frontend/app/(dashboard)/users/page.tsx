"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useUserList, useCreateUser, useUpdateUser, useDeleteUser } from "@/lib/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/services/api/authService";
import { ManageableUserRole } from "@/services/api/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge-2";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SkeletonTableRows } from "@/components/ui/skeleton-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: ManageableUserRole;
}

const emptyForm: UserFormState = { name: "", email: "", password: "", role: "penguji_internal" };

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);

  const { data: users, isLoading } = useUserList();
  const { mutate: createUser, isPending: isCreating, error: createError } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating, error: updateError } = useUpdateUser(editId ?? 0);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const apiError = (e: unknown) => (e as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setOpen(true);
  };
  const openEdit = (u: NonNullable<typeof users>[number]) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setEditId(u.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      const payload = { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) };
      updateUser(payload, {
        onSuccess: () => {
          setOpen(false);
          toast.success("User berhasil diperbarui");
        },
        onError: () => toast.error("Gagal memperbarui user"),
      });
    } else {
      createUser(
        { ...form },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("User berhasil ditambahkan");
          },
          onError: () => toast.error("Gagal menambahkan user"),
        },
      );
    }
  };

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

  const errMsg = apiError(editId ? updateError : createError);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <Button variant="outline" onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Tambah User
        </Button>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={v => !v && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit User" : "Tambah User"}</DialogTitle>
            <DialogDescription>{editId ? "Ubah data pengguna. Kosongkan password jika tidak ingin menggantinya." : "Isi data pengguna baru."}</DialogDescription>
          </DialogHeader>
          {errMsg && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-2">{errMsg}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" required />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@sekolah.sch.id" required />
            </div>
            <div className="space-y-1">
              <Label>Password {editId && <span className="text-muted-foreground text-xs">(kosongkan jika tidak diubah)</span>}</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 karakter" {...(!editId ? { required: true } : {})} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as ManageableUserRole }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="penguji_internal">Penguji Internal</option>
                <option value="penguji_external">Penguji External</option>
              </select>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                    <Button variant="outline" size="icon-sm" onClick={() => openEdit(u)}>
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
