import api from "@/lib/api";
import { LoginFormValues } from "@/lib/validations/authSchema";

export type UserRole = "super_admin" | "admin" | "penguji_internal" | "penguji_external";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginFormValues): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/login", credentials);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/logout");
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/me");
    return data;
  },

  async changePassword(payload: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<void> {
    await api.post("/change-password", payload);
  },
};
