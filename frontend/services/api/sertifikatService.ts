import api from '@/lib/api';
import { PaginatedResponse } from './siswaService';
import { Nilai } from './nilaiService';

export interface Sertifikat {
  id: number;
  nilai_id: number;
  template_id: number;
  nomor_sertifikat: string;
  file_path: string | null;
  status: 'pending' | 'processing' | 'selesai' | 'gagal';
  error_message: string | null;
  generated_at: string | null;
  nilai?: Nilai;
  created_at: string;
  updated_at: string;
}

export const sertifikatService = {
  async list(params?: { page?: number; per_page?: number }) {
    const { data } = await api.get<PaginatedResponse<Sertifikat>>('/sertifikat', { params });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<Sertifikat>(`/sertifikat/${id}`);
    return data;
  },

  async generate(nilaiId: number) {
    const { data } = await api.post<{ message: string; sertifikat: Sertifikat }>(
      '/sertifikat/generate',
      { nilai_id: nilaiId }
    );
    return data;
  },

  async remove(id: number) {
    await api.delete(`/sertifikat/${id}`);
  },

  downloadUrl(id: number): string {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    return `${base}/sertifikat/${id}/download`;
  },
};
