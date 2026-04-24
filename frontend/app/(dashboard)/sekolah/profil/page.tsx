"use client";

import { useState } from "react";
import { useSekolahDetail, useUpdateSekolah } from "@/lib/hooks/useSekolah";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

interface ProfilFormState {
  nama: string;
  alamat: string;
  nama_kepsek: string;
  nip_kepsek: string;
  nama_universitas: string;
}

const emptyForm: Partial<ProfilFormState> = {
  nama: "",
  alamat: "",
  nama_kepsek: "",
  nip_kepsek: "",
  nama_universitas: "",
};

export default function ProfilSekolahPage() {
  const { user } = useAuthStore();
  const sekolahId = user?.sekolah_id ?? null;
  const { data: sekolah, isLoading } = useSekolahDetail(sekolahId);
  const { mutate: updateSekolah, isPending } = useUpdateSekolah(sekolahId ?? 0);
  const [form, setForm] = useState<Partial<ProfilFormState>>(emptyForm);

  if (user?.role !== "admin") {
    return <p className="text-sm text-muted-foreground">Halaman ini khusus admin sekolah.</p>;
  }

  if (!sekolahId) {
    return <p className="text-sm text-muted-foreground">Akun admin ini belum terhubung ke sekolah.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ProfilFormState = {
      nama: form.nama ?? sekolah?.nama ?? "",
      alamat: form.alamat ?? sekolah?.alamat ?? "",
      nama_kepsek: form.nama_kepsek ?? sekolah?.nama_kepsek ?? "",
      nip_kepsek: form.nip_kepsek ?? sekolah?.nip_kepsek ?? "",
      nama_universitas: form.nama_universitas ?? sekolah?.nama_universitas ?? "",
    };

    updateSekolah(payload, {
      onSuccess: () => toast.success("Profil sekolah berhasil diperbarui"),
      onError: () => toast.error("Gagal memperbarui profil sekolah"),
    });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat profil sekolah...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Profil Sekolah</h1>
        <p className="text-sm text-muted-foreground">Perbarui data sekolah Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <Label>Nama Sekolah</Label>
          <Input value={form.nama ?? sekolah?.nama ?? ""} onChange={(e) => setForm(f => ({ ...f, nama: e.target.value }))} required />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Alamat</Label>
          <Input value={form.alamat ?? sekolah?.alamat ?? ""} onChange={(e) => setForm(f => ({ ...f, alamat: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Nama Kepsek</Label>
          <Input value={form.nama_kepsek ?? sekolah?.nama_kepsek ?? ""} onChange={(e) => setForm(f => ({ ...f, nama_kepsek: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>NIP Kepsek</Label>
          <Input value={form.nip_kepsek ?? sekolah?.nip_kepsek ?? ""} onChange={(e) => setForm(f => ({ ...f, nip_kepsek: e.target.value }))} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Nama Universitas</Label>
          <Input value={form.nama_universitas ?? sekolah?.nama_universitas ?? ""} onChange={(e) => setForm(f => ({ ...f, nama_universitas: e.target.value }))} />
        </div>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
