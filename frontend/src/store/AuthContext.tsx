import React, { createContext, useState, useEffect } from "react";
import type { User } from "@/types";
import { setOnUnauthorizedCallback } from "@/services/apiClient";
import { authService } from "@/features/auth/services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    localStorage.removeItem("user");
    setUser(null);
    try {
      await authService.logout();
    } catch {
      // Session already invalid, no need to call logout endpoint
    }
  };

  useEffect(() => {
    setOnUnauthorizedCallback(logout);

    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    authService
      .getCurrentUser()
      .then((serverUser) => {
        setUser(serverUser);
        localStorage.setItem("user", JSON.stringify(serverUser));
      })
      .catch(() => {
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
