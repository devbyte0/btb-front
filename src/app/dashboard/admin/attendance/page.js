"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import { useDashboard } from "@/context/DashboardContext";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminAttendancePage() {
  const { token } = useAuth();
  const { batches: allBatches } = useDashboard();

  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const [batchFilter, setBatchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAttendanceData, setEditAttendanceData] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceRes, batchesRes, usersRes] = await Promise.all([
        dashboardApi.listAttendance(token), dashboardApi.listBatches(token), dashboardApi.listUsers(token),
      ]);
      setRecords(unwrap(attendanceRes));
      setBatches(unwrap(batchesRes));
      setStudents(unwrap(usersRes).filter((user) => user.role === "student"));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedBatchId) { setBatchStudents([]); setAttendanceData([]); return; }
    const batch = batches.find((b) => b._id === selectedBatchId);
    if (batch?.students) {
      setBatchStudents(batch.students);
      setAttendanceData(batch.students.map((s) => ({ studentId: s._id, status: "present", notes: "" })));
    }
  }, [selectedBatchId, batches]);

  const handleMarkBatchAttendance = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !sessionDate) return;
    try {
      await dashboardApi.markAttendance(token, { batchId: selectedBatchId, sessionDate, records: attendanceData });
      setMessage("Attendance marked successfully!");
      await loadData();
    } catch (err) { setError(err.message); }
  };

  const openViewModal = (record) => { setSelectedRecord(record); setIsViewModalOpen(true); };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setEditAttendanceData(record.records.map((r) => ({ studentId: r.student?._id || r.studentId, status: r.status, notes: r.notes || "" })));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    try {
      await dashboardApi.updateAttendance(token, selectedRecord._id, { records: editAttendanceData });
      setMessage("Attendance updated successfully!");
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) { setError(err.message); }
  };

  const filteredRecords = records.filter((record) => {
    const matchesBatch = !batchFilter || record.batch?._id === batchFilter;
    const matchesDate = !dateFilter || new Date(record.sessionDate).toISOString().split("T")[0] === dateFilter;
    return matchesBatch && matchesDate;
  });

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Attendance Management</h1>
          <p className="mt-2 text-[#e6c6a5]">Mark, view and edit batch-wise attendance.</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        <Reveal variant="fade-up" delay={80}>
          <section className="section-card mt-8 rounded-2xl p-6">
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
                                  onChange={(e) => setAttendanceData((prev) => prev.map((item) => item.studentId === student._id ? { ...item, status: e.target.value } : item))}
                                  className="rounded-xl border border-white/20 bg-[#211309] px-4 py-1 text-sm">
                                  <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <input placeholder="Notes" value={entry?.notes || ""}
                                  onChange={(e) => setAttendanceData((prev) => prev.map((item) => item.studentId === student._id ? { ...item, notes: e.target.value } : item))}
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

        <Reveal variant="fade-up" delay={120}>
          <section className="section-card mt-8 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Attendance Records</h2>
            <div className="mt-4 flex gap-4">
              <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#211309] px-4 py-2 text-[#ffe6cb]">
                <option value="">All Batches</option>
                {batches.map((b) => (<option key={b._id} value={b._id}>{b.name} ({b.code})</option>))}
              </select>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#211309] px-4 py-2 text-[#ffe6cb]" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecords.map((record, i) => (
                <Reveal key={record._id} delay={i * 30} variant="fade-up">
                  <article className="rounded-2xl border border-white/10 bg-[#211309] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f39b45]/30">
                    <p className="font-semibold text-[#ffebd4]">{record.batch?.name || "Unknown Batch"} ({record.batch?.code})</p>
                    <p className="text-sm text-[#e6c6a5]">{new Date(record.sessionDate).toLocaleDateString("en-BD")}</p>
                    <p className="mt-3 text-xs text-[#ffc489]">{record.records?.length || 0} students marked</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openViewModal(record)} className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">View</button>
                      <button onClick={() => openEditModal(record)} className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                    </div>
                  </article>
                </Reveal>
              ))}
              {filteredRecords.length === 0 && <p className="col-span-full py-12 text-center text-sm text-[#e6c6a5]">No attendance records found.</p>}
            </div>
          </section>
        </Reveal>

        {isViewModalOpen && selectedRecord && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-full md:max-w-4xl rounded-3xl bg-[#211309] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#fff0df]">Attendance - {selectedRecord.batch?.name} ({selectedRecord.batch?.code})</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-4xl leading-none text-[#e6c6a5] transition-all hover:text-white">&times;</button>
              </div>
              <p className="mb-6 text-[#e6c6a5]">{new Date(selectedRecord.sessionDate).toLocaleDateString("en-BD")}</p>
              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-[#1a1008]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#211309]">
                    <tr><th className="px-6 py-4 text-left">Student</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-left">Notes</th></tr>
                  </thead>
                  <tbody>
                    {selectedRecord.records?.map((r) => (
                      <tr key={r.student?._id} className="border-t border-white/10">
                        <td className="px-6 py-4">{r.student?.name} (@{r.student?.username})</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-4 py-1 rounded-full text-xs font-semibold ${r.status === "present" ? "bg-green-400/20 text-green-400" : r.status === "late" ? "bg-yellow-400/20 text-yellow-400" : "bg-red-400/20 text-red-400"}`}>{r.status.toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-[#e6c6a5]">{r.notes || "\u2014"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="mt-6 w-full rounded-2xl border border-white/20 py-3 text-[#e6c6a5] transition-all hover:bg-white/5">Close</button>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedRecord && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-full md:max-w-4xl rounded-3xl bg-[#211309] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#fff0df]">Edit Attendance</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-4xl leading-none text-[#e6c6a5] transition-all hover:text-white">&times;</button>
              </div>
              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-[#1a1008]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#211309]">
                    <tr><th className="px-6 py-4 text-left">Student</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-left">Notes</th></tr>
                  </thead>
                  <tbody>
                    {selectedRecord.records?.map((r, index) => {
                      const entry = editAttendanceData[index];
                      return (
                        <tr key={r.student?._id} className="border-t border-white/10">
                          <td className="px-6 py-4">{r.student?.name}</td>
                          <td className="px-6 py-4 text-center">
                            <select value={entry.status} onChange={(e) => { const newData = [...editAttendanceData]; newData[index].status = e.target.value; setEditAttendanceData(newData); }}
                              className="rounded-xl border border-white/20 bg-[#211309] px-4 py-1">
                              <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input value={entry.notes} onChange={(e) => { const newData = [...editAttendanceData]; newData[index].notes = e.target.value; setEditAttendanceData(newData); }}
                              className="w-full rounded-xl border border-white/20 bg-[#211309] px-3 py-2" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={handleSaveEdit} className="btn-primary flex-1 rounded-2xl py-3 font-semibold text-white">Save Changes</button>
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-2xl border border-white/20 py-3 text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {message && <Reveal variant="fade-up"><p className="mt-6 text-center text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-6 text-center text-red-300">{error}</p></Reveal>}
      </div>
    </ProtectedRoute>
  );
}
