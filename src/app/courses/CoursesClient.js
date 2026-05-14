"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi, dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const unwrap = (res) => res?.data || res || [];

export default function CoursesClient() {
  const { token, isAuthenticated, user, login } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", username: "", password: "", email: "", phone: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: 500, method: "bkash", reference: "", phone: "", promoCode: "" });

  const [copied, setCopied] = useState(false);
  const BKASH_NUMBER = "01911-769822";

  useEffect(() => {
    dashboardApi.listCourses(token).then((res) => setCourses(unwrap(res))).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [token]);

  const openEnrollModal = (course) => {
    setSelectedCourse(course);
    setMessage(""); setError(""); setCopied(false);
    if (!isAuthenticated || user?.role !== "student") {
      setIsRegistering(true);
      setRegisterForm({ name: "", username: "", password: "", email: "", phone: "" });
      setPaymentForm({ amount: 500, method: "bkash", reference: "", phone: "", promoCode: "" });
    } else {
      setIsRegistering(false);
      setPaymentForm({ amount: 500, method: "bkash", reference: "", phone: user?.phone || "", promoCode: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedCourse(null); setIsRegistering(false); };

  const copyBkasNumber = async () => {
    try { await navigator.clipboard.writeText(BKASH_NUMBER); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (err) { console.error(err); }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (paymentForm.amount < 500) { setError("Minimum payment is 500 Taka"); return; }
    setError(""); setMessage(""); setSubmitting(true);

    try {
      let activeToken = token;
      let activeUser = user;

      // Step 1: Register if guest
      if (isRegistering) {
        await authApi.registerStudent(registerForm);
        activeUser = await login(registerForm.username, registerForm.password);
        activeToken = localStorage.getItem("btb_token");
      }

      // Step 2: Create enrollment
      const enrollmentRes = await dashboardApi.createEnrollment(activeToken, {
        courseId: selectedCourse._id,
        studentId: activeUser?._id || activeUser?.id,
        paidAmount: paymentForm.amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        phone: paymentForm.phone,
        promoCode: paymentForm.promoCode || undefined,
        plainPassword: isRegistering ? registerForm.password : undefined,
      });
      const enrollment = unwrap(enrollmentRes);

      // Step 3: Record payment
      await dashboardApi.createPayment(activeToken, {
        enrollmentId: enrollment._id,
        amount: paymentForm.amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        note: `Initial payment - Phone: ${paymentForm.phone}`,
      });

      setMessage(isRegistering ? "Registered & enrolled successfully!" : "Enrollment successful! Payment recorded.");
      setTimeout(() => { closeModal(); if (isRegistering) router.push("/dashboard/student"); }, 1500);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e] min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-16">
        <Reveal variant="fade-up">
          <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">Learning Paths</span>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">Our Courses</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6b6b6b] md:text-lg">Curated training paths for beginners and professionals.</p>
        </Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-green-50 px-6 py-4 text-green-700 border border-green-200">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-red-50 px-6 py-4 text-red-700 border border-red-200">{error}</p></Reveal>}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm">
                <div className="skeleton h-4 w-20 rounded-full" /><div className="skeleton mt-4 h-6 w-3/4" /><div className="skeleton mt-4 h-16 w-full" /><div className="skeleton mt-4 h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-6">
            {courses.map((course, i) => (
              <Reveal key={course._id} delay={i * 80} variant="fade-up">
                <article className="group rounded-2xl border border-[#1c1c1e]/6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#d4803c]/5 overflow-hidden">
                  {course.thumbnailUrl && (
                    <div className="h-44 w-full overflow-hidden bg-[#f5f0eb]">
                      <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-[#d4803c]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#d4803c]">
                      {course.durationDays ? `${course.durationDays} Days` : "Flexible"}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold transition-colors group-hover:text-[#d4803c]">{course.title}</h2>
                    <p className="mt-4 leading-relaxed text-[#6b6b6b]">{course.description || "No details available"}</p>
                    <p className="mt-3 text-lg font-semibold text-[#d4803c]">Tk {course.basePrice}</p>
                    <button type="button" onClick={() => openEnrollModal(course)}
                      className="btn-primary mt-5 w-full rounded-xl px-4 py-3 font-semibold text-white">Enroll (Min 500 Tk)</button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {isModalOpen && selectedCourse && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl overflow-y-auto max-h-[85vh] md:p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-black text-[#1c1c1e] md:text-2xl">Enroll in {selectedCourse.title}</h3>
                <button onClick={closeModal} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c1c1e]/10 text-lg text-[#6b6b6b] hover:bg-[#1c1c1e]/20 hover:text-[#1c1c1e] transition-all shrink-0">&times;</button>
              </div>
              <p className="text-xs text-[#6b6b6b]">Min 500 Taka (bKash / Nagad)</p>

              {/* Registration form for guests */}
              {isRegistering && (
                <div className="mt-3 border-b border-[#1c1c1e]/10 pb-3">
                  <p className="text-xs font-semibold text-[#d4803c] mb-2">1. Create your account</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["name", "username", "password", "email", "phone"].map((field) => (
                      <input key={field} required={field === "name" || field === "username" || field === "password"}
                        type={field === "password" ? "password" : "text"}
                        placeholder={field[0].toUpperCase() + field.slice(1)} value={registerForm[field]}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        className={`rounded-xl border border-[#1c1c1e]/15 bg-white px-3 py-2.5 text-sm text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15 ${field === "phone" ? "col-span-2" : ""}`} />
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleEnroll} className="mt-3 space-y-3">
                <p className="text-xs font-semibold text-[#d4803c]">{isRegistering ? "2. " : ""}Payment</p>
                <div className="rounded-xl bg-[#faf8f5] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b]">Send payment to</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-lg font-semibold text-[#1c1c1e]">{BKASH_NUMBER}</p>
                    <button type="button" onClick={copyBkasNumber}
                      className="rounded-lg bg-[#d4803c]/10 px-3 py-1.5 text-xs font-medium text-[#d4803c] transition-all hover:bg-[#d4803c]/20">{copied ? "Copied!" : "Copy"}</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#6b6b6b]">Amount (Tk)</label>
                    <input type="number" min="500" value={paymentForm.amount || ""}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value === "" ? 500 : Number(e.target.value) })}
                      className="mt-0.5 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-3 py-2.5 text-sm text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#6b6b6b]">Method</label>
                    <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                      className="mt-0.5 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-3 py-2.5 text-sm text-[#1c1c1e] outline-none focus:border-[#d4803c]">
                      <option value="bkash">bKash</option><option value="nagad">Nagad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6b6b6b]">Promo Code</label>
                  <input type="text" value={paymentForm.promoCode} onChange={(e) => setPaymentForm({ ...paymentForm, promoCode: e.target.value })}
                    className="mt-0.5 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-3 py-2.5 text-sm text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                    placeholder="e.g. STUDENT10" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6b6b6b]">Transaction ID</label>
                  <input type="text" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="mt-0.5 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-3 py-2.5 text-sm text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                    placeholder="e.g. 8N3K9P2M" required />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6b6b6b]">Your Phone</label>
                  <input type="text" value={paymentForm.phone} onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                    className="mt-0.5 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-3 py-2.5 text-sm text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                    placeholder="01XXXXXXXXX" required />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 rounded-xl border border-[#1c1c1e]/20 py-2.5 text-sm text-[#6b6b6b] transition-all hover:bg-[#faf8f5]">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {submitting ? "Processing..." : `Pay ${paymentForm.amount} Tk & Enroll`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
