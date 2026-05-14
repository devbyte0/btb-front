"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const unwrap = (res) => res?.data || res;

export default function StudentViewPage() {
  const { token } = useAuth();
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardApi.getStudentFullData(token, studentId);
        setData(unwrap(res));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, [token, studentId]);

  const handlePrint = () => {
    if (!data) return;
    const { student, enrollments, batches, attendanceRecords } = data;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${student.name} - Profile</title>
      <style>
        @page{margin:10mm}body{font-family:system-ui,sans-serif;padding:20px;color:#222}
        .header{text-align:center;margin-bottom:30px;border-bottom:3px double #222;padding-bottom:20px}
        .header img{width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:10px}
        .header h1{margin:0;font-size:24px}.header p{margin:3px 0;color:#555;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #ddd;font-size:12px}
        th{background:#f5f0eb;font-weight:600}
        .section{margin-top:25px}
        .section h3{font-size:16px;margin:0 0 10px;border-bottom:2px solid #d4803c;padding-bottom:5px}
        .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
        .present{background:#dcfce7;color:#15803d}.absent{background:#fef2f2;color:#dc2626}.late{background:#fef3c7;color:#b45309}
        .footer{margin-top:40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:15px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
        .info-grid div{padding:8px 12px;background:#faf8f5;border-radius:6px;font-size:13px}
        .info-grid div strong{display:block;color:#666;font-size:11px;text-transform:uppercase}
      </style></head><body>
      <div class="header">
        <img src="/btb-logo.png" alt="BTB"/>
        ${student.profilePic ? `<img src="${student.profilePic}" alt="Photo" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:10px auto;display:block;border:3px solid #d4803c;" />` : ""}
        <h1>${student.name}</h1>
        <p>@${student.username} ${student.email ? `- ${student.email}` : ""}${student.phone ? `- ${student.phone}` : ""}</p>
      </div>
      <div class="section"><h3>Student Info</h3>
        <div class="info-grid">
          <div><strong>User ID</strong>${student._id}</div>
          <div><strong>Status</strong>${student.isActive ? "Active" : "Inactive"}</div>
          <div><strong>Joined</strong>${new Date(student.createdAt).toLocaleDateString("en-BD")}</div>
          <div><strong>Role</strong>${student.role}</div>
        </div>
      </div>
      ${batches?.length ? `<div class="section"><h3>Batch${batches.length > 1 ? "es" : ""}</h3>${batches.map((b) => `<p style="font-size:13px;margin:3px 0;"><strong>${b.name} (${b.code})</strong>${b.trainers?.length ? ` - Trainers: ${b.trainers.map((t) => t.name).join(", ")}` : ""}</p>${b.schedule?.length ? `<table><tr><th>Day</th><th>Time</th><th>Topic</th><th>Room</th></tr>${b.schedule.map((s) => `<tr><td>${s.day}</td><td>${s.startTime}-${s.endTime}</td><td>${s.topic || "-"}</td><td>${s.room || "-"}</td></tr>`).join("")}</table>` : ""}`).join("")}</div>` : ""}
      ${enrollments?.length ? `<div class="section"><h3>Enrollments (${enrollments.length})</h3><table><tr><th>Course</th><th>Paid</th><th>Due</th><th>Status</th></tr>${enrollments.map((e) => `<tr><td>${e.course?.title || "-"}</td><td>Tk ${e.paymentSummary?.paidAmount || 0}</td><td>Tk ${e.paymentSummary?.dueAmount || 0}</td><td>${e.status}</td></tr>`).join("")}</table></div>` : ""}
      ${attendanceRecords?.length ? `<div class="section"><h3>Attendance (${attendanceRecords.length} sessions)</h3>${attendanceRecords.map((rec) => `<p style="font-size:13px;font-weight:600;margin:15px 0 5px;">${new Date(rec.sessionDate).toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric" })} - ${rec.batch?.name || "Batch"}</p><table><tr><th>Student</th><th>Status</th><th>Notes</th></tr>${(rec.records || []).map((r) => `<tr><td>${r.student?.name || "-"}</td><td><span class="badge ${r.status}">${r.status?.toUpperCase() || "-"}</span></td><td>${r.notes || "-"}</td></tr>`).join("")}</table>`).join("")}</div>` : ""}
      <div class="footer">Generated on ${new Date().toLocaleDateString("en-BD")} - Barista Training Bangladesh</div>
    </body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  if (loading) return <ProtectedRoute roles={["trainer", "admin", "super_admin"]}><div className="mx-auto w-full max-w-7xl px-4 py-6"><p className="text-[#e6c6a5]">Loading student data...</p></div></ProtectedRoute>;

  if (error) return <ProtectedRoute roles={["trainer", "admin", "super_admin"]}><div className="mx-auto w-full max-w-7xl px-4 py-6"><p className="text-red-300">{error}</p></div></ProtectedRoute>;

  const { student, enrollments = [], batches = [], attendanceRecords = [] } = data || {};

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#d4803c]/30 bg-[#1a1008]">
              {student?.profilePic ? (
                <img src={student.profilePic} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#e6c6a5]">{student?.name?.[0]?.toUpperCase() || "?"}</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#fff0df]">{student?.name}</h1>
              <p className="mt-1 text-[#e6c6a5]">@{student?.username} — Student Profile</p>
            </div>
          </div>
          <button onClick={handlePrint} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap">Print Profile</button>
        </div>
        <Reveal variant="fade-up" delay={30}><AdminSectionNav /></Reveal>

        {/* Student Info */}
        <Reveal variant="fade-up" delay={50}>
          <section className="section-card mt-6 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Student Info</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-[#211309] border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#e6c6a5]">User ID</p>
                <p className="mt-1 text-sm font-mono text-[#ffebd4] break-all">{student?._id}</p>
              </div>
              <div className="rounded-xl bg-[#211309] border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#e6c6a5]">Email</p>
                <p className="mt-1 text-sm text-[#ffebd4]">{student?.email || "-"}</p>
              </div>
              <div className="rounded-xl bg-[#211309] border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#e6c6a5]">Phone</p>
                <p className="mt-1 text-sm text-[#ffebd4]">{student?.phone || "-"}</p>
              </div>
              <div className="rounded-xl bg-[#211309] border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#e6c6a5]">Status</p>
                <p className={`mt-1 text-sm font-semibold ${student?.isActive ? "text-green-400" : "text-red-400"}`}>{student?.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Batches */}
        <Reveal variant="fade-up" delay={70}>
          <section className="section-card mt-6 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Batch{batches.length !== 1 ? "es" : ""} ({batches.length})</h2>
            {batches.length === 0 ? <p className="mt-4 text-[#e6c6a5]">Not assigned to any batch.</p> : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {batches.map((b) => (
                  <div key={b._id} className="rounded-xl border border-white/10 bg-[#211309] p-5">
                    <p className="font-semibold text-[#ffebd4]">{b.name} ({b.code})</p>
                    {b.trainers?.length > 0 && <p className="mt-1 text-xs text-[#e6c6a5]">Trainers: {b.trainers.map((t) => t.name).join(", ")}</p>}
                    {b.schedule?.length > 0 && (
                      <div className="mt-3 text-xs text-[#a09080] space-y-1">
                        {b.schedule.map((s, i) => <p key={i}>{s.day} {s.startTime}-{s.endTime}{s.topic ? ` - ${s.topic}` : ""}{s.room ? ` (${s.room})` : ""}</p>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* Enrollments */}
        <Reveal variant="fade-up" delay={90}>
          <section className="section-card mt-6 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Enrollments ({enrollments.length})</h2>
            {enrollments.length === 0 ? <p className="mt-4 text-[#e6c6a5]">No enrollments.</p> : (
              <div className="mt-4 space-y-3">
                {enrollments.map((e) => (
                  <div key={e._id} className="flex flex-wrap items-center justify-between rounded-xl border border-white/10 bg-[#211309] p-4 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#ffebd4]">{e.course?.title || "Course"}</p>
                      <p className="text-xs text-[#e6c6a5]">Status: {e.status}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap">
                      <p className="text-green-400">Tk {e.paymentSummary?.paidAmount || 0}</p>
                      <p className="text-[#e6c6a5] text-xs">Due: Tk {e.paymentSummary?.dueAmount || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* Attendance */}
        <Reveal variant="fade-up" delay={110}>
          <section className="section-card mt-6 rounded-2xl p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Attendance ({attendanceRecords.length} sessions)</h2>
            {attendanceRecords.length === 0 ? <p className="mt-4 text-[#e6c6a5]">No attendance records.</p> : (
              <div className="mt-4 space-y-3">
                {attendanceRecords.map((rec) => {
                  const myRecord = rec.records?.find((r) => (r.student?._id || r.student) === studentId);
                  return (
                    <div key={rec._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#211309] p-4">
                      <div>
                        <p className="text-sm font-medium text-[#ffebd4]">{rec.batch?.name || "Batch"}</p>
                        <p className="text-xs text-[#e6c6a5]">{new Date(rec.sessionDate).toLocaleDateString("en-BD")}</p>
                      </div>
                      <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${myRecord?.status === "present" ? "bg-green-400/20 text-green-400" : myRecord?.status === "late" ? "bg-yellow-400/20 text-yellow-400" : "bg-red-400/20 text-red-400"}`}>
                        {myRecord?.status?.toUpperCase() || "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </ProtectedRoute>
  );
}
