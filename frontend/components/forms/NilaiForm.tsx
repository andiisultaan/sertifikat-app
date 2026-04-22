"use client";

import { useEffect } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nilaiSchema, NilaiFormValues } from "@/lib/validations/nilaiSchema";
import { Nilai } from "@/services/api/nilaiService";
import { Siswa } from "@/services/api/siswaService";
import { Ukk } from "@/services/api/ukkService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiswaSearchInput } from "@/components/ui/siswa-search-input";

interface Props {
  defaultValues?: Partial<Nilai>;
  siswaList: Siswa[];
  ukkList: Ukk[];
  onSubmit: (values: NilaiFormValues) => void;
  isPending: boolean;
}

export function NilaiForm({ defaultValues, siswaList, ukkList, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NilaiFormValues>({
    resolver: zodResolver(nilaiSchema),
  });

  const { field: siswaField } = useController({ name: "siswa_id", control });

  useEffect(() => {
    if (defaultValues) {
      reset({
        siswa_id: defaultValues.siswa_id,
        ukk_id: defaultValues.ukk_id,
        nilai_internal: defaultValues.nilai_internal ?? undefined,
        nilai_eksternal: defaultValues.nilai_eksternal ?? undefined,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Siswa</Label>
          <SiswaSearchInput siswaList={siswaList} value={siswaField.value ?? null} onChange={siswaField.onChange} error={errors.siswa_id?.message} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="ukk_id">UKK</Label>
          <select id="ukk_id" {...register("ukk_id", { valueAsNumber: true })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            <option value="">Pilih UKK...</option>
            {ukkList.map(u => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
          </select>
          {errors.ukk_id && <p className="text-xs text-red-500">{errors.ukk_id.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="nilai_internal">Penguji Internal (0–100)</Label>
          <Input id="nilai_internal" type="number" step="0.01" {...register("nilai_internal", { valueAsNumber: true })} placeholder="0–100" />
          {errors.nilai_internal && <p className="text-xs text-red-500">{errors.nilai_internal.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="nilai_eksternal">Penguji Eksternal (0–100)</Label>
          <Input id="nilai_eksternal" type="number" step="0.01" {...register("nilai_eksternal", { valueAsNumber: true })} placeholder="0–100" />
          {errors.nilai_eksternal && <p className="text-xs text-red-500">{errors.nilai_eksternal.message}</p>}
        </div>
      </div>

      <p className="text-xs text-gray-400">Nilai akhir dihitung dari rata-rata nilai internal dan eksternal. Predikat dihitung otomatis saat disimpan.</p>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
