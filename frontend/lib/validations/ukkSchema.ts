import { z } from "zod";

const kompetensiItem = z.object({
  kode: z.string().default(""),
  judul: z.string().default(""),
});

const kompetensiGroup = z.object({
  sub_judul: z.string().default(""),
  items: z.array(kompetensiItem).default([]),
});

const kompetensiSchema = z.array(kompetensiGroup).default([]);

export const ukkSchema = z
  .object({
    nama: z.string().min(1, "Nama UKK wajib diisi.").max(255),
    judul_pengujian: z.string().optional(),
    jurusan: z.string().min(1, "Jurusan wajib diisi.").max(100),
    tahun: z.number({ invalid_type_error: "Tahun wajib diisi." }).int().min(2000).max(2100),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi."),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi."),
    status: z.enum(["aktif", "selesai"]).optional(),
    kompetensi: kompetensiSchema.optional(),
    nama_sekolah: z.string().optional(),
    alamat_sekolah: z.string().optional(),
    nama_kepsek: z.string().optional(),
    nip_kepsek: z.string().optional(),
    nama_penguji_internal: z.string().optional(),
    nama_penguji_external: z.string().optional(),
    nama_universitas: z.string().optional(),
  })
  .refine(d => d.tanggal_selesai >= d.tanggal_mulai, {
    message: "Tanggal selesai harus setelah tanggal mulai.",
    path: ["tanggal_selesai"],
  });

export type UkkFormValues = z.infer<typeof ukkSchema>;
