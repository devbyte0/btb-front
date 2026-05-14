"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleRoute } from "@/lib/roleRoute";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace(getRoleRoute(user?.role));
  }, [isAuthenticated, user, router]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true); setError("");
    try {
      const loggedInUser = await login(form.username, form.password);
      router.replace(getRoleRoute(loggedInUser?.role));
    } catch (err) { setError(err.message || "Failed to login"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e] min-h-screen flex items-center justify-center px-4 py-10">
      <Reveal variant="scale-in" className="w-full max-w-md">
        <div className="rounded-3xl border border-[#1c1c1e]/8 bg-white p-6 shadow-xl md:p-8">
          <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">
            Welcome Back
          </span>
          <h1 className="mt-4 text-3xl font-black">Login to your account</h1>
          <p className="mt-3 text-sm text-[#6b6b6b]">
            Use your student, trainer, admin, or super admin credentials.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input required value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
              placeholder="Username" />
            <input required type="password" value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
              placeholder="Password" />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={submitting}
              className="btn-primary w-full rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-60">
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b6b6b]">
            Don't have an account?{" "}
            <Link href="/courses" className="font-semibold text-[#d4803c] hover:underline">Browse Courses</Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
