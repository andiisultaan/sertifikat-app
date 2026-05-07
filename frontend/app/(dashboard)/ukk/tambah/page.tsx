"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UkkForm } from "@/components/forms/UkkForm";
import { useCreateUkk } from "@/lib/hooks/useUkk";
import { useSekolahDetail, useSekolahList } from "@/lib/hooks/useSekolah";
import { UkkFormValues } from "@/lib/validations/ukkSchema";
import { UkkPayload } from "@/services/api/ukkService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export default function TambahUkkPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";

  // For admin: use their own sekolah; for super_admin: let them pick
  const [selectedSekolahId, setSelectedSekolahId] = useState<number | null>(null);
  const sekolahId = isSuperAdmin ? selectedSekolahId : (user?.sekolah_id ?? null);

  const { data: sekolahList } = useSekolahList({ enabled: isSuperAdmin });
  const { data: sekolah } = useSekolahDetail(sekolahId);
  const { mutate: create, isPending, error } = useCreateUkk();

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleSubmit = (values: UkkFormValues) => {
    const payload: UkkPayload = isSuperAdmin && selectedSekolahId ? { ...values, sekolah_id: selectedSekolahId } : values;
    create(payload, {
      onSuccess: () => {
        toast.success("UKK berhasil ditambahkan");
        router.push("/ukk");
      },
      onError: () => toast.error("Gagal menambahkan UKK"),
    });
  };

  const prefillSekolah = sekolah
    ? {
        nama_sekolah: sekolah.nama ?? "",
        alamat_sekolah: sekolah.alamat ?? "",
        nama_kepsek: sekolah.nama_kepsek ?? "",
        nip_kepsek: sekolah.nip_kepsek ?? "",
        nama_universitas: sekolah.nama_universitas ?? "",
      }
    : undefined;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/ukk")} className="shrink-0">
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tambah UKK</h1>
          <p className="text-sm text-muted-foreground">Isi data UKK baru secara lengkap</p>
        </div>
      </div>

      {apiError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">{apiError}</p>}

      {isSuperAdmin && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Pilih Sekolah <span className="text-red-500">*</span>
          </label>
          <select value={selectedSekolahId ?? ""} onChange={e => setSelectedSekolahId(e.target.value ? Number(e.target.value) : null)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            <option value="">-- Pilih sekolah --</option>
            {sekolahList?.map(s => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>
          {!selectedSekolahId && <p className="text-xs text-amber-600 mt-1">Pilih sekolah agar UKK terasosiasi dengan sekolah yang benar.</p>}
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <UkkForm onSubmit={handleSubmit} isPending={isPending} defaultValues={prefillSekolah} mode="create" />
      </div>
    </div>
  );
}
