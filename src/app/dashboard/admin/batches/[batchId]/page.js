"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";

const unwrap = (res) => res?.data || res || [];

export default function BatchDetailsPage() {
  const { token } = useAuth();
  const { batchId } = useParams();

  const [batch, setBatch] = useState(null);
  const [batches, setBatches] = useState([]); // for transfer dropdown
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, batchId]);

  useEffect(() => {
    loadBatch();
  }, [loadBatch]);

  const saveBatch = async () => {
    try {
      await dashboardApi.updateBatch(token, batchId, { name, code });
      setMessage("Batch updated successfully.");
      await loadBatch();
    } catch (err) {
      setError(err.message);
    }
  };

  // FIXED: Proper ID extraction from populated objects
  const removeStudent = async (studentId) => {
    if (!confirm("Remove this student from the batch?")) return;
    try {
      const currentStudentIds = batch.students
        .filter((student) => student._id !== studentId)
        .map((student) => student._id);

      await dashboardApi.assignBatchStudents(token, batchId, currentStudentIds);
      setMessage("Student removed successfully.");
      await loadBatch();
    } catch (err) {
      setError(err.message);
    }
  };

  const openTransferModal = (student) => {
    setStudentToTransfer(student);
    setTargetBatchId("");
    setIsTransferModalOpen(true);
  };

  // FIXED: Proper ID extraction for transfer
  const transferStudent = async () => {
    if (!studentToTransfer || !targetBatchId) return;
    try {
      // Remove from current batch
      const currentStudentIds = batch.students
        .filter((student) => student._id !== studentToTransfer._id)
        .map((student) => student._id);

      await dashboardApi.assignBatchStudents(token, batchId, currentStudentIds);

      // Add to target batch
      await dashboardApi.assignBatchStudents(token, targetBatchId, [studentToTransfer._id]);

      setMessage("Student transferred successfully!");
      setIsTransferModalOpen(false);
      await loadBatch();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
          <p className="text-[#e6c6a5]">Loading batch details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <h1 className="text-3xl font-black text-[#fff0df]">Batch Details</h1>
        <p className="mt-2 text-[#e6c6a5]">Edit batch and manage students / trainers.</p>
        <AdminSectionNav />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Edit Batch */}
          <section className="section-card rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Edit Batch</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Batch Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Batch Code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none"
                />
              </div>
              <button
                onClick={saveBatch}
                className="w-full rounded-2xl bg-[#f39b45] py-3 font-semibold text-[#2a1608]"
              >
                Save Batch Changes
              </button>
            </div>
          </section>

          {/* Trainers */}
          <section className="section-card rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Trainers</h2>
            <div className="mt-4 space-y-2">
              {batch?.trainers?.length ? (
                batch.trainers.map((trainer) => (
                  <div key={trainer._id} className="rounded-xl border border-white/10 bg-[#211309] p-4">
                    <p className="font-semibold text-[#ffebd4]">
                      {trainer.name} (@{trainer.username})
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[#e6c6a5]">No trainers assigned yet.</p>
              )}
            </div>
          </section>

          {/* Students with Remove & Transfer */}
          <section className="section-card rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-2xl font-black text-[#fff0df]">
              Students ({batch?.students?.length || 0})
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batch?.students?.map((student) => (
                <article
                  key={student._id}
                  className="rounded-2xl border border-white/10 bg-[#211309] p-5"
                >
                  <p className="font-semibold text-[#ffebd4]">{student.name}</p>
                  <p className="text-sm text-[#e6c6a5]">@{student.username}</p>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => removeStudent(student._id)}
                      className="flex-1 rounded-xl border border-red-300 py-2 text-xs font-semibold text-red-200"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => openTransferModal(student)}
                      className="flex-1 rounded-xl border border-[#f6bf86] py-2 text-xs font-semibold text-[#ffe4c4]"
                    >
                      Transfer
                    </button>
                  </div>
                </article>
              ))}
              {(!batch?.students || batch.students.length === 0) && (
                <p className="col-span-full text-center py-8 text-[#e6c6a5]">
                  No students in this batch yet.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Transfer Student Modal */}
        {isTransferModalOpen && studentToTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl bg-[#211309] p-6">
              <h3 className="text-xl font-black text-[#fff0df]">Transfer Student</h3>
              <p className="mt-1 text-[#e6c6a5]">
                {studentToTransfer.name} (@{studentToTransfer.username})
              </p>

              <div className="mt-6">
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Transfer to Batch</label>
                <select
                  value={targetBatchId}
                  onChange={(e) => setTargetBatchId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none"
                >
                  <option value="">Select target batch</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={transferStudent}
                  disabled={!targetBatchId}
                  className="flex-1 rounded-2xl bg-[#f39b45] py-3 font-semibold text-[#2a1608] disabled:opacity-50"
                >
                  Transfer Student
                </button>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 rounded-2xl border border-white/20 py-3 font-semibold text-[#e6c6a5]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {message && <p className="mt-6 text-center text-green-300">{message}</p>}
        {error && <p className="mt-6 text-center text-red-300">{error}</p>}
      </div>
    </ProtectedRoute>
  );
}