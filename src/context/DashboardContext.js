"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const DashboardContext = createContext(null);
const unwrap = (res) => res?.data || [];

export function DashboardProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    Promise.resolve()
      .then(() => {
        setLoadingCourses(true);
        setCoursesError("");
        return dashboardApi.listCourses(token);
      })
      .then((data) => setCourses(unwrap(data)))
      .catch((err) => setCoursesError(err.message || "Failed to load courses"))
      .finally(() => setLoadingCourses(false));
  }, [token, isAuthenticated]);

  const value = useMemo(
    () => ({
      courses,
      loadingCourses,
      coursesError,
      setCourses,
    }),
    [courses, loadingCourses, coursesError]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};
