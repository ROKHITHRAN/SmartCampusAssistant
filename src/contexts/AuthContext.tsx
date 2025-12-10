// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  subscribeToAuthChanges,
  loginWithGoogle as googleLoginService,
} from "../services/auth-service";

interface AuthContextValue {
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const user = await loginWithEmail(email, password);
    return user;
  };

  const register = async (name: string, email: string, password: string) => {
    const user = await registerWithEmail(name, email, password);
    return user;
  };

  const logout = async () => {
    await logoutUser();
  };

  const loginWithGoogle = async () => {
    const user = await googleLoginService();
    return user;
  };

  const value: AuthContextValue = {
    currentUser,
    authLoading,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
