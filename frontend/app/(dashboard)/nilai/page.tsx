"use client";

import { useState, useEffect } from "react";
import { useController } from "react-hook-form";
import { SiswaSearchInput } from "@/components/ui/siswa-search-input";
import { Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNilaiList, useCreateNilai, useUpdateNilai, useDeleteNilai, useNilai } from "@/lib/hooks/useNilai";
import { useSiswaList } from "@/lib/hooks/useSiswa";
import { useUkkList } from "@/lib/hooks/useUkk";
import { useSekolahList } from "@/lib/hooks/useSekolah";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/lib/toast";
import { nilaiSchema, updateNilaiSchema, NilaiFormValues, UpdateNilaiFormValues } from "@/lib/validations/nilaiSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge-2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SkeletonTableRows } from "@/components/ui/skeleton-table";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ── Modal Tambah Nilai ──────────────────────────────────────────────────────
function TambahNilaiModal({
  open,
  onOpenChange,
  role,
  sekolahId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: string | undefined;
  sekolahId?: number;
}) {
  const { mutate: create, isPending, error, reset: resetMutation } = useCreateNilai();
  const { data: siswaData } = useSiswaList({ per_page: 100, sekolah_id: sekolahId });
  const { data: ukkData } = useUkkList({ per_page: 100, sekolah_id: sekolahId });

  const canInternal = role === "super_admin" || role === "admin" || role === "penguji_internal";
  const canEksternal = role === "super_admin" || role === "admin" || role === "penguji_external";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NilaiFormValues>({
    resolver: zodResolver(nilaiSchema),
  });

  const { field: siswaField } = useController({ name: "siswa_id", control });

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const onSubmit = (values: NilaiFormValues) => {
    create(values, {
      onSuccess: () => {
        toast.success("Nilai berhasil disimpan");
        reset();
        resetMutation();
        onOpenChange(false);
      },
      onError: () => toast.error("Gagal menyimpan nilai"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Input Nilai</DialogTitle>
        </DialogHeader>
        {apiError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-2">{apiError}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Siswa</Label>
              <SiswaSearchInput siswaList={siswaData?.data ?? []} value={siswaField.value ?? null} onChange={siswaField.onChange} error={errors.siswa_id?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ukk_id">UKK</Label>
              <select id="ukk_id" {...register("ukk_id", { valueAsNumber: true })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="">Pilih UKK...</option>
                {ukkData?.data.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </select>
              {errors.ukk_id && <p className="text-xs text-red-500">{errors.ukk_id.message}</p>}
            </div>
            {canInternal && (
              <div className="space-y-1">
                <Label htmlFor="nilai_internal">Penguji Internal (0–100)</Label>
                <Input id="nilai_internal" type="number" step="0.01" placeholder="0–100" {...register("nilai_internal", { valueAsNumber: true })} />
                {errors.nilai_internal && <p className="text-xs text-red-500">{errors.nilai_internal.message}</p>}
              </div>
            )}
            {canEksternal && (
              <div className="space-y-1">
                <Label htmlFor="nilai_eksternal">Penguji Eksternal (0–100)</Label>
                <Input id="nilai_eksternal" type="number" step="0.01" placeholder="0–100" {...register("nilai_eksternal", { valueAsNumber: true })} />
                {errors.nilai_eksternal && <p className="text-xs text-red-500">{errors.nilai_eksternal.message}</p>}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">Nilai akhir dihitung dari rata-rata nilai internal dan eksternal. Predikat dihitung otomatis saat disimpan.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Modal Edit Nilai ────────────────────────────────────────────────────────
function EditNilaiModal({ nilaiId, open, onOpenChange, role }: { nilaiId: number | null; open: boolean; onOpenChange: (v: boolean) => void; role: string | undefined }) {
  const { data: nilai, isLoading } = useNilai(nilaiId ?? 0);
  const { mutate: update, isPending, error } = useUpdateNilai(nilaiId ?? 0);

  const canInternal = role === "super_admin" || role === "admin" || role === "penguji_internal";
  const canEksternal = role === "super_admin" || role === "admin" || role === "penguji_external";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNilaiFormValues>({
    resolver: zodResolver(updateNilaiSchema),
  });

  useEffect(() => {
    if (nilai && open) {
      reset({
        nilai_internal: nilai.nilai_internal ?? undefined,
        nilai_eksternal: nilai.nilai_eksternal ?? undefined,
      });
    }
  }, [nilai, open, reset]);

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const onSubmit = (values: UpdateNilaiFormValues) => {
    update(values, {
      onSuccess: () => {
        toast.success("Nilai berhasil diperbarui");
        onOpenChange(false);
      },
      onError: () => toast.error("Gagal memperbarui nilai"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Nilai</DialogTitle>
          {nilai && (
            <p className="text-sm text-gray-500 mt-1">
              {nilai.siswa?.nama} — {nilai.ukk?.nama}
            </p>
          )}
        </DialogHeader>
        {apiError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-2">{apiError}</p>}
        {isLoading ? (
          <div className="space-y-3 py-2">
            <div className="h-9 rounded bg-gray-100 animate-pulse" />
            <div className="h-9 rounded bg-gray-100 animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {nilai?.nilai_akhir !== null && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm flex gap-6">
                <span>
                  Nilai Akhir: <strong>{nilai?.nilai_akhir}</strong>
                </span>
                <span>
                  Predikat: <strong>{nilai?.predikat}</strong>
                </span>
                <span>
                  Status: <strong>{nilai?.status}</strong>
                </span>
              </div>
            )}
            {canInternal && (
              <div className="space-y-1">
                <Label htmlFor="edit_nilai_internal">Penguji Internal</Label>
                <Input id="edit_nilai_internal" type="number" step="0.01" {...register("nilai_internal", { valueAsNumber: true })} />
                {errors.nilai_internal && <p className="text-xs text-red-500">{errors.nilai_internal.message}</p>}
              </div>
            )}
            {canEksternal && (
              <div className="space-y-1">
                <Label htmlFor="edit_nilai_eksternal">Penguji Eksternal</Label>
                <Input id="edit_nilai_eksternal" type="number" step="0.01" {...register("nilai_eksternal", { valueAsNumber: true })} />
                {errors.nilai_eksternal && <p className="text-xs text-red-500">{errors.nilai_eksternal.message}</p>}
              </div>
            )}
            <p className="text-xs text-gray-400">Nilai akhir dihitung dari rata-rata nilai internal dan eksternal. Predikat dihitung ulang otomatis.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function NilaiPage() {
  const [page, setPage] = useState(1);
  const [sekolahId, setSekolahId] = useState<number | undefined>(undefined);
  const [tambahOpen, setTambahOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";
  const canDelete = user?.role === "super_admin" || user?.role === "admin";

  const { data, isLoading } = useNilaiList({ page, sekolah_id: isSuperAdmin ? sekolahId : undefined });
  const { data: sekolahList } = useSekolahList({ enabled: isSuperAdmin });
  const { mutate: deleteNilai, isPending: isDeleting } = useDeleteNilai();

  const nilaiVariant = (status: string | null) => {
    if (status === "Lulus") return { variant: "success", appearance: "light" } as const;
    if (status === "Tidak Lulus") return { variant: "destructive", appearance: "light" } as const;
    return { variant: "secondary", appearance: "light" } as const;
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteNilai(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Nilai berhasil dihapus");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Gagal menghapus nilai"),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Daftar Nilai</h1>
        <Button variant="outline" onClick={() => setTambahOpen(true)}>
          + Input Nilai
        </Button>
      </div>

      <TambahNilaiModal open={tambahOpen} onOpenChange={setTambahOpen} role={user?.role} sekolahId={isSuperAdmin ? sekolahId : undefined} />
      <EditNilaiModal
        nilaiId={editId}
        open={editId !== null}
        onOpenChange={v => {
          if (!v) setEditId(null);
        }}
        role={user?.role}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title={`Hapus nilai "${deleteTarget?.label}"?`}
        description="Data nilai akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isSuperAdmin && (
          <div className="p-4 border-b">
            <select
              value={sekolahId ?? ""}
              onChange={e => {
                const value = e.target.value;
                setSekolahId(value ? Number(value) : undefined);
                setPage(1);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm sm:max-w-xs"
            >
              <option value="">Semua sekolah</option>
              {sekolahList?.map(sekolah => (
                <option key={sekolah.id} value={sekolah.id}>
                  {sekolah.nama}
                </option>
              ))}
            </select>
          </div>
        )}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Siswa", "UKK", "Penguji Internal", "Penguji Eksternal", "Nilai Akhir", "Predikat", "Status", "Aksi"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <SkeletonTableRows cols={8} widths={["w-36", "w-32", "w-16", "w-16", "w-16", "w-8", "w-20", "w-16"]} />
          ) : (
            <tbody className="divide-y">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Belum ada nilai diinput.
                  </td>
                </tr>
              )}
              {data?.data.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{n.siswa?.nama ?? `#${n.siswa_id}`}</td>
                  <td className="px-4 py-3">{n.ukk?.nama ?? `#${n.ukk_id}`}</td>
                  <td className="px-4 py-3">{n.nilai_internal ?? "—"}</td>
                  <td className="px-4 py-3">{n.nilai_eksternal ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold">{n.nilai_akhir ?? "—"}</td>
                  <td className="px-4 py-3 font-bold">{n.predikat ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge {...nilaiVariant(n.status)}>{n.status ?? "—"}</Badge>
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => setEditId(n.id)}>
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    {canDelete && (
                      <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget({ id: n.id, label: n.siswa?.nama ?? `#${n.siswa_id}` })}>
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {!isLoading && data && <Pagination page={page} lastPage={data.last_page} total={data.total} perPage={15} onPageChange={setPage} />}
      </div>
    </div>
  );
}
