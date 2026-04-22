"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Printer, Loader2 } from "lucide-react";
import { useSertifikatList, useGenerateSertifikat, useDeleteSertifikat } from "@/lib/hooks/useSertifikat";
import { useNilaiList } from "@/lib/hooks/useNilai";
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
  const [tab, setTab] = useState<"sertifikat" | "generate">("sertifikat");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const { data: sertifikatData, isLoading: loadingSertifikat } = useSertifikatList({ page });
  const { data: nilaiData, isLoading: loadingNilai } = useNilaiList({ per_page: 100 });
  const { mutate: generate, isPending: generating } = useGenerateSertifikat();
  const { mutate: deleteSertifikat, isPending: isDeleting } = useDeleteSertifikat();

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
          {(["sertifikat", "generate"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              {t === "sertifikat" ? "Daftar Sertifikat" : "Generate Sertifikat"}
            </button>
          ))}
        </div>
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
    </div>
  );
}
