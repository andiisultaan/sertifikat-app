import { z } from "zod";

const nilaiKomponen = z.number({ invalid_type_error: "Nilai harus berupa angka." }).min(0, "Nilai minimum 0.").max(100, "Nilai maksimum 100.").nullable().optional();

export const nilaiSchema = z.object({
  siswa_id: z.number({ invalid_type_error: "Siswa wajib dipilih." }).int().positive(),
  ukk_id: z.number({ invalid_type_error: "UKK wajib dipilih." }).int().positive(),
  nilai_internal: nilaiKomponen,
  nilai_eksternal: nilaiKomponen,
});

export const updateNilaiSchema = z.object({
  nilai_internal: nilaiKomponen,
  nilai_eksternal: nilaiKomponen,
});

export type NilaiFormValues = z.infer<typeof nilaiSchema>;
export type UpdateNilaiFormValues = z.infer<typeof updateNilaiSchema>;
