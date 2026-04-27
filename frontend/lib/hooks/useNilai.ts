'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nilaiService, NilaiPayload, UpdateNilaiPayload } from '@/services/api/nilaiService';

const KEYS = {
  list: (params?: object) => ['nilai', params],
  detail: (id: number) => ['nilai', id],
};

export function useNilaiList(params?: { page?: number; per_page?: number; ukk_id?: number; siswa_id?: number; sekolah_id?: number }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => nilaiService.list(params),
  });
}

export function useNilai(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => nilaiService.get(id),
    enabled: !!id,
  });
}

export function useCreateNilai() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NilaiPayload) => nilaiService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nilai'] }),
  });
}

export function useUpdateNilai(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNilaiPayload) => nilaiService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nilai'] }),
  });
}

export function useDeleteNilai() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => nilaiService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nilai'] }),
  });
}
