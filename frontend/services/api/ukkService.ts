import api from "@/lib/api";
import { PaginatedResponse } from "./siswaService";

export interface KompetensiItem {
  kode: string;
  judul: string;
}

export interface KompetensiUtama {
  perencanaan_persiapan: KompetensiItem[];
  implementasi: KompetensiItem[];
  pengujian_dokumentasi: KompetensiItem[];
}

export interface KompetensiData {
  utama: KompetensiUtama;
  pendukung: KompetensiItem[];
}

export interface Ukk {
  id: number;
  nama: string;
  judul_pengujian?: string;
  jurusan: string;
  tahun: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: "aktif" | "selesai";
  kompetensi?: KompetensiData;
  nama_sekolah?: string;
  alamat_sekolah?: string;
  nama_kepsek?: string;
  nip_kepsek?: string;
  nama_penguji_internal?: string;
  nama_penguji_external?: string;
  nama_universitas?: string;
  created_at: string;
  updated_at: string;
}

export interface UkkPayload {
  nama: string;
  judul_pengujian?: string;
  jurusan: string;
  tahun: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status?: "aktif" | "selesai";
  kompetensi?: KompetensiData;
  nama_sekolah?: string;
  alamat_sekolah?: string;
  nama_kepsek?: string;
  nip_kepsek?: string;
  nama_penguji_internal?: string;
  nama_penguji_external?: string;
  nama_universitas?: string;
}

export const ukkService = {
  async list(params?: { page?: number; per_page?: number; search?: string; sekolah_id?: number }) {
    const { data } = await api.get<PaginatedResponse<Ukk>>("/ukk", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<Ukk>(`/ukk/${id}`);
    return data;
  },

  async create(payload: UkkPayload) {
    const { data } = await api.post<Ukk>("/ukk", payload);
    return data;
  },

  async update(id: number, payload: Partial<UkkPayload>) {
    const { data } = await api.put<Ukk>(`/ukk/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/ukk/${id}`);
  },
};
