import api from "@/lib/api";

export interface Siswa {
  id: number;
  nisn: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  jurusan: string;
  tahun_masuk: number;
  created_at: string;
  updated_at: string;
}

export interface SiswaPayload {
  nisn: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  jurusan: string;
  tahun_masuk: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const siswaService = {
  async list(params?: { page?: number; per_page?: number; search?: string; sekolah_id?: number }) {
    const { data } = await api.get<PaginatedResponse<Siswa>>("/siswa", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<Siswa>(`/siswa/${id}`);
    return data;
  },

  async create(payload: SiswaPayload) {
    const { data } = await api.post<Siswa>("/siswa", payload);
    return data;
  },

  async update(id: number, payload: Partial<SiswaPayload>) {
    const { data } = await api.put<Siswa>(`/siswa/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/siswa/${id}`);
  },
};
