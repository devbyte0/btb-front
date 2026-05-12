"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { contactApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminContactInquiriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [replyForm, setReplyForm] = useState({ inquiryId: "", replyMessage: "" });

  const load = useCallback(async () => {
    try { setItems(unwrap(await contactApi.list(token))); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleReply = async (e) => {
    e.preventDefault(); setMessage(""); setError("");
    try {
      await contactApi.markReplied(token, replyForm.inquiryId, { replyMessage: replyForm.replyMessage });
      setMessage("Reply sent!");
      setReplyForm({ inquiryId: "", replyMessage: "" });
      await load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inquiry?")) return;
    try { await contactApi.delete(token, id); setMessage("Deleted."); await load(); }
    catch (err) { setError(err.message); }
  };

  const openReply = (inquiry) => {
    setReplyForm({ inquiryId: inquiry._id, replyMessage: "" });
  };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up"><h1 className="text-3xl font-black text-[#fff0df]">Contact Inquiries</h1><p className="mt-2 text-[#e6c6a5]">View and respond to inquiries from the contact form.</p></Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {loading ? (
            <div className="lg:col-span-3 space-y-3">
              {[1,2,3].map((i) => (<div key={i} className="section-card rounded-2xl p-5"><div className="skeleton h-5 w-1/2" /><div className="skeleton mt-2 h-10 w-full" /></div>))}
            </div>
          ) : items.length === 0 ? (
            <div className="lg:col-span-3 text-center py-12 text-[#e6c6a5]">No inquiries yet.</div>
          ) : (
            items.map((inquiry, i) => (
              <Reveal key={inquiry._id} delay={i * 40} variant="fade-up">
                <div className={`section-card rounded-2xl p-5 transition-all ${inquiry.replied ? "opacity-70" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#ffebd4]">{inquiry.name}</p>
                      <p className="text-xs text-[#e6c6a5]">{inquiry.email || "—"} {inquiry.phone ? `• ${inquiry.phone}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-3 py-0.5 text-[10px] font-semibold ${inquiry.replied ? "bg-green-400/20 text-green-400" : "bg-amber-400/20 text-amber-400"}`}>
                      {inquiry.replied ? "Replied" : "New"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#e3c2a0]">{inquiry.message}</p>
                  <p className="mt-2 text-[10px] text-[#e6c6a5]">{new Date(inquiry.createdAt).toLocaleDateString("en-BD")}</p>

                  {inquiry.replied && inquiry.replyMessage && (
                    <div className="mt-3 rounded-xl bg-green-900/20 p-3">
                      <p className="text-xs font-semibold text-green-400">Reply:</p>
                      <p className="mt-1 text-sm text-[#e3c2a0]">{inquiry.replyMessage}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {!inquiry.replied && (
                      <button onClick={() => openReply(inquiry)} className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Reply</button>
                    )}
                    <button onClick={() => handleDelete(inquiry._id)} className="flex-1 rounded-xl border border-red-300 py-2 text-xs font-semibold text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                  </div>

                  {replyForm.inquiryId === inquiry._id && (
                    <form onSubmit={handleReply} className="mt-4 space-y-2">
                      <textarea rows={3} value={replyForm.replyMessage} onChange={(e) => setReplyForm((p) => ({ ...p, replyMessage: e.target.value }))}
                        className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] text-sm" placeholder="Type your reply..." required />
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary flex-1 rounded-xl py-2 text-sm font-semibold text-white">Send Reply</button>
                        <button type="button" onClick={() => setReplyForm({ inquiryId: "", replyMessage: "" })} className="flex-1 rounded-xl border border-white/20 py-2 text-sm text-[#e6c6a5]">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
