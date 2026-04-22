"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api/authService";
import { useAuthStore } from "@/store/authStore";
import { LoginFormValues } from "@/lib/validations/authSchema";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginFormValues) => authService.login(credentials),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      router.push("/login");
    },
    onError: () => {
      // Force logout even if API call fails
      clearAuth();
      router.push("/login");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { current_password: string; new_password: string; new_password_confirmation: string }) => authService.changePassword(payload),
  });
}
