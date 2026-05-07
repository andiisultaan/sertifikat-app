import api from "@/lib/api";
import { UserRole } from "./authService";

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  sekolah_id?: number | null;
  sekolah?: {
    id: number;
    nama: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export type ManageableUserRole = UserRole;

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role: ManageableUserRole;
}

export const userService = {
  async list(params?: { search?: string }): Promise<UserItem[]> {
    const { data } = await api.get<UserItem[]>("/users", { params });
    return data;
  },

  async get(id: number): Promise<UserItem> {
    const { data } = await api.get<UserItem>(`/users/${id}`);
    return data;
  },

  async create(payload: UserPayload): Promise<UserItem> {
    const { data } = await api.post<UserItem>("/users", payload);
    return data;
  },

  async update(id: number, payload: Partial<UserPayload>): Promise<UserItem> {
    const { data } = await api.put<UserItem>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
