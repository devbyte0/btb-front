"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { notificationApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function EmailTestPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({ to: "", subject: "Test from BTB Admin", message: "This is a test email from Barista Training Bangladesh admin panel." });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true); setResult(null); setError("");
    try {
      const res = await fetch(`${API_BASE}/emails/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setResult(data.data || data);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const handleCheckPending = async () => {
    setSending(true); setResult(null); setError("");
    try {
      const res = await notificationApi.checkPendingPayments?.(token) || await fetch(`${API_BASE}/notifications/check-pending`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setResult(res.data || res);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Email System</h1>
          <p className="mt-2 text-[#e6c6a5]">Test email sending and trigger payment reminders.</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {result && (
          <Reveal variant="fade-up">
            <div className="mt-6 rounded-2xl bg-green-900/30 border border-green-700/30 px-6 py-4 text-green-300">
              <p className="font-semibold">Success!</p>
              <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </Reveal>
        )}
        {error && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-red-900/30 px-6 py-4 text-red-300">{error}</p></Reveal>}

        <div className="mt-8 grid gap-6">
          <Reveal variant="fade-up" delay={80}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Send Test Email</h2>
              <form className="mt-6 space-y-4" onSubmit={handleSend}>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">To</label>
                  <input value={form.to} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]"
                    placeholder="email@example.com" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Subject</label>
                  <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Message</label>
                  <textarea rows={5} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
                </div>
                <button type="submit" disabled={sending}
                  className="btn-primary w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60">
                  {sending ? "Sending..." : "Send Test Email"}
                </button>
              </form>
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={120}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Payment Reminders</h2>
              <p className="mt-2 text-sm text-[#e6c6a5]">Scan all unpaid enrollments and send email reminders to students with due payments.</p>
              <button onClick={handleCheckPending} disabled={sending}
                className="btn-primary mt-6 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60">
                {sending ? "Scanning..." : "Send Reminders to All Pending Payments"}
              </button>
            </section>
          </Reveal>
        </div>
      </div>
    </ProtectedRoute>
  );
}
