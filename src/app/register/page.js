"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", password: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await authApi.registerStudent(form);
      setMessage("Registration successful. You can now login.");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e] min-h-screen flex items-center justify-center px-4 py-10">
      <Reveal variant="scale-in" className="w-full max-w-md">
        <div className="rounded-3xl border border-[#1c1c1e]/8 bg-white p-6 shadow-xl md:p-8">
          <h1 className="text-3xl font-black">Student Registration</h1>
          <p className="mt-2 text-sm text-[#6b6b6b]">Create your student account to enroll in courses.</p>
          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            {["name", "username", "password", "email", "phone"].map((field) => (
              <input key={field} required={field === "name" || field === "username" || field === "password"}
                type={field === "password" ? "password" : "text"}
                placeholder={field[0].toUpperCase() + field.slice(1)} value={form[field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15" />
            ))}
            <button className="btn-primary w-full rounded-xl px-5 py-3 font-semibold text-white">Register</button>
          </form>
          {message ? <p className="mt-3 text-green-700 bg-green-50 rounded-xl px-4 py-3">{message}</p> : null}
          {error ? <p className="mt-3 text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p> : null}
          <p className="mt-4 text-sm text-[#6b6b6b]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#d4803c] font-semibold underline transition-all hover:text-[#b46e2a]">Login</Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
