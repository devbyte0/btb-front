"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { announcementApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminAnnouncementsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "", targetRoles: [], priority: "normal" });

  const load = useCallback(async () => {
    try { setItems(unwrap(await announcementApi.list(token))); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(""); setError("");
    try {
      await announcementApi.create(token, form);
      setMessage("Announcement published!");
      setForm({ title: "", content: "", targetRoles: [], priority: "normal" });
      await load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try { await announcementApi.delete(token, id); setMessage("Deleted."); await load(); }
    catch (err) { setError(err.message); }
  };

  const toggleRole = (role) => {
    setForm((p) => ({
      ...p,
      targetRoles: p.targetRoles.includes(role) ? p.targetRoles.filter((r) => r !== role) : [...p.targetRoles, role],
    }));
  };

  const roles = [
    { key: "student", label: "Students", color: "text-green-400" },
    { key: "trainer", label: "Trainers", color: "text-blue-400" },
    { key: "admin", label: "Admins", color: "text-purple-400" },
  ];

  const priorityColors = { low: "bg-gray-400/20 text-gray-400", normal: "bg-blue-400/20 text-blue-400", high: "bg-orange-400/20 text-orange-400", urgent: "bg-red-400/20 text-red-400" };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up"><h1 className="text-3xl font-black text-[#fff0df]">Announcements</h1><p className="mt-2 text-[#e6c6a5]">Send announcements to students, trainers, or admins.</p></Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal variant="fade-left" delay={100}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">New Announcement</h2>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Content *</label>
                  <textarea rows={5} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Target Roles</label>
                  <div className="flex gap-3">
                    {roles.map((r) => (
                      <button key={r.key} type="button" onClick={() => toggleRole(r.key)}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${form.targetRoles.includes(r.key) ? `${r.color} border border-current` : "border border-white/10 text-[#e6c6a5]"}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]">
                    <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full rounded-xl py-3 font-semibold text-white">Publish Announcement</button>
              </form>
            </section>
          </Reveal>

          <Reveal variant="fade-right" delay={100}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Published ({items.length})</h2>
              {loading ? <p className="mt-4 text-[#e6c6a5]">Loading...</p> : items.length === 0 ? (
                <p className="mt-4 text-[#e6c6a5]">No announcements yet.</p>
              ) : (
                <div className="mt-4 space-y-3 max-h-[600px] overflow-auto">
                  {items.map((item) => (
                    <div key={item._id} className="rounded-xl border border-white/10 bg-[#211309] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#ffebd4]">{item.title}</p>
                          <p className="mt-1 text-sm text-[#e6c6a5] line-clamp-2">{item.content}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-0.5 text-[10px] font-semibold ${priorityColors[item.priority] || priorityColors.normal}`}>{item.priority}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#e6c6a5]">
                        <span>by {item.createdBy?.name || "—"}</span>
                        <span>{item.targetRoles?.length ? item.targetRoles.join(", ") : "All"}</span>
                      </div>
                      <div className="mt-2">
                        <button onClick={() => handleDelete(item._id)} className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </div>
      </div>
    </ProtectedRoute>
  );
}
