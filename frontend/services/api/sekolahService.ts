import api from "@/lib/api";

export interface Sekolah {
  id: number;
  nama: string;
  alamat?: string | null;
  nama_kepsek?: string | null;
  nip_kepsek?: string | null;
  nama_universitas?: string | null;
  created_at?: string;
  updated_at?: string;
  admin?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreateSekolahPayload {
  nama: string;
}

export interface CreateSekolahResponse {
  sekolah: Sekolah;
  admin: {
    id: number;
    name: string;
    email: string;
    password: string;
  };
}

export const sekolahService = {
  async list(): Promise<Sekolah[]> {
    const { data } = await api.get<Sekolah[]>("/sekolah");
    return data;
  },

  async detail(id: number): Promise<Sekolah> {
    const { data } = await api.get<Sekolah>(`/sekolah/${id}`);
    return data;
  },

  async create(payload: CreateSekolahPayload): Promise<CreateSekolahResponse> {
    const { data } = await api.post<CreateSekolahResponse>("/sekolah", payload);
    return data;
  },

  async update(id: number, payload: Partial<Sekolah>): Promise<Sekolah> {
    const { data } = await api.put<Sekolah>(`/sekolah/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/sekolah/${id}`);
  },
};
