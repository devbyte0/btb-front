"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { notificationApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const NotificationContext = createContext(null);
const unwrap = (res) => res?.data || [];

export function NotificationProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationApi.list(token),
        notificationApi.unreadCount(token),
      ]);
      setNotifications(unwrap(notifRes));
      setUnreadCount(countRes?.data?.count || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [load]);

  const markAsRead = useCallback(async (ids) => {
    await notificationApi.markAsRead(token, ids);
    setUnreadCount((prev) => Math.max(0, prev - ids.length));
    setNotifications((prev) => prev.map((n) => ids.includes(n._id) ? { ...n, read: true } : n));
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    await notificationApi.markAllAsRead(token);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [token]);

  const value = useMemo(() => ({
    notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: load,
  }), [notifications, unreadCount, loading, markAsRead, markAllAsRead, load]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
