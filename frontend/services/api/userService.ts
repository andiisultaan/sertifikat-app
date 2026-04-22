import api from '@/lib/api';
import { UserRole } from './authService';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export const userService = {
  async list(): Promise<UserItem[]> {
    const { data } = await api.get<UserItem[]>('/users');
    return data;
  },

  async create(payload: UserPayload): Promise<UserItem> {
    const { data } = await api.post<UserItem>('/users', payload);
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
