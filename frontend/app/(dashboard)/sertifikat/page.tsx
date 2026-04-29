"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, Printer, Trash2 } from "lucide-react";
import { useSertifikatList, useGenerateSertifikat, useDeleteSertifikat } from "@/lib/hooks/useSertifikat";
import { useNilaiList } from "@/lib/hooks/useNilai";
import { useSekolahList, useSignatureKeyStatus, useGenerateSignatureKey } from "@/lib/hooks/useSekolah";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge-2";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SkeletonTableRows } from "@/components/ui/skeleton-table";
import { Pagination } from "@/components/ui/pagination";
import { Sertifikat } from "@/services/api/sertifikatService";

type BadgeVariant = "warning" | "info" | "success" | "destructive";

const statusVariant: Record<Sertifikat["status"], BadgeVariant> = {
  pending: "warning",
  processing: "info",
  selesai: "success",
  gagal: "destructive",
};

const statusLabel: Record<Sertifikat["status"], string> = {
  pending: "Menunggu",
  processing: "Diproses",
  selesai: "Selesai",
  gagal: "Gagal",
};

export default function SertifikatPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState<"sertifikat" | "generate" | "tanda-tangan">("sertifikat");
  const [page, setPage] = useState(1);
  const [sekolahId, setSekolahId] = useState<number | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // Admin always scoped to their own sekolah; super_admin can filter freely
  const effectiveSekolahId = isAdmin ? (user?.sekolah_id ?? undefined) : isSuperAdmin ? sekolahId : undefined;

  const { data: sertifikatData, isLoading: loadingSertifikat } = useSertifikatList({
    page,
    sekolah_id: effectiveSekolahId,
  });
  const { data: nilaiData, isLoading: loadingNilai } = useNilaiList({
    per_page: 100,
    sekolah_id: effectiveSekolahId,
  });
  const { data: sekolahList } = useSekolahList({ enabled: isSuperAdmin });
  const { mutate: generate, isPending: generating } = useGenerateSertifikat();
  const { mutate: deleteSertifikat, isPending: isDeleting } = useDeleteSertifikat();

  // Signature key state
  const signatureSekolahId = effectiveSekolahId ?? null;
  const { data: signatureKeyStatus, isLoading: isLoadingKeyStatus } = useSignatureKeyStatus(signatureSekolahId);
  const { mutate: generateSignatureKey, isPending: isGeneratingKey } = useGenerateSignatureKey();
  const [generatingKeyRole, setGeneratingKeyRole] = useState<"kepsek" | "penguji_eksternal" | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSertifikat(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Sertifikat berhasil dihapus");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Gagal menghapus sertifikat"),
    });
  };

  const handleGenerate = (nilaiId: number) => {
    setGeneratingId(nilaiId);
    generate(nilaiId, {
      onSuccess: data => toast.success(data.message ?? "Sertifikat berhasil digenerate"),
      onError: () => toast.error("Gagal generate sertifikat"),
      onSettled: () => setGeneratingId(null),
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Sertifikat</h1>
        <div className="flex border-b border-border">
          {(["sertifikat", "generate", "tanda-tangan"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              {t === "sertifikat" ? "Daftar Sertifikat" : t === "generate" ? "Generate Sertifikat" : "Tanda Tangan Digital"}
            </button>
          ))}
        </div>
        {isSuperAdmin && (
          <div className="mt-4">
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
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        title={`Hapus sertifikat "${deleteTarget?.label}"?`}
        description="Sertifikat akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      {tab === "sertifikat" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["No. Sertifikat", "Siswa", "UKK", "Nilai Akhir", "Predikat", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {loadingSertifikat ? (
              <SkeletonTableRows cols={7} widths={["w-32", "w-36", "w-32", "w-16", "w-8", "w-20", "w-20"]} />
            ) : (
              <tbody className="divide-y">
                {sertifikatData?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Belum ada sertifikat. Gunakan tab &quot;Generate Sertifikat&quot;.
                    </td>
                  </tr>
                )}
                {sertifikatData?.data.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{s.nomor_sertifikat}</td>
                    <td className="px-4 py-3">{s.nilai?.siswa?.nama ?? "—"}</td>
                    <td className="px-4 py-3">{s.nilai?.ukk?.nama ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold">{s.nilai?.nilai_akhir ?? "—"}</td>
                    <td className="px-4 py-3 font-bold text-yellow-700">{s.nilai?.predikat ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[s.status]} appearance="light">
                        {statusLabel[s.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      {s.status === "selesai" ? (
                        <Link href={`/sertifikat/${s.id}/print`} target="_blank">
                          <Button variant="outline" size="icon-sm" title="Cetak Sertifikat">
                            <Printer className="size-3.5" />
                            <span className="sr-only">Cetak</span>
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="icon-sm" disabled title="PDF belum tersedia">
                          <Printer className="size-3.5" />
                          <span className="sr-only">Cetak</span>
                        </Button>
                      )}
                      <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget({ id: s.id, label: s.nomor_sertifikat })}>
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {!loadingSertifikat && sertifikatData && <Pagination page={page} lastPage={sertifikatData.last_page} total={sertifikatData.total} perPage={15} onPageChange={setPage} />}
        </div>
      )}

      {tab === "generate" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-500">
            Hanya siswa dengan status <strong>Lulus</strong> yang dapat digenerate sertifikatnya.
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Siswa", "UKK", "Nilai Akhir", "Predikat", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {loadingNilai ? (
              <SkeletonTableRows cols={6} widths={["w-36", "w-32", "w-16", "w-8", "w-20", "w-24"]} />
            ) : (
              <tbody className="divide-y">
                {nilaiData?.data.filter(n => n.status === "Lulus").length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Tidak ada siswa dengan status Lulus.
                    </td>
                  </tr>
                )}
                {nilaiData?.data
                  .filter(n => n.status === "Lulus")
                  .map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{n.siswa?.nama ?? `#${n.siswa_id}`}</td>
                      <td className="px-4 py-3">{n.ukk?.nama ?? `#${n.ukk_id}`}</td>
                      <td className="px-4 py-3 font-semibold">{n.nilai_akhir}</td>
                      <td className="px-4 py-3 font-bold text-yellow-700">{n.predikat}</td>
                      <td className="px-4 py-3">
                        <Badge variant="success" appearance="light">
                          {n.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" disabled={generating && generatingId === n.id} onClick={() => handleGenerate(n.id)} className="w-[120px] justify-center">
                          {generating && generatingId === n.id ? (
                            <span className="inline-flex items-center justify-center">
                              <Loader2 className="size-4 animate-spin" />
                            </span>
                          ) : (
                            <span>Generate</span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
      )}

      {tab === "tanda-tangan" && (
        <div className="space-y-4">
          {isSuperAdmin && !signatureSekolahId && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Pilih sekolah terlebih dahulu untuk mengelola kunci tanda tangan digital.</p>}
          {signatureSekolahId && (
            <>
              <p className="text-sm text-muted-foreground">
                Kunci RSA-SHA256 digunakan untuk menandatangani sertifikat secara digital. Generate kunci untuk masing-masing penandatangan, lalu regenerasi sertifikat agar tanda tangan muncul di PDF.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(["kepsek", "penguji_eksternal"] as const).map(role => {
                  const keyInfo = signatureKeyStatus?.keys?.[role];
                  const hasKey = keyInfo?.has_key ?? false;
                  const label = role === "kepsek" ? "Kepala Sekolah" : "Penguji Eksternal";
                  return (
                    <div key={role} className="rounded-xl border bg-white shadow-sm p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                          <KeyRound className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-muted-foreground">Tanda Tangan Digital</p>
                        </div>
                      </div>
                      {isLoadingKeyStatus ? (
                        <p className="text-xs text-muted-foreground">Memeriksa status...</p>
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <span className={`size-2 rounded-full shrink-0 ${hasKey ? "bg-green-500" : "bg-red-400"}`} />
                          <span className="text-sm flex-1">{hasKey ? "Kunci aktif" : "Belum ada kunci"}</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant={hasKey ? "outline" : "default"}
                        className="w-full"
                        disabled={isGeneratingKey && generatingKeyRole === role}
                        onClick={() => {
                          if (!signatureSekolahId) return;
                          setGeneratingKeyRole(role);
                          generateSignatureKey(
                            { id: signatureSekolahId, role, force: hasKey },
                            {
                              onSuccess: () => toast.success(`Kunci ${label} berhasil di-generate`),
                              onError: () => toast.error(`Gagal generate kunci ${label}`),
                              onSettled: () => setGeneratingKeyRole(null),
                            },
                          );
                        }}
                      >
                        {isGeneratingKey && generatingKeyRole === role ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 className="size-3.5 animate-spin" />
                            Generating...
                          </span>
                        ) : hasKey ? (
                          "Generate Ulang"
                        ) : (
                          "Generate Kunci"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Peringatan: generate ulang kunci akan membuat tanda tangan sertifikat lama tidak bisa diverifikasi.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
