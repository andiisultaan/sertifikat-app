"use client";

import { useRef, useState } from "react";
import { Building2, ImageIcon, Pencil, Trash2, Upload, X } from "lucide-react";
import { useSekolahDetail, useUpdateSekolah } from "@/lib/hooks/useSekolah";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/toast";

interface ProfilFormState {
  nama: string;
  alamat: string;
  nama_kepsek: string;
  nip_kepsek: string;
}

const emptyForm: ProfilFormState = {
  nama: "",
  alamat: "",
  nama_kepsek: "",
  nip_kepsek: "",
};

export default function ProfilSekolahPage() {
  const { user } = useAuthStore();
  const sekolahId = user?.sekolah_id ?? null;
  const { data: sekolah, isLoading } = useSekolahDetail(sekolahId);
  const { mutate: updateSekolah, isPending } = useUpdateSekolah(sekolahId ?? 0);

  const [form, setForm] = useState<ProfilFormState>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [confirmDeleteLogo, setConfirmDeleteLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [bgFile, setBgFile] = useState<File | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isDeletingBg, setIsDeletingBg] = useState(false);
  const [confirmDeleteBg, setConfirmDeleteBg] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  if (user?.role !== "admin") {
    return <p className="text-sm text-muted-foreground">Halaman ini khusus admin sekolah.</p>;
  }

  if (!sekolahId) {
    return <p className="text-sm text-muted-foreground">Akun admin ini belum terhubung ke sekolah.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSekolah(
      {
        nama: form.nama || sekolah?.nama,
        alamat: form.alamat || sekolah?.alamat,
        nama_kepsek: form.nama_kepsek || sekolah?.nama_kepsek,
        nip_kepsek: form.nip_kepsek || sekolah?.nip_kepsek,
      },
      {
        onSuccess: () => {
          toast.success("Profil sekolah berhasil diperbarui");
          setIsEditing(false);
          setForm(emptyForm);
        },
        onError: () => toast.error("Gagal memperbarui profil sekolah"),
      },
    );
  };

  const handleLogoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;
    setIsUploadingLogo(true);
    updateSekolah(
      { logo: logoFile },
      {
        onSuccess: () => {
          toast.success("Logo berhasil diunggah");
          setLogoFile(null);
          if (logoInputRef.current) logoInputRef.current.value = "";
        },
        onError: () => toast.error("Gagal mengunggah logo"),
        onSettled: () => setIsUploadingLogo(false),
      },
    );
  };

  const handleBgUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgFile) return;
    setIsUploadingBg(true);
    updateSekolah(
      { background_template: bgFile },
      {
        onSuccess: () => {
          toast.success("Background berhasil diunggah");
          setBgFile(null);
          if (bgInputRef.current) bgInputRef.current.value = "";
        },
        onError: () => toast.error("Gagal mengunggah background"),
        onSettled: () => setIsUploadingBg(false),
      },
    );
  };

  const handleDeleteLogo = () => {
    setIsDeletingLogo(true);
    updateSekolah(
      { remove_logo: true },
      {
        onSuccess: () => {
          toast.success("Logo berhasil dihapus");
          setConfirmDeleteLogo(false);
        },
        onError: () => toast.error("Gagal menghapus logo"),
        onSettled: () => setIsDeletingLogo(false),
      },
    );
  };

  const handleDeleteBg = () => {
    setIsDeletingBg(true);
    updateSekolah(
      { remove_background: true },
      {
        onSuccess: () => {
          toast.success("Background berhasil dihapus");
          setConfirmDeleteBg(false);
        },
        onError: () => toast.error("Gagal menghapus background"),
        onSettled: () => setIsDeletingBg(false),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Profil Sekolah</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi dan aset visual sekolah</p>
      </div>

      {/* ── Informasi Sekolah ── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Building2 className="size-4 text-primary" />
              </div>
              Informasi Sekolah
            </CardTitle>
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setIsEditing(true);
                  setForm({
                    nama: sekolah?.nama ?? "",
                    alamat: sekolah?.alamat ?? "",
                    nama_kepsek: sekolah?.nama_kepsek ?? "",
                    nip_kepsek: sekolah?.nip_kepsek ?? "",
                  });
                }}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => {
                  setIsEditing(false);
                  setForm(emptyForm);
                }}
                disabled={isPending}
              >
                <X className="size-3.5" />
                Batal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!isEditing ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                { label: "Nama Sekolah", value: sekolah?.nama },
                { label: "Alamat", value: sekolah?.alamat },
                { label: "Nama Kepala Sekolah", value: sekolah?.nama_kepsek },
                { label: "NIP Kepala Sekolah", value: sekolah?.nip_kepsek },
                { label: "Instansi Penguji External", value: sekolah?.nama_universitas, full: true },
              ].map(({ label, value, full }) => (
                <div key={label} className={full ? "sm:col-span-2" : ""}>
                  <dt className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{value || <span className="text-muted-foreground">—</span>}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Nama Sekolah</Label>
                <Input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Alamat</Label>
                <Input value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Kepala Sekolah</Label>
                <Input value={form.nama_kepsek} onChange={e => setForm(f => ({ ...f, nama_kepsek: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>NIP Kepala Sekolah</Label>
                <Input value={form.nip_kepsek} onChange={e => setForm(f => ({ ...f, nip_kepsek: e.target.value }))} />
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" disabled={isPending} className="min-w-28">
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Logo & Background grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Logo Sekolah */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <ImageIcon className="size-4 text-primary" />
              </div>
              Logo Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sekolah?.logo_url ? (
              <div className="mb-4 flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sekolah.logo_url} alt="Logo Sekolah" className="h-24 w-24 rounded-full border-4 border-border object-cover" />
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDeleteLogo(true)}>
                  <Trash2 className="size-3" />
                  Hapus Logo
                </Button>
              </div>
            ) : (
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/40">
                <ImageIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
            <form onSubmit={handleLogoUpload} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Upload Logo Baru</Label>
                <Input ref={logoInputRef} type="file" accept="image/*" className="text-xs" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1.5" disabled={!logoFile || isUploadingLogo}>
                <Upload className="size-3.5" />
                {isUploadingLogo ? "Mengunggah..." : "Upload Logo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Background Template */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <ImageIcon className="size-4 text-primary" />
              </div>
              Background Sertifikat
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sekolah?.background_template_url ? (
              <div className="mb-4 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sekolah.background_template_url} alt="Background Sertifikat" className="h-28 w-full rounded-lg border border-border object-cover" />
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDeleteBg(true)}>
                  <Trash2 className="size-3" />
                  Hapus Background
                </Button>
              </div>
            ) : (
              <div className="mb-4 flex h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40">
                <ImageIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
            <form onSubmit={handleBgUpload} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Upload Background Baru</Label>
                <Input ref={bgInputRef} type="file" accept="image/*" className="text-xs" onChange={e => setBgFile(e.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1.5" disabled={!bgFile || isUploadingBg}>
                <Upload className="size-3.5" />
                {isUploadingBg ? "Mengunggah..." : "Upload Background"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDeleteLogo}
        onOpenChange={setConfirmDeleteLogo}
        title="Hapus Logo Sekolah?"
        description="Logo akan dihapus permanen dan tidak bisa dikembalikan."
        confirmLabel="Hapus"
        onConfirm={handleDeleteLogo}
        isPending={isDeletingLogo}
      />
      <ConfirmDialog
        open={confirmDeleteBg}
        onOpenChange={setConfirmDeleteBg}
        title="Hapus Background Template?"
        description="Background akan dihapus permanen dan tidak bisa dikembalikan."
        confirmLabel="Hapus"
        onConfirm={handleDeleteBg}
        isPending={isDeletingBg}
      />
    </div>
  );
}
