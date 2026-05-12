"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "btb_token";
const unwrapData = (res) => res?.data || res;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(window.localStorage.getItem(TOKEN_KEY));
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    authApi
      .me(token)
      .then((res) => {
        const payload = unwrapData(res);
        setUser(payload.user || payload);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token, refreshKey]);

  const refreshUser = useCallback(() => setRefreshKey((k) => k + 1), []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    const payload = unwrapData(res);
    const authToken = payload.token;
    const authUser = payload.user;

    if (!authToken || !authUser) {
      throw new Error("Login response is invalid");
    }

    window.localStorage.setItem(TOKEN_KEY, authToken);
    setToken(authToken);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
    }),
    [token, user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
