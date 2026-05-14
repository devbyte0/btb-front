"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const unwrap = (res) => res?.data || [];

export default function AdminStudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [uploadingPic, setUploadingPic] = useState(false);
  const [emailStudent, setEmailStudent] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.listUsers(token);
      setStudents(unwrap(res).filter((u) => u.role === "student"));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (student) => {
    setEditStudent(student);
    setEditForm({ name: student.name || "", email: student.email || "", phone: student.phone || "" });
  };

  const closeEdit = () => { setEditStudent(null); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editStudent) return;
    setUploadingPic(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/uploads`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      const url = data.data?.url || data.url;
      await dashboardApi.updateUser(token, editStudent._id, { profilePic: url });
      setMessage("Profile picture updated!");
      await load();
    } catch (err) { setError(err.message); }
    finally { setUploadingPic(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    setMessage(""); setError("");
    try {
      await dashboardApi.updateUser(token, editStudent._id, editForm);
      setMessage("Student updated!");
      closeEdit();
      await load();
    } catch (err) { setError(err.message); }
  };

  const openEmail = (student) => {
    setEmailStudent(student);
    setEmailForm({ subject: "", message: "" });
  };

  const closeEmail = () => { setEmailStudent(null); };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailStudent?.email) { setError("Student has no email address"); return; }
    setMessage(""); setError("");
    try {
      const res = await fetch(`${API_BASE}/emails/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: emailStudent.email, subject: emailForm.subject, message: emailForm.message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setMessage(`Email sent to ${emailStudent.email}!`);
      closeEmail();
    } catch (err) { setError(err.message); }
  };

  const handleFullDelete = async (student) => {
    if (!confirm(`Delete "${student.name}" along with all enrollments and batch memberships? This cannot be undone.`)) return;
    setMessage(""); setError("");
    try {
      const res = await dashboardApi.deleteStudentFull(token, student._id);
      setMessage(res?.message || "Student deleted.");
      await load();
    } catch (err) { setError(err.message); }
  };

  const filtered = students.filter((s) =>
    `${s.name} ${s.username} ${s.email || ""} ${s.phone || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Students</h1>
          <p className="mt-2 text-[#e6c6a5]">View and manage all students. Edit details or delete (removes enrollments &amp; batches).</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        <Reveal variant="fade-up" delay={80}>
          <div className="mt-6 mb-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, email, or phone..."
              className="input-focus-ring w-full rounded-2xl border border-white/15 bg-[#211309] px-6 py-3.5 text-[#ffe6cb] outline-none placeholder:text-[#e6c6a5]/60" />
          </div>
        </Reveal>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (<div key={i} className="section-card rounded-2xl p-5"><div className="skeleton h-5 w-3/4" /><div className="skeleton mt-2 h-4 w-1/2" /></div>))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-[#e6c6a5]">No students found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((student, i) => (
              <Reveal key={student._id} delay={i * 20} variant="fade-up">
                <div className="section-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#d4803c]/10">
                      {student.profilePic ? (
                        <img src={student.profilePic} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#d4803c]">
                          {student.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#ffebd4] truncate">{student.name}</p>
                      <p className="text-xs text-[#e6c6a5]">@{student.username}</p>
                    </div>
                  </div>
                  {(student.email || student.phone) && (
                    <div className="mt-3 space-y-1 text-xs text-[#e6c6a5]">
                      {student.email && <p className="truncate">{student.email}</p>}
                      {student.phone && <p>{student.phone}</p>}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-[10px] text-[#a09080]">
                    <span>Active: {student.isActive ? "Yes" : "No"}</span>
                    <span>{new Date(student.createdAt).toLocaleDateString("en-BD")}</span>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <a href={`/dashboard/admin/students/${student._id}`}
                      className="flex-1 rounded-xl border border-emerald-500/40 py-2.5 text-xs font-semibold text-emerald-300 text-center transition-all hover:bg-emerald-500/10">View</a>
                    <button onClick={() => openEdit(student)}
                      className="flex-1 rounded-xl border border-[#f6bf86] py-2.5 text-xs font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                    {student.email && (
                      <button onClick={() => openEmail(student)}
                        className="flex-1 rounded-xl border border-sky-500/40 py-2.5 text-xs font-semibold text-sky-300 transition-all hover:bg-sky-500/10">Email</button>
                    )}
                    <button onClick={() => handleFullDelete(student)}
                      className="flex-1 rounded-xl border border-red-300 py-2.5 text-xs font-semibold text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {editStudent && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-md rounded-3xl bg-[#211309] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-black text-[#fff0df]">Edit Student</h3>
              <p className="text-sm text-[#e6c6a5] mt-1">@{editStudent.username}</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#1a1008] border border-white/10">
                  {editStudent.profilePic ? (
                    <img src={editStudent.profilePic} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-[#e6c6a5]">{editStudent.name?.[0]?.toUpperCase() || "?"}</div>
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-[#f6bf86] px-3 py-1.5 text-xs text-[#ffe4c4] hover:bg-[#f6bf86]/10">
                  {uploadingPic ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingPic} />
                </label>
              </div>
              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Email</label>
                  <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Phone</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 rounded-xl py-3 font-semibold text-white">Save</button>
                  <button type="button" onClick={closeEdit}
                    className="flex-1 rounded-xl border border-white/20 py-3 font-semibold text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {emailStudent && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-md rounded-3xl bg-[#211309] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#fff0df]">Send Email</h3>
                <button onClick={closeEmail} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lg text-[#ffe7ce] hover:bg-white/20">&times;</button>
              </div>
              <p className="text-sm text-[#e6c6a5] mt-1">To: {emailStudent.name} ({emailStudent.email})</p>
              <form onSubmit={handleSendEmail} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Subject</label>
                  <input value={emailForm.subject} onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Message</label>
                  <textarea rows={6} value={emailForm.message} onChange={(e) => setEmailForm((p) => ({ ...p, message: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 rounded-xl py-3 font-semibold text-white">Send Email</button>
                  <button type="button" onClick={closeEmail}
                    className="flex-1 rounded-xl border border-white/20 py-3 font-semibold text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
