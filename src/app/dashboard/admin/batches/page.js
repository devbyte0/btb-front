"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminBatchesPage() {
  const { token } = useAuth();
  const { courses } = useDashboard();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", courseIds: [] });
  const [studentSearch, setStudentSearch] = useState("");
  const [trainerSearch, setTrainerSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [usersRes, batchesRes] = await Promise.all([
        dashboardApi.listUsers(token), dashboardApi.listBatches(token),
      ]);
      const users = unwrap(usersRes);
      setStudents(users.filter((user) => user.role === "student"));
      setTrainers(users.filter((user) => user.role === "trainer"));
      setBatches(unwrap(batchesRes));
    } catch (err) { setError(err.message); }
  }, [token]);

  useEffect(() => { Promise.resolve().then(() => loadData()); }, [loadData]);

  const handleCreateBatch = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      await dashboardApi.createBatch(token, { ...form, courseIds: form.courseIds });
      setMessage("Batch created successfully.");
      setForm({ name: "", code: "", courseIds: [] });
      await loadData();
    } catch (err) { setError(err.message); }
  };

  const handleAssignStudent = async () => {
    if (!selectedBatchId || !selectedStudentId) return;
    setMessage(""); setError("");
    try {
      const batchRes = await dashboardApi.getBatch(token, selectedBatchId);
      const currentBatch = unwrap(batchRes);
      const currentStudentIds = currentBatch.students?.map((s) => s._id) || [];
      if (!currentStudentIds.includes(selectedStudentId)) currentStudentIds.push(selectedStudentId);
      await dashboardApi.assignBatchStudents(token, selectedBatchId, currentStudentIds);
      setMessage("Student added to batch successfully.");
      await loadData();
    } catch (err) { setError(err.message); }
  };

  const handleAssignTrainer = async () => {
    if (!selectedBatchId || !selectedTrainerId) return;
    setMessage(""); setError("");
    try {
      await dashboardApi.assignBatchTrainers(token, selectedBatchId, [selectedTrainerId]);
      setMessage("Trainer assigned to batch.");
      await loadData();
    } catch (err) { setError(err.message); }
  };

  const filteredStudents = students.filter((s) => `${s.name} ${s.username}`.toLowerCase().includes(studentSearch.toLowerCase()));
  const filteredTrainers = trainers.filter((t) => `${t.name} ${t.username}`.toLowerCase().includes(trainerSearch.toLowerCase()));

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Batches</h1>
          <p className="mt-2 text-[#e6c6a5]">Control students by batch and assign trainers batch-wise.</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal variant="fade-left" delay={100}>
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Create Batch</h2>
              <form className="mt-4 space-y-3" onSubmit={handleCreateBatch}>
                <input required placeholder="Batch Name" value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                <input required placeholder="Batch Code" value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                <select multiple value={form.courseIds}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseIds: Array.from(e.target.selectedOptions).map((o) => o.value) }))}
                  className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                  {courses.map((course) => (<option key={course._id} value={course._id}>{course.title}</option>))}
                </select>
                <button className="btn-primary w-full rounded-xl px-4 py-2.5 font-semibold text-white">Create Batch</button>
              </form>
            </section>
          </Reveal>

          <Reveal variant="fade-right" delay={100}>
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Assign by Batch</h2>
              <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}
                className="mt-4 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                <option value="">Select batch</option>
                {batches.map((batch) => (<option key={batch._id} value={batch._id}>{batch.name} ({batch.code})</option>))}
              </select>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <input placeholder="Search students" value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="input-focus-ring mb-2 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                    <option value="">Select student</option>
                    {filteredStudents.map((s) => (<option key={s._id} value={s._id}>{s.name} (@{s.username})</option>))}
                  </select>
                  <button type="button" onClick={handleAssignStudent}
                    className="mt-2 w-full rounded-xl border border-[#f6bf86] px-4 py-2.5 font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Assign Student</button>
                </div>
                <div>
                  <input placeholder="Search trainers" value={trainerSearch}
                    onChange={(e) => setTrainerSearch(e.target.value)}
                    className="input-focus-ring mb-2 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <select value={selectedTrainerId} onChange={(e) => setSelectedTrainerId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                    <option value="">Select trainer</option>
                    {filteredTrainers.map((t) => (<option key={t._id} value={t._id}>{t.name} (@{t.username})</option>))}
                  </select>
                  <button type="button" onClick={handleAssignTrainer}
                    className="mt-2 w-full rounded-xl border border-[#f6bf86] px-4 py-2.5 font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Assign Trainer</button>
                </div>
              </div>
            </section>
          </Reveal>
        </div>

        <Reveal variant="fade-up" delay={150}>
          <section className="section-card mt-5 rounded-2xl p-5 md:p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Batch List</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {batches.map((batch, i) => (
                <Reveal key={batch._id} delay={i * 40} variant="fade-up">
                  <article className="group rounded-xl border border-white/10 bg-[#211309] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#f39b45]/30 hover:shadow-xl">
                    <h3 className="font-bold text-[#ffebd4] group-hover:text-[#f39b45] transition-colors">{batch.name} ({batch.code})</h3>
                    <p className="text-xs text-[#e6c6a5]">Courses: {batch.courses?.map((c) => c.title).join(", ") || batch.course?.title || "-"}</p>
                    <p className="text-xs text-[#ffc489]">Students: {batch.students?.length || 0} | Trainers: {batch.trainers?.length || 0}</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/dashboard/admin/batches/${batch._id}`} className="inline-block rounded-md border border-[#f6bf86] px-2 py-1 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Open Details</Link>
                      <button type="button" onClick={async () => { try { await dashboardApi.deleteBatch(token, batch._id); await loadData(); } catch (err) { setError(err.message); } }}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            {message && <p className="mt-3 text-green-300">{message}</p>}
            {error && <p className="mt-3 text-red-300">{error}</p>}
          </section>
        </Reveal>
      </div>
    </ProtectedRoute>
  );
}
