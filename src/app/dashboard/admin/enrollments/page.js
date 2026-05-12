"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminEnrollmentsPage() {
  const { token } = useAuth();
  const { courses, loadingCourses, coursesError } = useDashboard();

  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [studentForm, setStudentForm] = useState({ name: "", username: "", password: "", email: "" });
  const [form, setForm] = useState({ studentId: "", courseId: "", promoCode: "", adminDiscountAmount: "", paidAmount: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ status: "", paidAmount: "" });

  const loadEnrollmentData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [usersRes, enrollmentsRes] = await Promise.all([
        dashboardApi.listUsers(token), dashboardApi.listEnrollments(token),
      ]);
      const users = unwrap(usersRes);
      setStudents(users.filter((user) => user.role === "student"));
      setEnrollments(unwrap(enrollmentsRes));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { Promise.resolve().then(() => loadEnrollmentData()); }, [loadEnrollmentData]);

  const pendingEnrollments = useMemo(() => enrollments.filter((item) => item.status !== "completed").filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (item.student?.name || "").toLowerCase().includes(term) ||
      (item.student?.username || "").toLowerCase().includes(term) ||
      (item.course?.title || "").toLowerCase().includes(term) ||
      (item.promoCode || "").toLowerCase().includes(term);
  }), [enrollments, searchTerm]);

  const completedEnrollments = useMemo(() => enrollments.filter((item) => item.status === "completed").filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (item.student?.name || "").toLowerCase().includes(term) ||
      (item.student?.username || "").toLowerCase().includes(term) ||
      (item.course?.title || "").toLowerCase().includes(term) ||
      (item.promoCode || "").toLowerCase().includes(term);
  }), [enrollments, searchTerm]);

  const handleCreateStudent = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      await dashboardApi.createStudent(token, studentForm);
      setMessage("Student created successfully!");
      setStudentForm({ name: "", username: "", password: "", email: "" });
      await loadEnrollmentData();
    } catch (err) { setError(err.message); }
  };

  const handleCreateEnrollment = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      await dashboardApi.createEnrollment(token, {
        studentId: form.studentId, courseId: form.courseId,
        promoCode: form.promoCode || undefined,
        adminDiscountAmount: form.adminDiscountAmount ? Number(form.adminDiscountAmount) : 0,
        paidAmount: form.paidAmount ? Number(form.paidAmount) : 0,
      });
      setMessage("Enrollment created successfully.");
      setForm({ studentId: "", courseId: "", promoCode: "", adminDiscountAmount: "", paidAmount: "" });
      await loadEnrollmentData();
    } catch (err) { setError(err.message); }
  };

  const openViewModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setEditForm({ status: enrollment.status || "active", paidAmount: enrollment.paymentSummary?.paidAmount?.toString() || "0" });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedEnrollment(null); };

  const handleMarkFullyPaid = async () => {
    if (!selectedEnrollment?.pricing?.finalPrice) return;
    setError("");
    try {
      await dashboardApi.updateEnrollment(token, selectedEnrollment._id, { paidAmount: selectedEnrollment.pricing.finalPrice, status: "completed" });
      setMessage("Marked as fully paid and completed.");
      await loadEnrollmentData(); closeModal();
    } catch (err) { setError(err.message); }
  };

  const handleSaveEdit = async () => {
    if (!selectedEnrollment) return;
    setError("");
    try {
      const updates = {};
      if (editForm.status) updates.status = editForm.status;
      if (editForm.paidAmount !== undefined) updates.paidAmount = Number(editForm.paidAmount);
      await dashboardApi.updateEnrollment(token, selectedEnrollment._id, updates);
      setMessage("Enrollment updated successfully.");
      await loadEnrollmentData(); closeModal();
    } catch (err) { setError(err.message); }
  };

  const handlePrintReceipt = () => {
    if (!selectedEnrollment) return;
    const enrollment = selectedEnrollment;
    const studentName = enrollment.student?.name || "Unknown Student";
    const username = enrollment.student?.username || "";
    const courseTitle = enrollment.course?.title || "Unknown Course";
    const date = new Date(enrollment.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" });
    const time = new Date(enrollment.createdAt).toLocaleTimeString("en-BD");
    const basePrice = enrollment.pricing?.basePrice || 0;
    const adminDiscount = enrollment.pricing?.adminDiscountAmount || 0;
    const promoDiscount = enrollment.pricing?.promoDiscountAmount || 0;
    const finalPrice = enrollment.pricing?.finalPrice || 0;
    const paidAmount = enrollment.paymentSummary?.paidAmount || 0;
    const dueAmount = enrollment.paymentSummary?.dueAmount || 0;
    const isSettled = enrollment.paymentSummary?.isSettled || false;
    const trxId = enrollment.trxId || "\u2014";
    const paymentPhone = enrollment.paymentPhone || "\u2014";
    const paymentMethod = enrollment.paymentMethod ? enrollment.paymentMethod.toUpperCase() : "\u2014";
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return;
    receiptWindow.document.write(`<!DOCTYPE html><html><head><title>Enrollment Receipt - ${enrollment._id}</title><style>
      @page{margin:15mm}body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#fff;color:#222;line-height:1.5}
      .receipt{max-width:620px;margin:0 auto;border:3px solid #222;padding:30px 35px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px double #222;padding-bottom:15px;margin-bottom:20px}
      .header-left h1{margin:0;font-size:26px;font-weight:900;letter-spacing:2px}
      .header-left p{margin:4px 0 0;font-size:14px;color:#555}
      .seal{width:110px;height:auto}
      .info{display:flex;justify-content:space-between;margin:25px 0;font-size:14px}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:12px 10px;text-align:left;border-bottom:1px solid #ddd}
      th{font-weight:600;background:#f8f8f8}
      .total-row{font-weight:700;font-size:18px;background:#f8f8f8}
      .signature-section{margin-top:50px;display:flex;justify-content:flex-end;align-items:center;gap:20px}
      .signature-section img{width:180px;height:auto;border-bottom:2px solid #222}
      .signature-section div{text-align:right}
      .footer{margin-top:40px;text-align:center;font-size:13px;color:#555}
      .thankyou{font-size:24px;font-weight:700;margin:20px 0 8px}
    </style></head><body><div class="receipt">
      <div class="header"><div class="header-left"><h1>ENROLLMENT RECEIPT</h1><p>Barista Training Bangladesh</p></div><img src="/BTBSeal.png" alt="BTB Seal" class="seal" /></div>
      <div class="info"><div><strong>Receipt ID:</strong> ${enrollment._id}<br><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}</div><div style="text-align:right"><strong>Student:</strong> ${studentName}<br><strong>@${username}</strong></div></div>
      <div><strong>Course Enrolled:</strong> ${courseTitle}</div>
      <table><tr><th>Description</th><th style="text-align:right">Amount (Tk)</th></tr>
        <tr><td>Base Price</td><td style="text-align:right">${basePrice}</td></tr>
        ${adminDiscount > 0 ? `<tr><td>Admin Discount</td><td style="text-align:right;color:#e11d48">- ${adminDiscount}</td></tr>` : ""}
        ${promoDiscount > 0 ? `<tr><td>Promo Discount</td><td style="text-align:right;color:#e11d48">- ${promoDiscount}</td></tr>` : ""}
        <tr class="total-row"><td>Final Price</td><td style="text-align:right">${finalPrice}</td></tr>
        <tr><td>Paid Amount</td><td style="text-align:right;color:#15803d">${paidAmount}</td></tr>
        <tr><td>Due Amount</td><td style="text-align:right">${dueAmount}</td></tr>
      </table>
      <div style="text-align:center;margin:25px 0;font-size:16px;font-weight:600;color:${isSettled ? "#15803d" : "#b45309"}">${isSettled ? "FULLY PAID" : "Payment Pending"}</div>
      <div style="margin:20px 0;padding:15px;background:#f8f8f8;border-radius:8px;"><p><strong>Payment Method:</strong> ${paymentMethod}</p><p><strong>Transaction ID:</strong> ${trxId}</p><p><strong>Phone Number:</strong> ${paymentPhone}</p></div>
      <div class="signature-section"><div><img src="/Azom Sign.png" alt="Authorized Signature" /><p style="margin:8px 0 0;font-size:14px;font-weight:600;">Authorized Signatory</p><p style="margin:0;font-size:13px;">Barista Training Bangladesh</p></div></div>
      <div class="footer"><div class="thankyou">Thank You!</div><p>This is a computer-generated receipt. No signature required.</p><p style="margin-top:25px;font-size:11px">Generated on ${new Date().toLocaleString("en-BD")}</p></div>
    </div></body></html>`);
    receiptWindow.document.close(); receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 500);
  };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Enrollments</h1>
          <p className="mt-2 text-[#e6c6a5]">Full CRUD \u2022 Search \u2022 Edit \u2022 Print Official Receipt with Seal &amp; Sign</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        <Reveal variant="fade-up" delay={80}>
          <div className="mt-6 mb-6">
            <input type="text" placeholder="Search by student name, username, course or promo code..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-focus-ring w-full rounded-2xl border border-white/15 bg-[#211309] px-6 py-3.5 text-[#ffe6cb] outline-none placeholder:text-[#e6c6a5]/60" />
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          <Reveal variant="fade-up" delay={100}>
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Create Student</h2>
              <form className="mt-4 space-y-4" onSubmit={handleCreateStudent}>
                {["name", "username", "password", "email"].map((field) => (
                  <input key={field} required={field !== "email"} type={field === "password" ? "password" : "text"}
                    placeholder={field[0].toUpperCase() + field.slice(1)} value={studentForm[field]}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                ))}
                <button className="btn-primary w-full rounded-xl px-4 py-2.5 font-semibold text-white">Create Student</button>
              </form>
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={150}>
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Create New Enrollment</h2>
              <form className="mt-4 space-y-4" onSubmit={handleCreateEnrollment}>
                <select required value={form.studentId} onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                  <option value="">Select student</option>
                  {students.map((s) => (<option key={s._id} value={s._id}>{s.name} (@{s.username})</option>))}
                </select>
                <select required value={form.courseId} onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                  <option value="">Select course</option>
                  {courses.map((c) => (<option key={c._id} value={c._id}>{c.title}</option>))}
                </select>
                <input placeholder="Promo code (optional)" value={form.promoCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, promoCode: e.target.value }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Admin Discount (Tk)</label>
                    <input type="number" min="0" placeholder="0" value={form.adminDiscountAmount}
                      onChange={(e) => setForm((prev) => ({ ...prev, adminDiscountAmount: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Initial Paid Amount (Tk)</label>
                    <input type="number" min="0" placeholder="0" value={form.paidAmount}
                      onChange={(e) => setForm((prev) => ({ ...prev, paidAmount: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  </div>
                </div>
                <button className="btn-primary w-full rounded-xl px-4 py-2.5 font-semibold text-white">Create Enrollment</button>
              </form>
              {message && <p className="mt-3 text-green-300">{message}</p>}
              {error && <p className="mt-3 text-red-300">{error}</p>}
            </section>
          </Reveal>

          <Reveal variant="fade-up" delay={200} className="lg:col-span-3">
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Pending Enrollment Requests</h2>
              {loadingCourses || loading ? (
                <div className="mt-4 space-y-2">
                  {[1,2,3].map((i) => (<div key={i} className="rounded-xl border border-white/10 bg-[#211309] p-3"><div className="skeleton h-5 w-1/2" /><div className="skeleton mt-2 h-4 w-2/3" /></div>))}
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {pendingEnrollments.map((item, i) => (
                    <Reveal key={item._id} delay={i * 30} variant="fade-up">
                      <article className="rounded-xl border border-white/10 bg-[#211309] p-3 transition-all duration-300 hover:border-[#f39b45]/30">
                        <p className="font-semibold text-[#ffebd4]">{item.student?.name || "Unknown student"}</p>
                        <p className="text-sm text-[#e6c6a5]">{item.course?.title || "Unknown course"}</p>
                        <p className="text-xs text-[#ffc489]">Status: {item.status}</p>
                        {item.paymentMethod && (
                          <p className="mt-1 flex items-center gap-2 text-xs text-[#e6c6a5]">
                            {item.paymentMethod.toUpperCase()} \u2022 Trx: {item.trxId || "\u2014"} \u2022 Phone: <a href={`tel:${item.paymentPhone}`} className="font-medium text-[#ffe4c4] hover:underline">{item.paymentPhone || "\u2014"}</a>
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button onClick={() => openViewModal(item)} className="rounded-md border border-[#f6bf86] px-3 py-1 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">View / Edit</button>
                          <button onClick={async () => { try { await dashboardApi.updateEnrollment(token, item._id, { status: "completed" }); await loadEnrollmentData(); } catch (err) { setError(err.message); } }} className="rounded-md border border-[#f6bf86] px-3 py-1 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Mark Completed</button>
                          <button onClick={async () => { try { await dashboardApi.deleteEnrollment(token, item._id); await loadEnrollmentData(); } catch (err) { setError(err.message); } }} className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                  {!loading && pendingEnrollments.length === 0 && (
                    <p className="text-sm text-[#e6c6a5]">{searchTerm ? "No matching pending requests." : "No pending requests."}</p>
                  )}
                </div>
              )}
            </section>
          </Reveal>
        </div>

        <Reveal variant="fade-up" delay={250}>
          <section className="section-card mt-8 rounded-2xl p-5 md:p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Completed Enrollments</h2>
            {loadingCourses || loading ? (
              <div className="mt-4 space-y-2">
                {[1,2].map((i) => (<div key={i} className="rounded-xl border border-white/10 bg-[#211309] p-3"><div className="skeleton h-5 w-1/2" /></div>))}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {completedEnrollments.map((item, i) => (
                  <Reveal key={item._id} delay={i * 30} variant="fade-up">
                    <article className="rounded-xl border border-white/10 bg-[#211309] p-3 transition-all duration-300 hover:border-[#f39b45]/30">
                      <p className="font-semibold text-[#ffebd4]">{item.student?.name || "Unknown student"}</p>
                      <p className="text-sm text-[#e6c6a5]">{item.course?.title || "Unknown course"}</p>
                      <p className="text-xs text-green-400">Status: {item.status}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button onClick={() => openViewModal(item)} className="rounded-md border border-[#f6bf86] px-3 py-1 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">View / Edit</button>
                        <button onClick={async () => { try { await dashboardApi.deleteEnrollment(token, item._id); await loadEnrollmentData(); } catch (err) { setError(err.message); } }} className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                      </div>
                    </article>
                  </Reveal>
                ))}
                {!loading && completedEnrollments.length === 0 && (
                  <p className="text-sm text-[#e6c6a5]">{searchTerm ? "No matching completed enrollments." : "No completed enrollments yet."}</p>
                )}
              </div>
            )}
          </section>
        </Reveal>

        {isModalOpen && selectedEnrollment && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-full md:max-w-2xl rounded-3xl bg-[#211309] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-2xl font-black text-[#fff0df]">Enrollment Details &amp; Edit</h3>
                <button onClick={closeModal} className="text-3xl leading-none text-[#e6c6a5] transition-all hover:text-white">&times;</button>
              </div>
              <div className="space-y-6 text-[#ffe6cb]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><p className="text-xs uppercase tracking-widest text-[#e6c6a5]">Student</p><p className="font-semibold break-all">{selectedEnrollment.student?.name || "Unknown"} (@{selectedEnrollment.student?.username || "\u2014"})</p></div>
                  <div><p className="text-xs uppercase tracking-widest text-[#e6c6a5]">Course</p><p className="font-semibold">{selectedEnrollment.course?.title || "Unknown"}</p></div>
                </div>
                {(selectedEnrollment.paymentMethod || selectedEnrollment.trxId) && (
                  <div className="rounded-2xl bg-[#1a1008] p-5">
                    <p className="mb-3 text-xs uppercase tracking-widest text-[#e6c6a5]">Payment Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Method</span><span>{selectedEnrollment.paymentMethod?.toUpperCase() || "\u2014"}</span></div>
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Trx ID</span><span>{selectedEnrollment.trxId || "\u2014"}</span></div>
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Phone</span><a href={`tel:${selectedEnrollment.paymentPhone}`} className="font-medium text-[#ffe4c4] hover:underline">{selectedEnrollment.paymentPhone || "\u2014"}</a></div>
                    </div>
                  </div>
                )}
                {selectedEnrollment.pricing && (
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-widest text-[#e6c6a5]">Pricing</p>
                    <div className="rounded-2xl bg-[#1a1008] p-5 space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Base Price</span><span>Tk{selectedEnrollment.pricing.basePrice}</span></div>
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Admin Discount</span><span className="text-red-300">- Tk{selectedEnrollment.pricing.adminDiscountAmount || 0}</span></div>
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Promo Discount</span><span className="text-red-300">- Tk{selectedEnrollment.pricing.promoDiscountAmount || 0}</span></div>
                      <div className="border-t border-white/10 pt-3 flex justify-between text-base font-semibold"><span>Final Price</span><span>Tk{selectedEnrollment.pricing.finalPrice}</span></div>
                    </div>
                  </div>
                )}
                {selectedEnrollment.paymentSummary && (
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-widest text-[#e6c6a5]">Payment Summary</p>
                    <div className="rounded-2xl bg-[#1a1008] p-5 space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Paid Amount</span><span className="font-medium text-green-400">Tk{selectedEnrollment.paymentSummary.paidAmount || 0}</span></div>
                      <div className="flex justify-between"><span className="text-[#e6c6a5]">Due Amount</span><span>Tk{selectedEnrollment.paymentSummary.dueAmount || 0}</span></div>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-white/10 bg-[#1a1008] p-5">
                  <h4 className="mb-4 text-lg font-semibold text-[#fff0df]">Edit Enrollment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Status</label>
                      <select value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                        <option value="active">Active</option><option value="completed">Completed</option><option value="dropped">Dropped</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Paid Amount (Tk)</label>
                      <input type="number" min="0" value={editForm.paidAmount} onChange={(e) => setEditForm((prev) => ({ ...prev, paidAmount: e.target.value }))}
                        className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={handleSaveEdit} className="btn-primary flex-1 rounded-2xl px-6 py-3 text-sm font-semibold text-white">Save Changes</button>
                <button onClick={handlePrintReceipt} className="flex-1 rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20">Print Official Receipt</button>
                {selectedEnrollment.status !== "completed" && (
                  <button onClick={handleMarkFullyPaid} className="flex-1 rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-green-500">Mark as Fully Paid (Tk{selectedEnrollment.pricing?.finalPrice || 0})</button>
                )}
                <button onClick={async () => { try { await dashboardApi.deleteEnrollment(token, selectedEnrollment._id); await loadEnrollmentData(); closeModal(); } catch (err) { setError(err.message); } }} className="flex-1 rounded-2xl border border-red-300 px-6 py-3 text-sm font-semibold text-red-200 transition-all hover:bg-red-300/10">Delete Enrollment</button>
                <button onClick={closeModal} className="flex-1 rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
