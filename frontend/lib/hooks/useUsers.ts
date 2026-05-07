"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService, UserPayload } from "@/services/api/userService";

export function useUserList(params?: { search?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.list(params),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useGetUser(id: number) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.get(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserPayload>) => userService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
