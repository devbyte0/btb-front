"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { announcementApi, dashboardApi } from "@/lib/api";
import { useDashboard } from "@/context/DashboardContext";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function TrainerDashboardPage() {
  const { token } = useAuth();
  const { courses, loadingCourses, coursesError } = useDashboard();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    announcementApi.list(token).then((res) => setAnnouncements(unwrap(res))).catch(() => {});
  }, [token]);

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [studentForm, setStudentForm] = useState({ name: "", username: "", password: "", email: "" });

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentEditForm, setStudentEditForm] = useState({ name: "", email: "", phone: "" });

  const [batchFilter, setBatchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [modalAttendanceData, setModalAttendanceData] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTrainerData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, batchesRes, attendanceRes] = await Promise.all([
        dashboardApi.listUsers(token),
        dashboardApi.listBatches(token),
        dashboardApi.listAttendance(token),
      ]);

      setStudents(unwrap(usersRes).filter((u) => u.role === "student"));
      setBatches(unwrap(batchesRes));
      setAttendanceRecords(unwrap(attendanceRes));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadTrainerData(); }, [loadTrainerData]);

  useEffect(() => {
    if (!selectedBatchId) {
      setBatchStudents([]);
      setAttendanceData([]);
      return;
    }
    const batch = batches.find((b) => b._id === selectedBatchId);
    if (batch?.students) {
      setBatchStudents(batch.students);
      setAttendanceData(
        batch.students.map((s) => ({ studentId: s._id, status: "present", notes: "" }))
      );
    }
  }, [selectedBatchId, batches]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await dashboardApi.createStudent(token, studentForm);
      setMessage("Student created successfully!");
      setStudentForm({ name: "", username: "", password: "", email: "" });
      await loadTrainerData();
    } catch (err) { setError(err.message); }
  };

  const handleMarkBatchAttendance = async () => {
    if (!selectedBatchId || !sessionDate) return;
    setMessage(""); setError("");
    try {
      await dashboardApi.markAttendance(token, { batchId: selectedBatchId, sessionDate, records: attendanceData });
      setMessage("Batch attendance saved successfully!");
      await loadTrainerData();
    } catch (err) { setError(err.message); }
  };

  const openStudentEditModal = (student) => {
    setSelectedStudent(student);
    setStudentEditForm({ name: student.name || "", email: student.email || "", phone: student.phone || "" });
    setIsStudentModalOpen(true);
  };

  const closeStudentModal = () => { setIsStudentModalOpen(false); setSelectedStudent(null); };

  const saveStudentEdit = async () => {
    if (!selectedStudent) return;
    try {
      await dashboardApi.updateUser(token, selectedStudent._id, studentEditForm);
      setMessage("Student updated successfully!");
      await loadTrainerData();
      closeStudentModal();
    } catch (err) { setError(err.message); }
  };

  const deleteStudent = async (studentId) => {
    if (!confirm("Delete this student permanently?")) return;
    try {
      await dashboardApi.deleteUser(token, studentId);
      setMessage("Student deleted.");
      await loadTrainerData();
    } catch (err) { setError(err.message); }
  };

  const openAttendanceModal = (record) => {
    setSelectedAttendance(record);
    setModalAttendanceData(record.records.map((r) => ({ studentId: r.student?._id || r.student, status: r.status, notes: r.notes || "" })));
    setIsAttendanceModalOpen(true);
  };

  const closeAttendanceModal = () => { setIsAttendanceModalOpen(false); setSelectedAttendance(null); };

  const saveAttendanceEdit = async () => {
    if (!selectedAttendance) return;
    try {
      await dashboardApi.updateAttendance(token, selectedAttendance._id, { records: modalAttendanceData });
      setMessage("Attendance updated successfully!");
      await loadTrainerData();
      closeAttendanceModal();
    } catch (err) { setError(err.message); }
  };

  const deleteAttendanceRecord = async (recordId) => {
    if (!confirm("Delete this entire attendance record?")) return;
    try {
      await dashboardApi.deleteAttendance(token, recordId);
      setMessage("Attendance record deleted.");
      await loadTrainerData();
    } catch (err) { setError(err.message); }
  };

  const filteredAttendance = attendanceRecords.filter((record) => {
    const matchesBatch = !batchFilter || record.batch?._id === batchFilter;
    const matchesDate = !dateFilter || new Date(record.sessionDate).toISOString().split("T")[0] === dateFilter;
    return matchesBatch && matchesDate;
  });

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Trainer Dashboard</h1>
          <p className="mt-2 text-[#e6c6a5]">Manage students, batches &amp; attendance</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {announcements.length > 0 && (
          <Reveal variant="fade-up" delay={70}>
            <section className="section-card mb-6 rounded-2xl p-5">
              <h2 className="text-lg font-black text-[#fff0df]">Announcements</h2>
              <div className="mt-3 space-y-2">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann._id} className="rounded-xl border border-white/10 bg-[#211309] p-3">
                    <p className="font-semibold text-[#ffebd4] text-sm">{ann.title}</p>
                    <p className="mt-1 text-xs text-[#e6c6a5] line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {message && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-green-900/30 px-6 py-4 text-center text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-red-900/30 px-6 py-4 text-center text-red-300">{error}</p></Reveal>}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Reveal variant="fade-up" delay={100}>
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Create Student</h2>
              <form className="mt-6 space-y-4" onSubmit={handleCreateStudent}>
                {["name", "username", "password", "email"].map((field) => (
                  <input key={field} required={field !== "email"} type={field === "password" ? "password" : "text"}
                    placeholder={field[0].toUpperCase() + field.slice(1)} value={studentForm[field]}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" />
                ))}
                <button className="btn-primary w-full rounded-xl py-3 font-semibold text-white">Create Student</button>
              </form>
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={150} className="lg:col-span-3">
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Students</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {students.map((student, i) => (
                  <Reveal key={student._id} delay={i * 40} variant="fade-up">
                    <article className="group rounded-2xl border border-white/10 bg-[#211309] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f39b45]/30 hover:shadow-xl">
                      <p className="font-semibold text-[#ffebd4] group-hover:text-[#f39b45] transition-colors">{student.name}</p>
                      <p className="text-sm text-[#e6c6a5]">@{student.username}</p>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => openStudentEditModal(student)} className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                        <button onClick={() => deleteStudent(student._id)} className="flex-1 rounded-xl border border-red-300 py-2 text-xs font-semibold text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={200} className="lg:col-span-3">
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Mark Batch Attendance</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-12">
                <div className="md:col-span-4">
                  <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none">
                    <option value="">Select Batch</option>
                    {batches.map((b) => (<option key={b._id} value={b._id}>{b.name} ({b.code})</option>))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" />
                </div>

                {selectedBatchId && batchStudents.length > 0 && (
                  <div className="md:col-span-12 mt-6">
                    <div className="max-h-96 overflow-auto rounded-2xl border border-white/10 bg-[#211309]">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-[#1a1008]">
                          <tr><th className="px-6 py-4 text-left">Student</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-left">Notes</th></tr>
                        </thead>
                        <tbody>
                          {batchStudents.map((student) => {
                            const entry = attendanceData.find((a) => a.studentId === student._id);
                            return (
                              <tr key={student._id} className="border-t border-white/10 transition-all hover:bg-white/[0.02]">
                                <td className="px-6 py-4 font-medium">{student.name} (@{student.username})</td>
                                <td className="px-6 py-4 text-center">
                                  <select value={entry?.status || "present"}
                                    onChange={(e) => { setAttendanceData((prev) => prev.map((item) => item.studentId === student._id ? { ...item, status: e.target.value } : item)); }}
                                    className="rounded-xl border border-white/20 bg-[#211309] px-4 py-1 text-sm">
                                    <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4">
                                  <input placeholder="Notes" value={entry?.notes || ""}
                                    onChange={(e) => { setAttendanceData((prev) => prev.map((item) => item.studentId === student._id ? { ...item, notes: e.target.value } : item)); }}
                                    className="w-full rounded-xl border border-white/20 bg-[#211309] px-3 py-2 text-sm" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={handleMarkBatchAttendance} className="btn-primary mt-6 w-full rounded-2xl py-4 text-lg font-semibold text-white">
                      Save Attendance for All Students
                    </button>
                  </div>
                )}
              </div>
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={250} className="lg:col-span-3">
            <section className="section-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-[#fff0df]">Attendance Records</h2>
                <div className="flex gap-4">
                  <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}
                    className="rounded-xl border border-white/15 bg-[#211309] px-4 py-2 text-[#ffe6cb]">
                    <option value="">All Batches</option>
                    {batches.map((b) => (<option key={b._id} value={b._id}>{b.name} ({b.code})</option>))}
                  </select>
                  <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-xl border border-white/15 bg-[#211309] px-4 py-2 text-[#ffe6cb]" />
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAttendance.map((record, i) => (
                  <Reveal key={record._id} delay={i * 40} variant="fade-up">
                    <article className="rounded-2xl border border-white/10 bg-[#211309] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f39b45]/30">
                      <p className="font-semibold text-[#ffebd4]">{record.batch?.name || "Unknown Batch"} ({record.batch?.code})</p>
                      <p className="text-sm text-[#e6c6a5]">{new Date(record.sessionDate).toLocaleDateString("en-BD")}</p>
                      <p className="mt-3 text-xs text-[#ffc489]">{record.records?.length || 0} students</p>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => openAttendanceModal(record)} className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">View / Edit</button>
                        <button onClick={() => deleteAttendanceRecord(record._id)} className="flex-1 rounded-xl border border-red-300 py-2 text-xs font-semibold text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                      </div>
                    </article>
                  </Reveal>
                ))}
                {filteredAttendance.length === 0 && (
                  <p className="col-span-full py-12 text-center text-sm text-[#e6c6a5]">No attendance records found.</p>
                )}
              </div>
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={300} className="lg:col-span-3">
            <section className="section-card rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Available Courses</h2>
              {coursesError ? (<p className="mt-2 text-red-300">{coursesError}</p>
              ) : loadingCourses ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1,2,3,4].map((i) => (<div key={i} className="rounded-2xl border border-white/10 bg-[#211309] p-5"><div className="skeleton h-5 w-3/4" /><div className="skeleton mt-2 h-4 w-1/3" /></div>))}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {courses.map((course, i) => (
                    <Reveal key={course._id} delay={i * 40} variant="fade-up">
                      <article className="rounded-2xl border border-white/10 bg-[#211309] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f39b45]/30">
                        <h3 className="font-bold text-[#ffebd4]">{course.title}</h3>
                        <p className="mt-1 text-sm text-[#e6c6a5]">Tk{course.basePrice}</p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </div>

        {isStudentModalOpen && selectedStudent && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-md rounded-3xl bg-[#211309] p-6 shadow-2xl">
              <h3 className="text-xl font-black text-[#fff0df]">Edit Student</h3>
              <div className="mt-6 space-y-4">
                {["name", "email", "phone"].map((field) => (
                  <input key={field} value={studentEditForm[field]}
                    onChange={(e) => setStudentEditForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none"
                    placeholder={field[0].toUpperCase() + field.slice(1)} />
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={saveStudentEdit} className="btn-primary flex-1 rounded-2xl py-3 font-semibold text-white">Save Changes</button>
                <button onClick={closeStudentModal} className="flex-1 rounded-2xl border border-white/20 py-3 font-semibold text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isAttendanceModalOpen && selectedAttendance && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-full md:max-w-3xl rounded-3xl bg-[#211309] p-6 shadow-2xl">
              <h3 className="text-2xl font-black text-[#fff0df]">Edit Attendance \u2014 {selectedAttendance.batch?.name}</h3>
              <p className="text-sm text-[#e6c6a5]">{new Date(selectedAttendance.sessionDate).toLocaleDateString("en-BD")}</p>
              <div className="mt-6 max-h-[500px] overflow-auto rounded-2xl border border-white/10 bg-[#1a1008]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#211309]">
                    <tr><th className="px-6 py-4 text-left">Student</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-left">Notes</th></tr>
                  </thead>
                  <tbody>
                    {selectedAttendance.records.map((rec, index) => {
                      const entry = modalAttendanceData[index];
                      return (
                        <tr key={rec.student?._id} className="border-t border-white/10">
                          <td className="px-6 py-4">{rec.student?.name} (@{rec.student?.username})</td>
                          <td className="px-6 py-4 text-center">
                            <select value={entry.status} onChange={(e) => { const newData = [...modalAttendanceData]; newData[index].status = e.target.value; setModalAttendanceData(newData); }}
                              className="rounded-xl border border-white/20 bg-[#211309] px-4 py-1 text-sm">
                              <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input value={entry.notes} onChange={(e) => { const newData = [...modalAttendanceData]; newData[index].notes = e.target.value; setModalAttendanceData(newData); }}
                              className="w-full rounded-xl border border-white/20 bg-[#211309] px-3 py-2 text-sm" placeholder="Notes" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={saveAttendanceEdit} className="btn-primary flex-1 rounded-2xl py-3 font-semibold text-white">Save Changes</button>
                <button onClick={closeAttendanceModal} className="flex-1 rounded-2xl border border-white/20 py-3 font-semibold text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
