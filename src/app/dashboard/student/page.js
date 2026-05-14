"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { announcementApi, dashboardApi, batchApi } from "@/lib/api";
import { useDashboard } from "@/context/DashboardContext";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || res || [];

export default function StudentDashboardPage() {
  const { token, user } = useAuth();
  const { courses, loadingCourses, coursesError } = useDashboard();

  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 500,
    method: "bkash",
    reference: "",
    phone: "",
  });
  const [announcements, setAnnouncements] = useState([]);
  const [studentBatches, setStudentBatches] = useState([]);
  const [copied, setCopied] = useState(false);

  const BKASH_NUMBER = "01911-769822";

  const loadStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [enrollmentsRes, attendanceRes, myBatchRes] = await Promise.all([
        dashboardApi.listEnrollments(token),
        dashboardApi.listAttendance(token),
        batchApi.myBatch(token).catch(() => ({ data: null })),
      ]);
      const myBatchData = myBatchRes?.data || myBatchRes || null;
      setStudentBatches(myBatchData ? [myBatchData] : []);

      const allEnrollments = unwrap(enrollmentsRes);
      const allAttendance = unwrap(attendanceRes);

      const myEnrollments = allEnrollments.filter(
        (e) => (e.student?._id || e.student?.id || e.student) === (user?._id || user?.id)
      );

      const myAttendance = allAttendance.flatMap((record) =>
        (record.records || [])
          .filter((r) => (r.student?._id || r.student) === (user?._id || user?.id))
          .map((r) => ({
            ...record,
            studentRecord: r,
          }))
      );

      setEnrollments(myEnrollments);
      setAttendance(myAttendance);
      announcementApi.list(token).then((res) => setAnnouncements(unwrap(res))).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user) loadStudentData();
  }, [loadStudentData, token, user]);

  const openPaymentModal = (course) => {
    setSelectedCourseForEnroll(course);
    setPaymentForm({
      amount: 500,
      method: "bkash",
      reference: "",
      phone: user?.phone || "",
    });
    setIsPaymentModalOpen(true);
    setMessage("");
    setError("");
    setCopied(false);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedCourseForEnroll(null);
    setError("");
  };

  const copyBkasNumber = async () => {
    try {
      await navigator.clipboard.writeText(BKASH_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleEnrollWithPayment = async (e) => {
    e.preventDefault();
    if (!selectedCourseForEnroll) return;

    if (paymentForm.amount < 500) {
      setError("Minimum payment is 500 Taka");
      return;
    }

    setError("");
    setMessage("");

    try {
      const enrollmentRes = await dashboardApi.createEnrollment(token, {
        courseId: selectedCourseForEnroll._id,
        studentId: user?._id || user?.id,
        paidAmount: paymentForm.amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        phone: paymentForm.phone,
      });

      const enrollment = unwrap(enrollmentRes);

      setMessage("Enrollment successful! Payment recorded.");
      closePaymentModal();
      await loadStudentData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintReceipt = (enrollment) => {
    if (!enrollment) return;

    const studentName = user?.name || "Student";
    const username = user?.username || "";
    const courseTitle = enrollment.course?.title || "Unknown Course";
    const date = new Date(enrollment.createdAt).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Enrollment Receipt - ${enrollment._id}</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #fff; color: #222; line-height: 1.5; }
          .receipt { max-width: 620px; margin: 0 auto; border: 3px solid #222; padding: 30px 35px; position: relative; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #222; padding-bottom: 15px; margin-bottom: 20px; }
          .header-left h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; }
          .header-left p { margin: 4px 0 0; font-size: 14px; color: #555; }
          .seal { width: 110px; height: auto; }
          .info { display: flex; justify-content: space-between; margin: 25px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { font-weight: 600; background: #f8f8f8; }
          .total-row { font-weight: 700; font-size: 18px; background: #f8f8f8; }
          .signature-section { margin-top: 50px; display: flex; justify-content: flex-end; align-items: center; gap: 20px; }
          .signature-section img { width: 180px; height: auto; border-bottom: 2px solid #222; }
          .signature-section div { text-align: right; }
          .footer { margin-top: 40px; text-align: center; font-size: 13px; color: #555; }
          .thankyou { font-size: 24px; font-weight: 700; margin: 20px 0 8px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="header-left"><h1>ENROLLMENT RECEIPT</h1><p>Barista Training Bangladesh</p></div>
            <img src="/BTBSeal.png" alt="BTB Seal" class="seal" />
          </div>
          <div class="info">
            <div><strong>Receipt ID:</strong> ${enrollment._id}<br><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}</div>
            <div style="text-align:right"><strong>Student:</strong> ${studentName}<br><strong>@${username}</strong></div>
          </div>
          <div><strong>Course Enrolled:</strong> ${courseTitle}</div>
          <table>
            <tr><th>Description</th><th style="text-align:right">Amount (Tk)</th></tr>
            <tr><td>Base Price</td><td style="text-align:right">${basePrice}</td></tr>
            ${adminDiscount > 0 ? `<tr><td>Admin Discount</td><td style="text-align:right;color:#e11d48">- ${adminDiscount}</td></tr>` : ""}
            ${promoDiscount > 0 ? `<tr><td>Promo Discount</td><td style="text-align:right;color:#e11d48">- ${promoDiscount}</td></tr>` : ""}
            <tr class="total-row"><td>Final Price</td><td style="text-align:right">${finalPrice}</td></tr>
            <tr><td>Paid Amount</td><td style="text-align:right;color:#15803d">${paidAmount}</td></tr>
            <tr><td>Due Amount</td><td style="text-align:right">${dueAmount}</td></tr>
          </table>
          <div style="text-align:center;margin:25px 0;font-size:16px;font-weight:600;color:${isSettled ? "#15803d" : "#b45309"}">${isSettled ? "FULLY PAID" : "Payment Pending"}</div>
          <div style="margin:20px 0;padding:15px;background:#f8f8f8;border-radius:8px;">
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${trxId}</p>
            <p><strong>Phone Number:</strong> ${paymentPhone}</p>
          </div>
          <div class="signature-section">
            <div>
              <img src="/Azom Sign.png" alt="Authorized Signature" />
              <p style="margin:8px 0 0;font-size:14px;font-weight:600;">Authorized Signatory</p>
              <p style="margin:0;font-size:13px;">Barista Training Bangladesh</p>
            </div>
          </div>
          <div class="footer">
            <div class="thankyou">Thank You!</div>
            <p>This is a computer-generated receipt. No signature required.</p>
            <p style="margin-top:25px;font-size:11px">Generated on ${new Date().toLocaleString("en-BD")}</p>
          </div>
        </div>
      </body>
      </html>
    `);

    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 500);
  };

  return (
    <ProtectedRoute roles={["student"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <Reveal variant="fade-up">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-[#fff0df]">
              Welcome back, {user?.name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="mt-2 text-[#e6c6a5]">
              Track your progress, mark attendance, and complete your barista training.
            </p>
          </div>
        </Reveal>

        {message && <Reveal variant="fade-up"><p className="mb-6 rounded-2xl bg-green-900/30 px-6 py-4 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mb-6 rounded-2xl bg-red-900/30 px-6 py-4 text-red-300">{error}</p></Reveal>}

        {/* Announcements at top */}
        {announcements.length > 0 && (
          <Reveal variant="fade-up" delay={30}>
            <section className="section-card mb-8 rounded-3xl p-6">
              <h2 className="mb-5 text-2xl font-black text-[#fff0df]">Announcements</h2>
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann._id} className="rounded-2xl border border-white/10 bg-[#211309] p-5 transition-all duration-300 hover:border-[#f39b45]/20">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#ffebd4]">{ann.title}</h3>
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-semibold ${ann.priority === "urgent" ? "bg-red-400/20 text-red-400" : ann.priority === "high" ? "bg-orange-400/20 text-orange-400" : "bg-blue-400/20 text-blue-400"}`}>
                        {ann.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#e6c6a5] whitespace-pre-line">{ann.content}</p>
                    <p className="mt-3 text-[10px] text-[#e6c6a5]">— {ann.createdBy?.name || "Admin"} • {new Date(ann.createdAt).toLocaleDateString("en-BD")}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal variant="fade-up" delay={60}>
          <section className="section-card mb-10 rounded-3xl p-6">
            <h2 className="mb-6 text-2xl font-black text-[#fff0df]">My Enrollments</h2>
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-[#211309] p-6">
                    <div className="skeleton h-6 w-3/4" />
                    <div className="skeleton mt-4 h-16 w-full" />
                    <div className="skeleton mt-4 h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <p className="py-12 text-center text-[#e6c6a5]">You have not enrolled in any course yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((en, i) => {
                  const totalClasses = en.course?.durationDays || 16;
                  const courseBatches = studentBatches.filter((b) =>
                    b.courses?.some((c) => (c._id || c) === en.course?._id) ||
                    b.course?._id === en.course?._id
                  );
                  const attended = attendance.filter((record) => {
                    if (record.studentRecord?.status !== "present") return false;
                    if (courseBatches.length === 0) return true;
                    return courseBatches.some((b) => b._id === record.batch?._id);
                  }).length;

                  const classesLeft = Math.max(0, totalClasses - attended);

                  const batchInfo = studentBatches.length > 0 ? studentBatches[0] : null;

                  const paid = en.paymentSummary?.paidAmount || 0;
                  const due = en.paymentSummary?.dueAmount || 0;
                  const isSettled = en.paymentSummary?.isSettled || false;

                  return (
                    <Reveal key={en._id} delay={i * 60} variant="fade-up">
                      <div className="group rounded-2xl border border-white/10 bg-[#211309] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f39b45]/30 hover:shadow-xl">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-[#ffebd4]">{en.course?.title}</h3>
                          <span className={`rounded-full px-4 py-1 text-xs font-bold ${en.status === "completed" ? "bg-green-400/20 text-green-400" : "bg-amber-400/20 text-amber-400"}`}>
                            {en.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-3 text-xs text-[#e6c6a5]">
                          <p><span className="font-medium text-[#ffc489]">Batch:</span> {batchInfo ? `${batchInfo.name} (${batchInfo.code})` : "Not yet assigned"}</p>
                          {batchInfo?.schedule?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {batchInfo.schedule.map((s, i) => (
                                <p key={i} className="text-[10px] text-[#a09080]">{s.day} {s.startTime}-{s.endTime}{s.topic ? ` - ${s.topic}` : ""}{s.room ? ` (${s.room})` : ""}</p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 rounded-xl bg-[#1a1008] p-3 text-xs text-[#e6c6a5]">
                          <p><span className="font-medium text-[#ffc489]">Location:</span> 1/1, 1/2, Road-2, Block-G, Shah Ali, Mirpur-1</p>
                          <p className="text-[10px] text-[#a09080]">(Take-Out Restaurant Building), Dhaka-1216</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#1a1008] px-5 py-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[#e6c6a5]">Classes Left</p>
                            <p className="text-4xl font-black text-[#fff0df]">{classesLeft}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#e6c6a5]">Total Classes</p>
                            <p className="text-2xl font-semibold text-[#ffc489]">{totalClasses}</p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#e6c6a5]">Final Price</span>
                            <span>Tk{en.pricing?.finalPrice || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#e6c6a5]">Paid</span>
                            <span className="text-green-400">Tk{paid}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#e6c6a5]">Due</span>
                            <span>Tk{due}</span>
                          </div>
                        </div>

                        {isSettled ? (
                          <p className="mt-4 text-sm font-semibold text-green-400">Fully Paid</p>
                        ) : (
                          <p className="mt-4 text-sm font-semibold text-amber-400">Payment Pending</p>
                        )}

                        <button
                          onClick={() => handlePrintReceipt(en)}
                          className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl border border-white/20 py-3 text-sm font-semibold text-[#e6c6a5] transition-all hover:bg-white/10"
                        >
                          Print Official Receipt
                        </button>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal variant="fade-up" delay={150}>
          <section className="section-card rounded-3xl p-6">
            <h2 className="mb-6 text-2xl font-black text-[#fff0df]">My Attendance History</h2>
            {attendance.length === 0 ? (
              <p className="py-12 text-center text-[#e6c6a5]">No attendance records yet. Start attending classes!</p>
            ) : (
              <div className="space-y-4">
                {attendance.map((record) => (
                  <div key={record._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#211309] p-5 transition-all duration-300 hover:border-[#f39b45]/20">
                    <div>
                      <p className="font-medium text-[#ffebd4]">
                        {record.batch?.name || "Batch"} {" "}{'\u2022'}{" "}
                        {new Date(record.sessionDate).toLocaleDateString("en-BD", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2 sm:text-sm ${record.studentRecord?.status === "present" ? "bg-green-400/20 text-green-400" : record.studentRecord?.status === "late" ? "bg-yellow-400/20 text-yellow-400" : "bg-red-400/20 text-red-400"}`}>
                        {record.studentRecord?.status?.toUpperCase() || "\u2014"}
                      </span>
                      <p className="hidden sm:block max-w-[180px] truncate text-xs text-[#e6c6a5]">
                        {record.studentRecord?.notes || "No notes"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        <p className="mt-12 text-center text-xs text-[#e6c6a5]">Need help? Contact your trainer or admin.</p>
      </div>

      {isPaymentModalOpen && selectedCourseForEnroll && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="modal-content w-full max-w-md rounded-3xl bg-[#211309] p-6 shadow-2xl">
            <h3 className="text-2xl font-black text-[#fff0df]">Enroll in {selectedCourseForEnroll.title}</h3>
            <p className="mt-1 text-[#e6c6a5]">Minimum initial payment: 500 Taka (bKash / Nagad)</p>

            <form onSubmit={handleEnrollWithPayment} className="mt-6 space-y-5">
              <div className="rounded-2xl bg-[#1a1008] p-4">
                <p className="text-xs uppercase tracking-widest text-[#e6c6a5]">bKash Payment Number</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-semibold text-[#fff0df]">{BKASH_NUMBER}</p>
                  <button type="button" onClick={copyBkasNumber} className="rounded-xl bg-white/10 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white/20">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Amount (Tk) - Min 500</label>
                <input type="number" min="500" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} className="input-focus-ring mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" required />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Payment Method</label>
                <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="input-focus-ring mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none">
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Transaction ID (Trx ID)</label>
                <input type="text" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="input-focus-ring mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" placeholder="e.g. 8N3K9P2M" required />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#e6c6a5]">Your Phone Number</label>
                <input type="text" value={paymentForm.phone} onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })} className="input-focus-ring mt-1 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb] outline-none" placeholder="01XXXXXXXXX" required />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closePaymentModal} className="flex-1 rounded-2xl border border-white/20 py-3 text-[#e6c6a5] transition-all hover:bg-white/5">Cancel</button>
                <button type="submit" className="btn-primary flex-1 rounded-2xl py-3 font-semibold text-white">Pay {paymentForm.amount}Tk & Enroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
