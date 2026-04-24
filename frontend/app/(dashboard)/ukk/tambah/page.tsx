"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UkkForm } from "@/components/forms/UkkForm";
import { useCreateUkk } from "@/lib/hooks/useUkk";
import { useSekolahDetail } from "@/lib/hooks/useSekolah";
import { UkkFormValues } from "@/lib/validations/ukkSchema";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export default function TambahUkkPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const sekolahId = user?.sekolah_id ?? null;
  const { data: sekolah } = useSekolahDetail(sekolahId);
  const { mutate: create, isPending, error } = useCreateUkk();

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const handleSubmit = (values: UkkFormValues) => {
    create(values, {
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

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <UkkForm onSubmit={handleSubmit} isPending={isPending} defaultValues={prefillSekolah} mode="create" />
      </div>
    </div>
  );
}
