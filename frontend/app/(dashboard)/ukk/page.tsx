"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge-2";
import { useUkkList, useDeleteUkk } from "@/lib/hooks/useUkk";
import { useSekolahList } from "@/lib/hooks/useSekolah";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SkeletonTableRows } from "@/components/ui/skeleton-table";
import { Pagination } from "@/components/ui/pagination";

export default function UkkPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sekolahId, setSekolahId] = useState<number | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);

  const { data, isLoading } = useUkkList({
    page,
    search: search || undefined,
    sekolah_id: isSuperAdmin ? sekolahId : undefined,
  });
  const { data: sekolahList } = useSekolahList({ enabled: isSuperAdmin });
  const { mutate: deleteUkk, isPending: isDeleting } = useDeleteUkk();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUkk(deleteTarget.id, {
      onSuccess: () => {
        toast.success("UKK berhasil dihapus");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Gagal menghapus UKK"),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Daftar UKK</h1>
        <Button onClick={() => router.push("/ukk/tambah")} className="gap-2">
          <Plus className="size-4" />
          Tambah UKK
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title={`Hapus UKK "${deleteTarget?.nama}"?`}
        description="Data UKK akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari nama atau jurusan..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:max-w-xs"
            />
            {isSuperAdmin && (
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
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Nama UKK", "Jurusan", "Tahun", "Tgl Mulai", "Tgl Selesai", "Status", "Aksi"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <SkeletonTableRows cols={7} widths={["w-40", "w-24", "w-16", "w-24", "w-24", "w-16", "w-16"]} />
          ) : (
            <tbody className="divide-y">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data UKK.
                  </td>
                </tr>
              )}
              {data?.data.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.nama}</td>
                  <td className="px-4 py-3">{u.jurusan}</td>
                  <td className="px-4 py-3">{u.tahun}</td>
                  <td className="px-4 py-3">{u.tanggal_mulai?.toString().slice(0, 10)}</td>
                  <td className="px-4 py-3">{u.tanggal_selesai?.toString().slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === "aktif" ? "success" : "secondary"} appearance="light">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => router.push(`/ukk/${u.id}/edit`)}>
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget({ id: u.id, nama: u.nama })}>
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Hapus</span>
                    </Button>
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
