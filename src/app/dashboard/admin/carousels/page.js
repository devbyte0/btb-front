"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { carouselApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminCarouselsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", linkLabel: "Learn More", order: 0 });
  const [editingId, setEditingId] = useState("");

  const load = useCallback(async () => {
    try { setItems(unwrap(await carouselApi.listAll(token))); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(""); setError("");
    try {
      if (editingId) {
        await carouselApi.update(token, editingId, form);
        setMessage("Updated!");
      } else {
        await carouselApi.create(token, form);
        setMessage("Created!");
      }
      setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", linkLabel: "Learn More", order: 0 });
      setEditingId("");
      await load();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title || "", subtitle: item.subtitle || "", imageUrl: item.imageUrl, linkUrl: item.linkUrl || "", linkLabel: item.linkLabel || "Learn More", order: item.order || 0 });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this carousel slide?")) return;
    try { await carouselApi.delete(token, id); setMessage("Deleted."); await load(); }
    catch (err) { setError(err.message); }
  };

  const handleToggle = async (item) => {
    try { await carouselApi.update(token, item._id, { isActive: !item.isActive }); await load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up"><h1 className="text-3xl font-black text-[#fff0df]">Homepage Carousel</h1><p className="mt-2 text-[#e6c6a5]">Manage hero slides shown on the homepage.</p></Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal variant="fade-left" delay={100}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">{editingId ? "Edit Slide" : "Add Slide"}</h2>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Image URL *</label>
                  <input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required placeholder="https://images.unsplash.com/..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Title</label>
                    <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Order</label>
                    <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Subtitle</label>
                  <input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Link URL</label>
                    <input value={form.linkUrl} onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" placeholder="/courses" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Button Label</label>
                    <input value={form.linkLabel} onChange={(e) => setForm((p) => ({ ...p, linkLabel: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1 rounded-xl py-3 font-semibold text-white">{editingId ? "Update" : "Add"} Slide</button>
                  {editingId && <button type="button" onClick={() => { setEditingId(""); setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", linkLabel: "Learn More", order: 0 }); }} className="flex-1 rounded-xl border border-white/20 py-3 text-[#e6c6a5]">Cancel</button>}
                </div>
              </form>
            </section>
          </Reveal>

          <Reveal variant="fade-right" delay={100}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Slides ({items.length})</h2>
              {loading ? <p className="mt-4 text-[#e6c6a5]">Loading...</p> : items.length === 0 ? (
                <p className="mt-4 text-[#e6c6a5]">No slides yet.</p>
              ) : (
                <div className="mt-4 space-y-3 max-h-[600px] overflow-auto">
                  {items.map((item) => (
                    <div key={item._id} className={`rounded-xl border p-4 transition-all ${item.isActive ? "border-white/10 bg-[#211309]" : "border-white/5 bg-[#1a1008] opacity-60"}`}>
                      <div className="flex gap-3">
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#1a1008]">
                          {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#ffebd4] truncate">{item.title || "Untitled"}</p>
                          <p className="text-xs text-[#e6c6a5] truncate">#{item.order} {item.isActive ? "(Active)" : "(Inactive)"}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleEdit(item)} className="flex-1 rounded-lg border border-[#f6bf86] py-1.5 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                        <button onClick={() => handleToggle(item)} className="flex-1 rounded-lg border border-[#f6bf86] py-1.5 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">{item.isActive ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => handleDelete(item._id)} className="flex-1 rounded-lg border border-red-300 py-1.5 text-xs text-red-200 transition-all hover:bg-red-300/10">Delete</button>
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
