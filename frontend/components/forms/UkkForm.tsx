"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { ukkSchema, UkkFormValues } from "@/lib/validations/ukkSchema";
import { Ukk } from "@/services/api/ukkService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  defaultValues?: Partial<Ukk>;
  onSubmit: (values: UkkFormValues) => void;
  isPending: boolean;
  mode?: "create" | "edit";
}

const TABS = ["Data UKK", "Info Sertifikat", "Daftar Kompetensi"] as const;
const STEPS = TABS;

const STEP_FIELDS: Record<number, (keyof UkkFormValues)[]> = {
  0: ["nama", "judul_pengujian", "jurusan", "tahun", "tanggal_mulai", "tanggal_selesai", "status"],
  1: ["nama_sekolah", "alamat_sekolah", "nama_kepsek", "nip_kepsek", "nama_penguji_internal", "nama_penguji_external", "nama_universitas"],
  2: ["kompetensi"],
};

type KompetensiGroupValue = { sub_judul: string; items: { kode: string; judul: string }[] };

const emptyGroup = (): KompetensiGroupValue => ({ sub_judul: "", items: [] });

/** Normalises any legacy/stored kompetensi format into the new grouped format */
function normaliseKompetensi(raw: unknown): KompetensiGroupValue[] {
  if (!raw) return [];

  // New format: [{sub_judul, items}]
  if (Array.isArray(raw) && raw.length > 0 && "items" in (raw[0] ?? {})) {
    return raw as KompetensiGroupValue[];
  }

  // Old flat format: [{kode, judul}]
  if (Array.isArray(raw) && raw.length > 0 && "kode" in (raw[0] ?? {})) {
    return [{ sub_judul: "", items: raw as { kode: string; judul: string }[] }];
  }

  // Old object format: {utama: {perencanaan_persiapan, implementasi, pengujian_dokumentasi}, pendukung}
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    const groups: KompetensiGroupValue[] = [];
    const utama = obj["utama"] as Record<string, { kode: string; judul: string }[]> | undefined;
    if (utama) {
      const subKeys: { key: string; label: string }[] = [
        { key: "perencanaan_persiapan", label: "Perencanaan dan Persiapan" },
        { key: "implementasi", label: "Implementasi" },
        { key: "pengujian_dokumentasi", label: "Pengujian & Dokumentasi" },
      ];
      for (const { key, label } of subKeys) {
        const items = (utama[key] ?? []) as { kode: string; judul: string }[];
        if (items.length > 0) groups.push({ sub_judul: label, items });
      }
    }
    const pendukung = obj["pendukung"] as { kode: string; judul: string }[] | undefined;
    if (pendukung && pendukung.length > 0) {
      groups.push({ sub_judul: "Kompetensi Pendukung", items: pendukung });
    }
    return groups;
  }

  return [];
}

function buildResetValues(dv: Partial<Ukk>) {
  return {
    nama: dv.nama ?? "",
    judul_pengujian: dv.judul_pengujian ?? "",
    jurusan: dv.jurusan ?? "",
    tahun: dv.tahun,
    tanggal_mulai: dv.tanggal_mulai?.toString().slice(0, 10) ?? "",
    tanggal_selesai: dv.tanggal_selesai?.toString().slice(0, 10) ?? "",
    status: dv.status,
    kompetensi: normaliseKompetensi(dv.kompetensi),
    nama_sekolah: dv.nama_sekolah ?? "",
    alamat_sekolah: dv.alamat_sekolah ?? "",
    nama_kepsek: dv.nama_kepsek ?? "",
    nip_kepsek: dv.nip_kepsek ?? "",
    nama_penguji_internal: dv.nama_penguji_internal ?? "",
    nama_penguji_external: dv.nama_penguji_external ?? "",
    nama_universitas: dv.nama_universitas ?? "",
  };
}

// ── Nested items inside each group ────────────────────────────────────────
function GroupItemsRows({
  nestIndex,
  control,
  register,
}: {
  nestIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `kompetensi.${nestIndex}.items`,
  });

  return (
    <div className="space-y-2 pl-3 border-l-2 border-slate-200">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-center">
          <span className="text-xs text-slate-400 w-5 shrink-0 text-right">{index + 1}.</span>
          <Input {...register(`kompetensi.${nestIndex}.items.${index}.kode`)} placeholder="J.611000.001.01" className="w-36 shrink-0 text-xs h-8" />
          <Input {...register(`kompetensi.${nestIndex}.items.${index}.judul`)} placeholder="Judul kompetensi..." className="flex-1 text-xs h-8" />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="size-8 text-red-400 hover:text-red-600 shrink-0">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          append({ kode: "", judul: "" });
        }}
        className="h-7 text-xs gap-1 mt-1"
      >
        <Plus className="size-3" /> Tambah Item
      </Button>
    </div>
  );
}

// Remove groups with no items (and items with empty judul)
function cleanKompetensi(values: UkkFormValues): UkkFormValues {
  if (!values.kompetensi) return values;
  const cleaned = (values.kompetensi as KompetensiGroupValue[])
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.judul.trim() !== ""),
    }))
    .filter(group => group.items.length > 0);
  return { ...values, kompetensi: cleaned };
}

export function UkkForm({ defaultValues, onSubmit, isPending, mode = "create" }: Props) {
  const [active, setActive] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    formState: { errors },
  } = useForm<UkkFormValues>({
    resolver: zodResolver(ukkSchema),
    defaultValues: { kompetensi: [] },
  });

  // ── Field arrays ──────────────────────────────────────────────────────────
  const groupFields = useFieldArray({ control, name: "kompetensi" });

  const prevResetKeyRef = useRef<string>("");
  useEffect(() => {
    if (!defaultValues) return;

    const resetKey =
      mode === "edit"
        ? `edit:${defaultValues.id ?? "no-id"}:${defaultValues.updated_at ?? ""}`
        : `create:${defaultValues.nama_sekolah ?? ""}|${defaultValues.alamat_sekolah ?? ""}|${defaultValues.nama_kepsek ?? ""}|${defaultValues.nip_kepsek ?? ""}|${defaultValues.nama_universitas ?? ""}`;

    if (resetKey === prevResetKeyRef.current) return;
    prevResetKeyRef.current = resetKey;

    reset(buildResetValues(defaultValues));
  }, [defaultValues, mode, reset]);

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[active]);
    if (valid) setActive(s => s + 1);
  };
  const handleBack = () => setActive(s => s - 1);

  // Guard: prevent accidental submit from button-swap race condition
  const handleFormSubmit = handleSubmit(values => {
    if (active < STEPS.length - 1) return;
    onSubmit(cleanKompetensi(values));
  });

  // Edit mode submit
  const handleEditSubmit = handleSubmit(values => {
    onSubmit(cleanKompetensi(values));
  });

  // ── Section: Data UKK ─────────────────────────────────────────────────────
  const sectionDataUkk = (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-1">
        <Label htmlFor="nama">Nama UKK</Label>
        <Input id="nama" {...register("nama")} placeholder="UKK 2025 - RPL" />
        {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
      </div>
      <div className="col-span-2 space-y-1">
        <Label htmlFor="judul_pengujian">Judul Pengujian</Label>
        <Input id="judul_pengujian" {...register("judul_pengujian")} placeholder="Rancang bangun dan konfigurasi jaringan..." />
      </div>
      <div className="space-y-1">
        <Label htmlFor="jurusan">Jurusan</Label>
        <Input id="jurusan" {...register("jurusan")} placeholder="Teknik Komputer dan Jaringan" />
        {errors.jurusan && <p className="text-xs text-red-500">{errors.jurusan.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="tahun">Tahun</Label>
        <Input id="tahun" type="number" {...register("tahun", { valueAsNumber: true })} placeholder="2025" />
        {errors.tahun && <p className="text-xs text-red-500">{errors.tahun.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
        <Input id="tanggal_mulai" type="date" {...register("tanggal_mulai")} />
        {errors.tanggal_mulai && <p className="text-xs text-red-500">{errors.tanggal_mulai.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
        <Input id="tanggal_selesai" type="date" {...register("tanggal_selesai")} />
        {errors.tanggal_selesai && <p className="text-xs text-red-500">{errors.tanggal_selesai.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <select id="status" {...register("status")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
          <option value="aktif">Aktif</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>
    </div>
  );

  // ── Section: Info Sertifikat ───────────────────────────────────────────────
  const sectionInfoSertifikat = (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-1">
        <Label>Nama Sekolah</Label>
        <Input {...register("nama_sekolah")} placeholder="SMK Negeri 1 Kota" />
      </div>
      <div className="col-span-2 space-y-1">
        <Label>Alamat Sekolah</Label>
        <Input {...register("alamat_sekolah")} placeholder="Jl. Pendidikan No. 1" />
      </div>
      <div className="space-y-1">
        <Label>Nama Kepala Sekolah</Label>
        <Input {...register("nama_kepsek")} placeholder="Drs. Nama Kepsek, M.Pd" />
      </div>
      <div className="space-y-1">
        <Label>NIP Kepala Sekolah</Label>
        <Input {...register("nip_kepsek")} placeholder="197001012000011001" />
      </div>
      <div className="space-y-1">
        <Label>Penguji Internal</Label>
        <Input {...register("nama_penguji_internal")} placeholder="Nama Guru, S.Kom" />
      </div>
      <div className="space-y-1">
        <Label>Penguji External</Label>
        <Input {...register("nama_penguji_external")} placeholder="Nama Penguji, M.Kom" />
      </div>
      <div className="col-span-2 space-y-1">
        <Label>Nama Universitas / Instansi Penguji External</Label>
        <Input {...register("nama_universitas")} placeholder="Universitas Duta Bangsa Surakarta" />
      </div>
    </div>
  );

  // ── Section: Daftar Kompetensi ─────────────────────────────────────────────
  const sectionKompetensi = (
    <div className="space-y-4">
      {groupFields.fields.map((group, gi) => (
        <div key={group.id} className="rounded-lg border border-slate-200 overflow-hidden">
          {/* Group header with optional sub_judul input */}
          <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <Input
                {...register(`kompetensi.${gi}.sub_judul`)}
                placeholder="Sub Judul (opsional, mis. Perencanaan dan Persiapan)"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-sm h-7 focus-visible:ring-white/30"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => groupFields.remove(gi)} className="size-7 text-red-300 hover:text-red-100 hover:bg-white/10 shrink-0">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <div className="p-4">
            <GroupItemsRows nestIndex={gi} control={control} register={register} />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          groupFields.append(emptyGroup());
        }}
        className="gap-1.5 text-xs"
      >
        <Plus className="size-3.5" /> Tambah Grup Kompetensi
      </Button>

      {groupFields.fields.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada kompetensi. Klik &ldquo;Tambah Grup Kompetensi&rdquo; untuk menambahkan.</p>}
    </div>
  );

  // ── EDIT mode ──────────────────────────────────────────────────────────────
  if (mode === "edit") {
    return (
      <form
        onSubmit={handleEditSubmit}
        className="space-y-4"
        onKeyDown={e => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
        }}
      >
        <div className="flex border-b border-border">
          {TABS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${active === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="pt-1">
          {active === 0 && sectionDataUkk}
          {active === 1 && sectionInfoSertifikat}
          {active === 2 && sectionKompetensi}
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    );
  }

  // ── CREATE mode ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={e => e.preventDefault()}
      className="space-y-5"
      onKeyDown={e => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
      }}
    >
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < active ? "bg-primary text-white" : i === active ? "bg-primary text-white ring-4 ring-primary/20" : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < active ? "✓" : i + 1}
              </span>
              <span className={`text-sm font-medium transition-colors ${i === active ? "text-gray-900" : i < active ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-3 h-px w-8 transition-colors ${i < active ? "bg-primary" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        {active === 0 && sectionDataUkk}
        {active === 1 && sectionInfoSertifikat}
        {active === 2 && sectionKompetensi}
      </div>

      <div className="flex justify-between pt-2 border-t">
        <div>
          {active > 0 && (
            <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="size-4" /> Kembali
            </Button>
          )}
        </div>
        <div>
          {active < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext} className="relative pe-12">
              Lanjutkan
              <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                <ChevronRight className="opacity-60 size-4" strokeWidth={2} aria-hidden="true" />
              </span>
            </Button>
          ) : (
            <Button type="button" disabled={isPending} onClick={() => handleFormSubmit()}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
