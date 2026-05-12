"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { loading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!loading && isAuthenticated && roles.length > 0 && !roles.includes(user?.role)) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, user, router, roles]);

  if (loading || !isAuthenticated) {
    return <div className="p-6 text-center text-[#e8c9a5]">Checking session...</div>;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <div className="p-6 text-center text-[#e8c9a5]">Redirecting...</div>;
  }

  return children;
}
