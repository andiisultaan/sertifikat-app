import api from "@/lib/api";
import { PaginatedResponse } from "./siswaService";
import { Siswa } from "./siswaService";
import { Ukk } from "./ukkService";

export interface Nilai {
  id: number;
  siswa_id: number;
  ukk_id: number;
  nilai_internal: number | null;
  nilai_eksternal: number | null;
  nilai_akhir: number | null;
  status: "Lulus" | "Tidak Lulus" | null;
  predikat: string | null;
  is_finalized: boolean;
  siswa?: Siswa;
  ukk?: Ukk;
  created_at: string;
  updated_at: string;
}

export interface NilaiPayload {
  siswa_id: number;
  ukk_id: number;
  nilai_internal?: number | null;
  nilai_eksternal?: number | null;
}

export interface UpdateNilaiPayload {
  nilai_internal?: number | null;
  nilai_eksternal?: number | null;
}

export const nilaiService = {
  async list(params?: { page?: number; per_page?: number; ukk_id?: number; siswa_id?: number }) {
    const { data } = await api.get<PaginatedResponse<Nilai>>("/nilai", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<Nilai>(`/nilai/${id}`);
    return data;
  },

  async create(payload: NilaiPayload) {
    const { data } = await api.post<Nilai>("/nilai", payload);
    return data;
  },

  async update(id: number, payload: UpdateNilaiPayload) {
    const { data } = await api.put<Nilai>(`/nilai/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/nilai/${id}`);
  },
};
