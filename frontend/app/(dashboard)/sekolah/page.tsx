"use client";

import { useMemo, useState } from "react";
import { Key, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useCreateSekolah, useDeleteSekolah, useGenerateSignatureKey, useSekolahList, useSignatureKeyStatus, useUpdateSekolah } from "@/lib/hooks/useSekolah";
import { CreateSekolahResponse } from "@/services/api/sekolahService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkeletonTableRows } from "@/components/ui/skeleton-table";

interface SekolahFormState {
  nama: string;
  alamat: string;
  nama_kepsek: string;
  nip_kepsek: string;
}

const emptyForm: SekolahFormState = {
  nama: "",
  alamat: "",
  nama_kepsek: "",
  nip_kepsek: "",
};

export default function SekolahPage() {
  const { user } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newSekolahName, setNewSekolahName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SekolahFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);
  const [credential, setCredential] = useState<CreateSekolahResponse["accounts"] | null>(null);
  const [signatureKeyTarget, setSignatureKeyTarget] = useState<{ id: number; nama: string } | null>(null);

  const { data: sekolahList, isLoading } = useSekolahList();
  const { mutate: createSekolah, isPending: isCreating } = useCreateSekolah();
  const { mutate: updateSekolah, isPending: isUpdating } = useUpdateSekolah(editId ?? 0);
  const { mutate: deleteSekolah, isPending: isDeleting } = useDeleteSekolah();
  const { data: signatureKeyStatus, isLoading: isLoadingKeyStatus } = useSignatureKeyStatus(signatureKeyTarget?.id ?? null);
  const { mutate: generateSignatureKey, isPending: isGeneratingKey } = useGenerateSignatureKey();

  const selectedSekolah = useMemo(() => sekolahList?.find(s => s.id === editId), [sekolahList, editId]);

  if (user?.role !== "super_admin") {
    return <p className="text-sm text-muted-foreground">Halaman ini hanya untuk super admin.</p>;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSekolah(
      { nama: newSekolahName },
      {
        onSuccess: res => {
          setCreateOpen(false);
          setNewSekolahName("");
          setCredential(res.accounts ?? { admin: res.admin });
          toast.success("Sekolah berhasil ditambahkan");
        },
        onError: () => toast.error("Gagal menambahkan sekolah"),
      },
    );
  };

  const openEdit = (id: number) => {
    const sekolah = sekolahList?.find(s => s.id === id);
    if (!sekolah) return;

    setEditId(id);
    setEditForm({
      nama: sekolah.nama ?? "",
      alamat: sekolah.alamat ?? "",
      nama_kepsek: sekolah.nama_kepsek ?? "",
      nip_kepsek: sekolah.nip_kepsek ?? "",
    });
    setEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    updateSekolah(editForm, {
      onSuccess: () => {
        setEditOpen(false);
        toast.success("Profil sekolah berhasil diperbarui");
      },
      onError: () => toast.error("Gagal memperbarui sekolah"),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSekolah(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("Sekolah berhasil dihapus");
      },
      onError: () => toast.error("Gagal menghapus sekolah"),
    });
  };

  const copyCredentials = async () => {
    if (!credential) return;
    type AccountKey = keyof NonNullable<CreateSekolahResponse["accounts"]>;
    type AccountValue = NonNullable<NonNullable<CreateSekolahResponse["accounts"]>[AccountKey]>;
    const lines = (Object.entries(credential) as [AccountKey, AccountValue | undefined][])
      .filter((entry): entry is [AccountKey, AccountValue] => !!entry[1])
      .map(([role, account]) => `${role}\nEmail: ${account.email}\nPassword: ${account.password}`);
    await navigator.clipboard.writeText(lines.join("\n\n"));
    toast.success("Kredensial disalin");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Sekolah</h1>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Tambah Sekolah
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Sekolah</DialogTitle>
            <DialogDescription>Cukup masukkan nama sekolah. Akun admin, penguji internal, dan penguji external akan dibuat otomatis.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label>Nama Sekolah</Label>
              <Input value={newSekolahName} onChange={e => setNewSekolahName(e.target.value)} placeholder="SMK Negeri 1 ..." required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Menyimpan..." : "Tambah Sekolah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credential} onOpenChange={v => !v && setCredential(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sekolah berhasil ditambahkan</DialogTitle>
            <DialogDescription>Simpan kredensial akun berikut. Password tidak bisa ditampilkan lagi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-md bg-muted p-4 font-mono text-sm">
            {Object.entries(credential ?? {}).map(([role, account]) =>
              account ? (
                <div key={role} className="space-y-1">
                  <p className="font-semibold uppercase tracking-wide">{role.replace("_", " ")}</p>
                  <p>
                    Email: <strong>{account.email}</strong>
                  </p>
                  <p>
                    Password: <strong>{account.password}</strong>
                  </p>
                </div>
              ) : null,
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Simpan di tempat aman sebelum menutup modal ini.</p>
            <Button onClick={copyCredentials}>Salin</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={v => !v && setEditOpen(false)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Sekolah</DialogTitle>
            <DialogDescription>Perbarui profil sekolah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label>Nama Sekolah</Label>
              <Input value={editForm.nama} onChange={e => setEditForm(f => ({ ...f, nama: e.target.value }))} required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Alamat</Label>
              <Input value={editForm.alamat} onChange={e => setEditForm(f => ({ ...f, alamat: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Nama Kepsek</Label>
              <Input value={editForm.nama_kepsek} onChange={e => setEditForm(f => ({ ...f, nama_kepsek: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>NIP Kepsek</Label>
              <Input value={editForm.nip_kepsek} onChange={e => setEditForm(f => ({ ...f, nip_kepsek: e.target.value }))} />
            </div>
            <div className="flex justify-end md:col-span-2">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
          {selectedSekolah?.admin ? (
            <p className="text-xs text-muted-foreground">
              Admin sekolah: {selectedSekolah.admin.name} ({selectedSekolah.admin.email})
            </p>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title={`Hapus sekolah "${deleteTarget?.nama}"?`}
        description="Sekolah akan di-soft delete. User admin sekolah tetap ada, tapi referensi sekolah menjadi null."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      {/* Dialog Kunci Digital */}
      <Dialog open={!!signatureKeyTarget} onOpenChange={v => !v && setSignatureKeyTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kunci Tanda Tangan Digital</DialogTitle>
            <DialogDescription>{signatureKeyTarget?.nama}</DialogDescription>
          </DialogHeader>
          {isLoadingKeyStatus ? (
            <p className="text-sm text-muted-foreground">Memeriksa status kunci...</p>
          ) : (
            <div className="space-y-3">
              {(["kepsek", "penguji_eksternal"] as const).map(role => {
                const keyInfo = signatureKeyStatus?.keys?.[role];
                const hasKey = keyInfo?.has_key ?? false;
                const label = role === "kepsek" ? "Kepala Sekolah" : "Penguji Eksternal";
                return (
                  <div key={role} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full shrink-0 ${hasKey ? "bg-green-500" : "bg-red-400"}`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                      <span className="ml-auto text-xs">{hasKey ? "Aktif" : "Belum ada"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={hasKey ? "outline" : "default"}
                      className="w-full"
                      disabled={isGeneratingKey}
                      onClick={() => {
                        if (!signatureKeyTarget) return;
                        generateSignatureKey(
                          { id: signatureKeyTarget.id, role, force: hasKey },
                          {
                            onSuccess: () => toast.success(`Kunci ${label} berhasil di-generate`),
                            onError: () => toast.error(`Gagal generate kunci ${label}`),
                          },
                        );
                      }}
                    >
                      {isGeneratingKey ? "Generating..." : hasKey ? "Generate Ulang" : "Generate Kunci"}
                    </Button>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">Generate ulang akan membatalkan tanda tangan sertifikat yang sudah ada.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {["Nama Sekolah", "Kepsek", "Alamat", "Aksi"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <SkeletonTableRows cols={4} widths={["w-48", "w-36", "w-64", "w-20"]} />
          ) : (
            <tbody className="divide-y">
              {sekolahList?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Belum ada data sekolah.
                  </td>
                </tr>
              ) : null}
              {sekolahList?.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.nama}</td>
                  <td className="px-4 py-3">{s.nama_kepsek || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.alamat || "-"}</td>
                  <td className="flex gap-1 px-4 py-3">
                    <Button variant="outline" size="icon-sm" onClick={() => openEdit(s.id)}>
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="outline" size="icon-sm" title="Kunci Tanda Tangan Digital" onClick={() => setSignatureKeyTarget({ id: s.id, nama: s.nama })}>
                      <Key className="size-3.5" />
                      <span className="sr-only">Kunci Digital</span>
                    </Button>
                    <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget({ id: s.id, nama: s.nama })}>
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
