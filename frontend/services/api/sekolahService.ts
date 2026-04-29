import api from "@/lib/api";

export interface Sekolah {
  id: number;
  nama: string;
  alamat?: string | null;
  nama_kepsek?: string | null;
  nip_kepsek?: string | null;
  nama_universitas?: string | null;
  logo_path?: string | null;
  background_template_path?: string | null;
  logo_url?: string | null;
  background_template_url?: string | null;
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
  accounts?: Partial<
    Record<
      "admin" | "penguji_internal" | "penguji_external",
      {
        id: number;
        name: string;
        email: string;
        password: string;
      }
    >
  >;
}

export interface UpdateSekolahPayload {
  nama?: string;
  alamat?: string | null;
  nama_kepsek?: string | null;
  nip_kepsek?: string | null;
  nama_universitas?: string | null;
  logo?: File;
  background_template?: File;
  remove_logo?: boolean;
  remove_background?: boolean;
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

  async update(id: number, payload: UpdateSekolahPayload): Promise<Sekolah> {
    const hasBinary = payload.logo instanceof File || payload.background_template instanceof File || payload.remove_logo || payload.remove_background;
    if (hasBinary) {
      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "boolean") {
          formData.append(key, value ? "1" : "0");
        } else {
          formData.append(key, String(value));
        }
      });

      const { data } = await api.post<Sekolah>(`/sekolah/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    const { data } = await api.put<Sekolah>(`/sekolah/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/sekolah/${id}`);
  },

  async signatureKeyStatus(id: number): Promise<{ sekolah_id: number; keys: Record<"kepsek" | "penguji_eksternal", { has_key: boolean; message: string }> }> {
    const { data } = await api.get(`/sekolah/${id}/signature-key`);
    return data;
  },

  async generateSignatureKey(id: number, role: "kepsek" | "penguji_eksternal", force = false): Promise<{ message: string }> {
    const { data } = await api.post(`/sekolah/${id}/signature-key/generate`, { role, force });
    return data;
  },
};
