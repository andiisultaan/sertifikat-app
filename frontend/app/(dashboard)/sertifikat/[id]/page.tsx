"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSertifikat } from "@/lib/hooks/useSertifikat";
import { useGenerateSertifikat } from "@/lib/hooks/useSertifikat";
import { sertifikatService } from "@/services/api/sertifikatService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge-2";
import { Sertifikat } from "@/services/api/sertifikatService";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

type StatusVariant = "warning" | "info" | "success" | "destructive";

const statusConfig: Record<Sertifikat["status"], { label: string; variant: StatusVariant }> = {
  pending: { label: "Menunggu antrian", variant: "warning" },
  processing: { label: "Sedang diproses…", variant: "info" },
  selesai: { label: "Selesai", variant: "success" },
  gagal: { label: "Gagal", variant: "destructive" },
};

export default function DetailSertifikatPage() {
  const { id } = useParams<{ id: string }>();
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const { data: sertifikat, isLoading } = useSertifikat(Number(id), true);

  const { mutate: generate, isPending: generating } = useGenerateSertifikat();

  if (isLoading) {
    return <div className="text-gray-400 p-4">Memuat data...</div>;
  }

  if (!sertifikat) {
    return <div className="text-gray-400 p-4">Sertifikat tidak ditemukan.</div>;
  }

  const status = sertifikat.status;
  const config = statusConfig[status];
  const siswa = sertifikat.nilai?.siswa;
  const ukk = sertifikat.nilai?.ukk;
  const nilai = sertifikat.nilai;
  const selesai = status === "selesai";

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    const url = sertifikatService.downloadUrl(sertifikat.id);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return alert("Gagal mengunduh PDF.");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `Sertifikat-${siswa?.nama ?? "siswa"}.pdf`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleGenerate = () => {
    setGeneratingId(sertifikat.nilai_id);
    generate(sertifikat.nilai_id, {
      onSuccess: data => toast.success(data.message ?? "Sertifikat berhasil digenerate"),
      onError: () => toast.error("Gagal generate sertifikat"),
      onSettled: () => setGeneratingId(null),
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sertifikat" className="text-sm text-gray-500 hover:text-gray-700">
          ← Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Detail Sertifikat</h1>
      </div>

      {/* Status card */}
      <div className="rounded-xl border p-4 mb-6 bg-muted/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={config.variant} appearance="light" size="lg">
              {config.label}
            </Badge>
            {(status === "pending" || status === "processing") && <p className="text-xs mt-1 opacity-70">Halaman ini otomatis diperbarui setiap 3 detik.</p>}
            {status === "gagal" && sertifikat.error_message && <p className="text-xs mt-1 font-mono opacity-80">{sertifikat.error_message}</p>}
          </div>
          {status === "gagal" && (
            <Button size="sm" variant="outline" disabled={generating && generatingId === sertifikat.nilai_id} onClick={handleGenerate}>
              {generating && generatingId === sertifikat.nilai_id ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading...</span>
                </span>
              ) : (
                <span>Coba Lagi</span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Info sertifikat */}
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">No. Sertifikat</p>
            <p className="font-mono font-semibold">{sertifikat.nomor_sertifikat}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Tanggal Generate</p>
            <p>{sertifikat.generated_at ? new Date(sertifikat.generated_at).toLocaleDateString("id-ID", { dateStyle: "long" }) : "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Nama Siswa</p>
            <p className="font-semibold">{siswa?.nama ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">NISN</p>
            <p>{siswa?.nisn ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Jurusan</p>
            <p>{siswa?.jurusan ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">UKK</p>
            <p>{ukk?.nama ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Nilai Akhir</p>
            <p className="text-2xl font-bold text-gray-900">{nilai?.nilai_akhir ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Predikat</p>
            <p className="text-2xl font-bold text-yellow-600">{nilai?.predikat ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Aksi */}
      {selesai && (
        <div className="flex gap-3">
          <Button onClick={handleDownload}>Download PDF</Button>
          <Link href={`/sertifikat/${sertifikat.id}/print`} target="_blank">
            <Button variant="outline">Cetak</Button>
          </Link>
          <Button variant="outline" disabled={generating} onClick={handleGenerate} className="w-[140px] justify-center">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex w-4 justify-center">{generating && generatingId === sertifikat.nilai_id ? <Loader2 className="animate-spin" /> : <span className="block w-4" />}</span>
              <span>Generate Ulang</span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
