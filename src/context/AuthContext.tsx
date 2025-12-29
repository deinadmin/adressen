"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { validateInvitationCode } from "@/lib/services";

interface SelectionContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<SelectionContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("invitation_token");
    if (savedToken) {
      // For now, we assume the token is valid if it exists. 
      // In a real app, you might want to re-validate it periodically.
      setIsAuthenticated(true);
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (code: string) => {
    const isValid = await validateInvitationCode(code);
    if (isValid) {
      localStorage.setItem("invitation_token", code);
      setIsAuthenticated(true);
      setToken(code);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("invitation_token");
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
