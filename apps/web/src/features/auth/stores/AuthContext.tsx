import { createContext, useContext, useState } from 'react';

export interface User {
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'tenant';
  avatar?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role?: 'user' | 'tenant') => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const dummyUser: User = {
  name: 'Budi Santoso',
  email: 'budi@example.com',
  phone: '+62 812-3456-7890',
  role: 'user',
  isVerified: true,
};

const dummyTenant: User = {
  name: 'Ani Wijaya',
  email: 'ani@example.com',
  phone: '+62 878-9012-3456',
  role: 'tenant',
  isVerified: false,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  const login = (role: 'user' | 'tenant' = 'user') => {
    setUser(role === 'tenant' ? dummyTenant : dummyUser);
  };

  const logout = () => {
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading: false, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
