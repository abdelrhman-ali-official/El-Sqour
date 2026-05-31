import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { normalizeAuthUser, type AuthUser } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://sqour.runasp.net";
const STORAGE_KEY = "sqour_auth";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
  gender: 1 | 2;
  userRole: 1;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: Omit<RegisterPayload, "userRole">) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeAuthUser(JSON.parse(raw) as Partial<AuthUser> & Record<string, unknown>);
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (!data) return "حدث خطأ غير متوقع.";
    if (typeof data === "string") return data;
    if (typeof data.message === "string") return data.message;
    if (typeof data.title === "string") return data.title;
    if (data.errors) {
      const values = Object.values(data.errors).flat();
      return values.join("، ");
    }
  } catch {
    return "تعذر الاتصال بالخادم. حاول مرة أخرى.";
  }
  return "تعذر إتمام العملية. حاول مرة أخرى.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/Authentication/Login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const data = normalizeAuthUser((await response.json()) as Partial<AuthUser> & Record<string, unknown>);
    setUser(data);
    persistUser(data);
    return data;
  }, []);

  const register = useCallback(async (payload: Omit<RegisterPayload, "userRole">) => {
    const response = await fetch(`${API_BASE_URL}/api/Authentication/Register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...payload, userRole: 1 })
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
