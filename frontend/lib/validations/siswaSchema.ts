import { z } from "zod";

export const siswaSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi.").max(20),
  nama: z.string().min(1, "Nama wajib diisi.").max(255),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi.").max(100),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi."),
  jenis_kelamin: z.enum(["L", "P"], { invalid_type_error: "Jenis kelamin wajib dipilih." }),
  jurusan: z.string().min(1, "Jurusan wajib diisi.").max(100),
  tahun_masuk: z.number({ invalid_type_error: "Tahun masuk wajib diisi." }).int().min(2000).max(2100),
});

export type SiswaFormValues = z.infer<typeof siswaSchema>;
