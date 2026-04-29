"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateSekolahPayload, sekolahService, UpdateSekolahPayload } from "@/services/api/sekolahService";

const KEYS = {
  list: ["sekolah"] as const,
  detail: (id: number) => ["sekolah", id] as const,
};

export function useSekolahList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: () => sekolahService.list(),
    enabled: options?.enabled ?? true,
  });
}

export function useSekolahDetail(id?: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id ?? 0),
    queryFn: () => sekolahService.detail(id as number),
    enabled: !!id,
  });
}

export function useCreateSekolah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSekolahPayload) => sekolahService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useUpdateSekolah(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSekolahPayload) => sekolahService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteSekolah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sekolahService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useSignatureKeyStatus(id: number | null) {
  return useQuery({
    queryKey: ["sekolah", id, "signature-key"] as const,
    queryFn: () => sekolahService.signatureKeyStatus(id as number),
    enabled: !!id,
  });
}

export function useGenerateSignatureKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, force }: { id: number; role: "kepsek" | "penguji_eksternal"; force?: boolean }) => sekolahService.generateSignatureKey(id, role, force),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["sekolah", id, "signature-key"] });
    },
  });
}
