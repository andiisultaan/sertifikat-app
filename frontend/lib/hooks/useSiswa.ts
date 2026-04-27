'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { siswaService, SiswaPayload } from '@/services/api/siswaService';

const KEYS = {
  list: (params?: object) => ['siswa', params],
  detail: (id: number) => ['siswa', id],
};

export function useSiswaList(params?: { page?: number; per_page?: number; search?: string; sekolah_id?: number }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => siswaService.list(params),
  });
}

export function useSiswa(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => siswaService.get(id),
    enabled: !!id,
  });
}

export function useCreateSiswa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SiswaPayload) => siswaService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['siswa'] }),
  });
}

export function useUpdateSiswa(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SiswaPayload>) => siswaService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['siswa'] }),
  });
}

export function useDeleteSiswa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => siswaService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['siswa'] }),
  });
}
