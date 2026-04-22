'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';

import { useSiswaList, useSiswa, useCreateSiswa, useUpdateSiswa, useDeleteSiswa } from '@/lib/hooks/useSiswa';
import { SiswaFormValues } from '@/lib/validations/siswaSchema';
import { SiswaForm } from '@/components/forms/SiswaForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SkeletonTableRows } from '@/components/ui/skeleton-table';
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function SiswaPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nama: string } | null>(null);

  const { data, isLoading } = useSiswaList({ page, search: search || undefined });
  const { mutate: deleteSiswa, isPending: isDeleting } = useDeleteSiswa();
  const { mutate: createSiswa, isPending, error } = useCreateSiswa();
  const { data: editSiswa, isLoading: editLoading } = useSiswa(editTarget ?? 0);
  const { mutate: updateSiswa, isPending: isUpdating, error: updateError } = useUpdateSiswa(editTarget ?? 0);

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  const updateApiError = (updateError as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSiswa(deleteTarget.id, {
      onSuccess: () => { toast.success('Siswa berhasil dihapus'); setDeleteTarget(null); },
      onError: () => toast.error('Gagal menghapus siswa'),
    });
  };

  const handleSubmit = (values: SiswaFormValues) => {
    createSiswa(values, {
      onSuccess: () => { setOpen(false); toast.success('Siswa berhasil ditambahkan'); },
      onError: () => toast.error('Gagal menambahkan siswa'),
    });
  };

  const handleUpdate = (values: SiswaFormValues) => {
    updateSiswa(values, {
      onSuccess: () => { setEditTarget(null); toast.success('Siswa berhasil diperbarui'); },
      onError: () => toast.error('Gagal memperbarui siswa'),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Daftar Siswa</h1>
        <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Tambah Siswa
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Siswa</DialogTitle>
            <DialogDescription>Isi data siswa di bawah ini lalu klik Simpan.</DialogDescription>
          </DialogHeader>
          {apiError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-2">
              {apiError}
            </p>
          )}
          <SiswaForm onSubmit={handleSubmit} isPending={isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={editTarget !== null} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Siswa</DialogTitle>
            <DialogDescription>Ubah data siswa lalu klik Simpan.</DialogDescription>
          </DialogHeader>
          {updateApiError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-2">
              {updateApiError}
            </p>
          )}
          {editLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ) : (
            <SiswaForm defaultValues={editSiswa} onSubmit={handleUpdate} isPending={isUpdating} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Hapus siswa "${deleteTarget?.nama}"?`}
        description="Data siswa akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <Input
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['NIS', 'Nama', 'Jurusan', 'Th. Masuk', 'JK', 'Aksi'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <SkeletonTableRows cols={6} widths={['w-24', 'w-40', 'w-28', 'w-16', 'w-8', 'w-16']} />
          ) : (
            <tbody className="divide-y">
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada data siswa.</td>
                </tr>
              )}
              {data?.data.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">{s.nis}</td>
                  <td className="px-4 py-3">{s.nama}</td>
                  <td className="px-4 py-3">{s.jurusan}</td>
                  <td className="px-4 py-3">{s.tahun_masuk}</td>
                  <td className="px-4 py-3">{s.jenis_kelamin === 'L' ? 'L' : 'P'}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => setEditTarget(s.id)}>
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit</span>
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

        {!isLoading && data && (
          <Pagination
            page={page}
            lastPage={data.last_page}
            total={data.total}
            perPage={15}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
