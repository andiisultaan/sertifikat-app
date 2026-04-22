"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateNilaiSchema, UpdateNilaiFormValues } from "@/lib/validations/nilaiSchema";
import { useNilai, useUpdateNilai } from "@/lib/hooks/useNilai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function EditNilaiPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: nilai, isLoading } = useNilai(Number(id));
  const { mutate: update, isPending, error } = useUpdateNilai(Number(id));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNilaiFormValues>({
    resolver: zodResolver(updateNilaiSchema),
  });

  useEffect(() => {
    if (nilai) {
      reset({
        nilai_internal: nilai.nilai_internal ?? undefined,
        nilai_eksternal: nilai.nilai_eksternal ?? undefined,
      });
    }
  }, [nilai, reset]);

  const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  const onSubmit = (values: UpdateNilaiFormValues) => {
    update(values, { onSuccess: () => router.push("/nilai") });
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Edit Nilai</h1>

      {isLoading ? (
        <Skeleton className="h-4 w-48 mb-6" />
      ) : (
        nilai && (
          <p className="text-sm text-gray-500 mb-6">
            {nilai.siswa?.nama} — {nilai.ukk?.nama}
          </p>
        )
      )}

      {apiError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">{apiError}</p>}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
            <Skeleton className="h-4 w-64" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ) : (
          <>
            {nilai?.nilai_akhir !== null && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm flex gap-6">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="nilai_internal">Penguji Internal</Label>
                <Input id="nilai_internal" type="number" step="0.01" {...register("nilai_internal", { valueAsNumber: true })} />
                {errors.nilai_internal && <p className="text-xs text-red-500">{errors.nilai_internal.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="nilai_eksternal">Penguji Eksternal</Label>
                <Input id="nilai_eksternal" type="number" step="0.01" {...register("nilai_eksternal", { valueAsNumber: true })} />
                {errors.nilai_eksternal && <p className="text-xs text-red-500">{errors.nilai_eksternal.message}</p>}
              </div>
              <p className="text-xs text-gray-400">Nilai akhir dihitung dari rata-rata nilai internal dan eksternal. Predikat dihitung ulang otomatis.</p>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
