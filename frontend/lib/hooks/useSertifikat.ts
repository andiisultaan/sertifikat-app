'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sertifikatService } from '@/services/api/sertifikatService';

const KEYS = {
  list: (params?: object) => ['sertifikat', params],
  detail: (id: number) => ['sertifikat', id],
};

export function useSertifikatList(params?: { page?: number; per_page?: number; sekolah_id?: number }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => sertifikatService.list(params),
  });
}

export function useSertifikat(id: number, polling = false) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => sertifikatService.get(id),
    enabled: !!id,
    // Poll setiap 3 detik, berhenti otomatis saat status selesai/gagal
    refetchInterval: (query) => {
      if (!polling) return false;
      const status = query.state.data?.status;
      if (status === 'selesai' || status === 'gagal') return false;
      return 3000;
    },
  });
}

export function useGenerateSertifikat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nilaiId: number) => sertifikatService.generate(nilaiId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sertifikat'] });
      qc.invalidateQueries({ queryKey: ['nilai'] });
    },
  });
}

export function useDeleteSertifikat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sertifikatService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sertifikat'] }),
  });
}
