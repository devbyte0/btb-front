"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getRoleRoute } from "@/lib/roleRoute";
import Reveal from "@/components/Reveal";

export default function DashboardPage() {
  const { user } = useAuth();
  const destination = getRoleRoute(user?.role);

  return (
    <ProtectedRoute>
      <div className="page-enter mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <Reveal variant="scale-in">
          <div className="section-card rounded-3xl p-6 md:p-8">
            <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">
              Dashboard
            </span>
            <h1 className="mt-4 text-3xl font-black text-[#fff0df] md:text-4xl">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="mt-3 leading-relaxed text-[#e6c6a5]">
              Your role is <span className="font-semibold text-[#f39b45]">{user?.role}</span>. Open your workspace
              to manage courses, students, attendance, and payments.
            </p>
            <Link
              href={destination}
              className="btn-primary mt-6 inline-block rounded-xl px-6 py-3 font-semibold text-white"
            >
              Open {user?.role} dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    </ProtectedRoute>
  );
}
