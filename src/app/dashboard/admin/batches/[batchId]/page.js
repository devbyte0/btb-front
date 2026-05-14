"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { batchApi, dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || res || [];

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function BatchDetailsPage() {
  const { token } = useAuth();
  const { batchId } = useParams();

  const [batch, setBatch] = useState(null);
  const [batches, setBatches] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({ day: "Saturday", startTime: "10:00", endTime: "12:00", topic: "", room: "" });
  const [editingScheduleId, setEditingScheduleId] = useState("");

  // Transfer modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState(null);
  const [targetBatchId, setTargetBatchId] = useState("");

  const loadBatch = useCallback(async () => {
    setLoading(true);
    try {
      const [batchRes, allBatchesRes] = await Promise.all([
        dashboardApi.getBatch(token, batchId),
        dashboardApi.listBatches(token),
      ]);
      const data = unwrap(batchRes);
      setBatch(data);
      setName(data?.name || "");
      setCode(data?.code || "");
      setBatches(unwrap(allBatchesRes).filter((b) => b._id !== batchId));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token, batchId]);

  useEffect(() => { loadBatch(); }, [loadBatch]);

  const saveBatch = async () => {
    try { await dashboardApi.updateBatch(token, batchId, { name, code }); setMessage("Batch updated."); await loadBatch(); }
    catch (err) { setError(err.message); }
  };

  const removeStudent = async (studentId) => {
    if (!confirm("Remove this student from the batch?")) return;
    try {
      const ids = batch.students.filter((s) => s._id !== studentId).map((s) => s._id);
      await dashboardApi.assignBatchStudents(token, batchId, ids);
      setMessage("Student removed."); await loadBatch();
    } catch (err) { setError(err.message); }
  };

  const openTransferModal = (student) => { setStudentToTransfer(student); setTargetBatchId(""); setIsTransferModalOpen(true); };

  const transferStudent = async () => {
    if (!studentToTransfer || !targetBatchId) return;
    try {
      const currentIds = batch.students.filter((s) => s._id !== studentToTransfer._id).map((s) => s._id);
      await dashboardApi.assignBatchStudents(token, batchId, currentIds);
      await dashboardApi.assignBatchStudents(token, targetBatchId, [studentToTransfer._id]);
      setMessage("Student transferred!"); setIsTransferModalOpen(false); await loadBatch();
    } catch (err) { setError(err.message); }
  };

  // Schedule CRUD
  const handleAddSchedule = async (e) => {
    e.preventDefault(); setMessage(""); setError("");
    try {
      if (editingScheduleId) {
        await batchApi.updateSchedule(token, batchId, editingScheduleId, scheduleForm);
        setEditingScheduleId("");
      } else {
        await batchApi.addSchedule(token, batchId, scheduleForm);
      }
      setScheduleForm({ day: "Saturday", startTime: "10:00", endTime: "12:00", topic: "", room: "" });
      setMessage("Schedule saved!"); await loadBatch();
    } catch (err) { setError(err.message); }
  };

  const editSchedule = (item) => {
    setScheduleForm({ day: item.day, startTime: item.startTime, endTime: item.endTime, topic: item.topic || "", room: item.room || "" });
    setEditingScheduleId(item._id);
  };

  const removeSchedule = async (scheduleId) => {
    if (!confirm("Remove this schedule item?")) return;
    try { await batchApi.removeSchedule(token, batchId, scheduleId); setMessage("Schedule removed."); await loadBatch(); }
    catch (err) { setError(err.message); }
  };

  const handlePrintStudentList = () => {
    if (!batch) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Student List - ${batch.name}</title>
      <style>
        @page { margin: 10mm; }
        body { font-family: system-ui, sans-serif; padding: 20px; color: #222; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #ddd; font-size: 13px; }
        th { background: #f5f0eb; font-weight: 600; }
        .trainer-info { margin-top: 30px; padding: 15px; background: #faf8f5; border-radius: 8px; font-size: 13px; }
        .trainer-info h3 { margin: 0 0 10px; font-size: 16px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
        .schedule { margin-top: 30px; }
        .schedule h3 { font-size: 16px; }
        .schedule table { margin-top: 10px; }
      </style></head><body>
        <div class="header">
          <h1>${batch.name} (${batch.code})</h1>
          <p>Barista Training Bangladesh</p>
          <p>1/1, 1/2, Road-2, Block-G, Shah Ali, Mirpur-1, Dhaka</p>
        </div>
        ${batch.trainers?.length ? `<div class="trainer-info"><h3>Trainers</h3>${batch.trainers.map((t) => `<p><strong>${t.name}</strong> (@${t.username})</p>`).join("")}</div>` : ""}
        ${batch.schedule?.length ? `<div class="schedule"><h3>Class Schedule</h3><table><tr><th>Day</th><th>Time</th><th>Topic</th><th>Room</th></tr>${batch.schedule.map((s) => `<tr><td>${s.day}</td><td>${s.startTime} - ${s.endTime}</td><td>${s.topic || "-"}</td><td>${s.room || "-"}</td></tr>`).join("")}</table></div>` : ""}
        <h3>Student List (${batch.students?.length || 0})</h3>
        <table><tr><th>#</th><th>Name</th><th>Username</th><th>Email</th><th>Phone</th></tr>
        ${(batch.students || []).map((s, i) => `<tr><td>${i + 1}</td><td>${s.name}</td><td>@${s.username}</td><td>${s.email || "-"}</td><td>${s.phone || "-"}</td></tr>`).join("")}
        </table>
        <div class="footer"><p>Generated on ${new Date().toLocaleDateString("en-BD")} - Barista Training Bangladesh</p></div>
      </body></html>
    `);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  if (loading) {
    return (<ProtectedRoute roles={["trainer", "admin", "super_admin"]}><div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10"><p className="text-[#e6c6a5]">Loading...</p></div></ProtectedRoute>);
  }

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-[#fff0df]">{batch?.name} ({batch?.code})</h1>
            <p className="mt-1 text-[#e6c6a5]">Manage batch details, schedule, and students.</p>
          </div>
          <button onClick={handlePrintStudentList} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white">Print Student List</button>
        </div>
        <Reveal variant="fade-up" delay={30}><AdminSectionNav /></Reveal>

        {message && <p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p>}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Edit Batch */}
          <Reveal variant="fade-up" delay={50}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Batch Info</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input-focus-ring mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Code</label>
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-focus-ring mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
                <button onClick={saveBatch} className="btn-primary w-full rounded-xl py-3 font-semibold text-white">Save</button>
              </div>
            </section>
          </Reveal>

          {/* Schedule */}
          <Reveal variant="fade-up" delay={70}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Class Schedule</h2>
              <form className="mt-4 space-y-3" onSubmit={handleAddSchedule}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#e6c6a5]">Day</label>
                    <select value={scheduleForm.day} onChange={(e) => setScheduleForm((p) => ({ ...p, day: e.target.value }))}
                      className="input-focus-ring mt-0.5 w-full rounded-xl border border-white/15 bg-[#211309] px-3 py-2.5 text-sm text-[#ffe6cb]">
                      {DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#e6c6a5]">Room</label>
                    <input value={scheduleForm.room} onChange={(e) => setScheduleForm((p) => ({ ...p, room: e.target.value }))}
                      className="input-focus-ring mt-0.5 w-full rounded-xl border border-white/15 bg-[#211309] px-3 py-2.5 text-sm text-[#ffe6cb]" placeholder="R-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#e6c6a5]">Start</label>
                    <input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm((p) => ({ ...p, startTime: e.target.value }))}
                      className="input-focus-ring mt-0.5 w-full rounded-xl border border-white/15 bg-[#211309] px-3 py-2.5 text-sm text-[#ffe6cb]" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#e6c6a5]">End</label>
                    <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm((p) => ({ ...p, endTime: e.target.value }))}
                      className="input-focus-ring mt-0.5 w-full rounded-xl border border-white/15 bg-[#211309] px-3 py-2.5 text-sm text-[#ffe6cb]" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#e6c6a5]">Topic</label>
                  <input value={scheduleForm.topic} onChange={(e) => setScheduleForm((p) => ({ ...p, topic: e.target.value }))}
                    className="input-focus-ring mt-0.5 w-full rounded-xl border border-white/15 bg-[#211309] px-3 py-2.5 text-sm text-[#ffe6cb]" placeholder="Espresso Basics" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold text-white">
                    {editingScheduleId ? "Update" : "Add"} Schedule
                  </button>
                  {editingScheduleId && (
                    <button type="button" onClick={() => { setEditingScheduleId(""); setScheduleForm({ day: "Saturday", startTime: "10:00", endTime: "12:00", topic: "", room: "" }); }}
                      className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm text-[#e6c6a5]">Cancel</button>
                  )}
                </div>
              </form>

              {batch?.schedule?.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-auto">
                  {batch.schedule.map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#211309] p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#ffebd4]">{item.day} {item.startTime}-{item.endTime}</p>
                        <p className="text-xs text-[#e6c6a5]">{item.topic || "No topic"} {item.room ? `- ${item.room}` : ""}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => editSchedule(item)} className="rounded-lg border border-[#f6bf86] px-2 py-1 text-[10px] text-[#ffe4c4]">Edit</button>
                        <button onClick={() => removeSchedule(item._id)} className="rounded-lg border border-red-300 px-2 py-1 text-[10px] text-red-200">Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>

          {/* Trainers */}
          <Reveal variant="fade-up" delay={90}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Trainers</h2>
              <div className="mt-4 space-y-2">
                {batch?.trainers?.length ? batch.trainers.map((t) => (
                  <div key={t._id} className="rounded-xl border border-white/10 bg-[#211309] p-4">
                    <p className="font-semibold text-[#ffebd4]">{t.name} (@{t.username})</p>
                    {t.email && <p className="text-xs text-[#e6c6a5]">{t.email}</p>}
                  </div>
                )) : <p className="text-[#e6c6a5]">No trainers assigned.</p>}
              </div>
            </section>
          </Reveal>

          {/* Students */}
          <Reveal variant="fade-up" delay={110}>
            <section className="section-card rounded-2xl p-6 lg:col-span-2">
              <h2 className="text-2xl font-black text-[#fff0df]">Students ({batch?.students?.length || 0})</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {batch?.students?.map((student) => (
                  <article key={student._id} className="rounded-2xl border border-white/10 bg-[#211309] p-5">
                    <p className="font-semibold text-[#ffebd4]">{student.name}</p>
                    <p className="text-sm text-[#e6c6a5]">@{student.username}</p>
                    {student.email && <p className="text-xs text-[#e6c6a5] truncate">{student.email}</p>}
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => removeStudent(student._id)} className="flex-1 rounded-xl border border-red-300 py-2 text-xs font-semibold text-red-200 hover:bg-red-300/10">Remove</button>
                      <button onClick={() => openTransferModal(student)} className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4] hover:bg-[#f6bf86]/10">Transfer</button>
                    </div>
                  </article>
                ))}
                {(!batch?.students || batch.students.length === 0) && <p className="col-span-full text-center py-8 text-[#e6c6a5]">No students in this batch.</p>}
              </div>
            </section>
          </Reveal>
        </div>

        {isTransferModalOpen && studentToTransfer && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-md rounded-3xl bg-[#211309] p-6">
              <h3 className="text-xl font-black text-[#fff0df]">Transfer Student</h3>
              <p className="mt-1 text-[#e6c6a5]">{studentToTransfer.name} (@{studentToTransfer.username})</p>
              <div className="mt-6">
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Transfer to Batch</label>
                <select value={targetBatchId} onChange={(e) => setTargetBatchId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none">
                  <option value="">Select target batch</option>
                  {batches.map((b) => (<option key={b._id} value={b._id}>{b.name} ({b.code})</option>))}
                </select>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={transferStudent} disabled={!targetBatchId}
                  className="btn-primary flex-1 rounded-2xl py-3 font-semibold text-white disabled:opacity-50">Transfer</button>
                <button onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 rounded-2xl border border-white/20 py-3 font-semibold text-[#e6c6a5]">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
