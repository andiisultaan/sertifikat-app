import { create } from "zustand";
import { User } from "@/services/api/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getInitialState(): Pick<AuthState, "user" | "token" | "isAuthenticated"> {
  if (typeof window === "undefined") return { user: null, token: null, isAuthenticated: false };
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    return { user, token, isAuthenticated: !!(token && user) };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

export const useAuthStore = create<AuthState>(set => ({
  ...getInitialState(),

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    // Simpan ke cookie agar bisa dibaca Next.js middleware (edge runtime)
    setCookie("token", token);
    setCookie("role", user.role);
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");
    deleteCookie("role");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
