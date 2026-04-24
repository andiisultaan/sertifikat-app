"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type School = {
  id: number;
  nama: string;
};

type NilaiItem = {
  id: number;
  nilai_internal: number | null;
  nilai_eksternal: number | null;
  nilai_akhir: number | null;
  predikat: string | null;
  status: string | null;
  is_finalized: boolean;
  updated_at: string;
  ukk: {
    id: number;
    nama: string;
    jurusan: string | null;
    tahun: string | number | null;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
  } | null;
};

type SearchResponse = {
  siswa: {
    id: number;
    nis: string;
    nama: string;
    jurusan: string;
    sekolah_id: number;
  };
  nilai: NilaiItem[];
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function fmtNumber(v: number | null): string {
  if (v === null || v === undefined) return "-";
  return String(v);
}

function fmtDate(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CekNilaiPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoadingSchools(true);
        const res = await fetch(`${apiBase}/public/sekolah`, { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal memuat daftar sekolah.");
        const data = (await res.json()) as School[];
        if (mounted) setSchools(data);
      } catch (e) {
        if (mounted) setError((e as Error).message || "Gagal memuat data.");
      } finally {
        if (mounted) setIsLoadingSchools(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedSchoolName = useMemo(() => {
    const id = Number(schoolId);
    return schools.find((s) => s.id === id)?.nama ?? "-";
  }, [schoolId, schools]);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!schoolId || (!nis.trim() && !nama.trim())) {
      setError("Pilih sekolah lalu isi NIS atau nama siswa.");
      return;
    }

    try {
      setIsSearching(true);
      const q = new URLSearchParams({ sekolah_id: schoolId });
      if (nis.trim()) q.set("nis", nis.trim());
      if (nama.trim()) q.set("nama", nama.trim());
      const res = await fetch(`${apiBase}/public/nilai?${q.toString()}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Data nilai tidak ditemukan.");
      }

      setResult(data as SearchResponse);
    } catch (e) {
      setError((e as Error).message || "Terjadi kesalahan saat mencari nilai.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Cek Nilai Siswa</h1>
          <p className="mt-1 text-sm text-slate-600">Halaman publik untuk melihat nilai berdasarkan sekolah dan NIS atau nama siswa.</p>

          <form onSubmit={onSearch} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Sekolah</label>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                disabled={isLoadingSchools}
              >
                <option value="">{isLoadingSchools ? "Memuat sekolah..." : "Pilih sekolah"}</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">NIS</label>
              <input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Masukkan NIS (opsional)"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nama Siswa</label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama (opsional)"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              />
            </div>

            <div className="self-end">
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSearching ? "Mencari..." : "Cari Nilai"}
              </button>
            </div>
          </form>

          {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Data Siswa</h2>
              <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                <p>
                  <span className="font-medium">Sekolah:</span> {selectedSchoolName}
                </p>
                <p>
                  <span className="font-medium">NIS:</span> {result.siswa.nis}
                </p>
                <p>
                  <span className="font-medium">Nama:</span> {result.siswa.nama}
                </p>
                <p>
                  <span className="font-medium">Jurusan:</span> {result.siswa.jurusan}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {["UKK", "Tahun", "Internal", "Eksternal", "Nilai Akhir", "Predikat", "Status", "Update"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.nilai.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        Belum ada nilai untuk siswa ini.
                      </td>
                    </tr>
                  )}
                  {result.nilai.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{n.ukk?.nama ?? "-"}</td>
                      <td className="px-4 py-3">{n.ukk?.tahun ?? "-"}</td>
                      <td className="px-4 py-3">{fmtNumber(n.nilai_internal)}</td>
                      <td className="px-4 py-3">{fmtNumber(n.nilai_eksternal)}</td>
                      <td className="px-4 py-3 font-semibold">{fmtNumber(n.nilai_akhir)}</td>
                      <td className="px-4 py-3">{n.predikat ?? "-"}</td>
                      <td className="px-4 py-3">{n.status ?? "-"}</td>
                      <td className="px-4 py-3">{fmtDate(n.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
