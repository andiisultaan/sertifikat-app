'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ukkService, UkkPayload } from '@/services/api/ukkService';

const KEYS = {
  list: (params?: object) => ['ukk', params],
  detail: (id: number) => ['ukk', id],
};

export function useUkkList(params?: { page?: number; per_page?: number; search?: string; sekolah_id?: number }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => ukkService.list(params),
  });
}

export function useUkk(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => ukkService.get(id),
    enabled: !!id,
  });
}

export function useCreateUkk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UkkPayload) => ukkService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ukk'] }),
  });
}

export function useUpdateUkk(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UkkPayload>) => ukkService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ukk'] }),
  });
}

export function useDeleteUkk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ukkService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ukk'] }),
  });
}
