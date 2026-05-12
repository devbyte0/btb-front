"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || res || [];

export default function CoursesClient() {
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 500,
    method: "bkash",
    reference: "",
    phone: "",
  });

  const [copied, setCopied] = useState(false);
  const BKASH_NUMBER = "01873886367";

  useEffect(() => {
    dashboardApi
      .listCourses(token)
      .then((res) => setCourses(unwrap(res)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const openEnrollModal = (course) => {
    if (!isAuthenticated || user?.role !== "student") {
      router.push("/login");
      return;
    }
    setSelectedCourse(course);
    setPaymentForm({ amount: 500, method: "bkash", reference: "", phone: user?.phone || "" });
    setIsModalOpen(true);
    setMessage(""); setError(""); setCopied(false);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedCourse(null); };

  const copyBkasNumber = async () => {
    try {
      await navigator.clipboard.writeText(BKASH_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error("Failed to copy", err); }
  };

  const handleEnrollWithPayment = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (paymentForm.amount < 500) { setError("Minimum payment is 500 Taka"); return; }
    setError(""); setMessage("");
    try {
      const enrollmentRes = await dashboardApi.createEnrollment(token, {
        courseId: selectedCourse._id,
        studentId: user?._id || user?.id,
        paidAmount: paymentForm.amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        phone: paymentForm.phone,
      });
      const enrollment = unwrap(enrollmentRes);
      await dashboardApi.createPayment(token, {
        enrollmentId: enrollment._id,
        amount: paymentForm.amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        note: `Initial payment - Phone: ${paymentForm.phone}`,
      });
      setMessage("Enrollment successful! Payment recorded.");
      closeModal();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e] min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-16">
        <Reveal variant="fade-up">
          <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">
            Learning Paths
          </span>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">Our Courses</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6b6b6b] md:text-lg">
            Curated training paths for beginners and professionals who want to master brewing, latte art, and coffee business excellence.
          </p>
        </Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-green-50 px-6 py-4 text-green-700 border border-green-200">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-6 rounded-2xl bg-red-50 px-6 py-4 text-red-700 border border-red-200">{error}</p></Reveal>}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton mt-4 h-6 w-3/4" />
                <div className="skeleton mt-4 h-16 w-full" />
                <div className="skeleton mt-4 h-10 w-full" />
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
                  <p className="mt-3 text-lg font-semibold text-[#d4803c]">BDT {course.basePrice}</p>
                  <button
                    type="button"
                    onClick={() => openEnrollModal(course)}
                    className="btn-primary mt-5 w-full rounded-xl px-4 py-3 font-semibold text-white"
                  >
                    Enroll (Min 500৳)
                  </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {isModalOpen && selectedCourse && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="modal-content w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-2xl font-black text-[#1c1c1e]">Enroll in {selectedCourse.title}</h3>
              <p className="mt-1 text-[#6b6b6b]">Minimum initial payment: 500 Taka (bKash / Nagad)</p>

              <form onSubmit={handleEnrollWithPayment} className="mt-6 space-y-5">
                <div className="rounded-2xl bg-[#faf8f5] p-4">
                  <p className="text-xs uppercase tracking-widest text-[#6b6b6b]">Payment Number</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-2xl font-semibold text-[#1c1c1e]">{BKASH_NUMBER}</p>
                    <button type="button" onClick={copyBkasNumber}
                      className="rounded-xl bg-[#d4803c]/10 px-5 py-2 text-sm font-medium text-[#d4803c] transition-all hover:bg-[#d4803c]/20">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#6b6b6b]">Amount (৳) - Min 500</label>
                  <input type="number" min="500" value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15" required />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#6b6b6b]">Payment Method</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none focus:border-[#d4803c]">
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#6b6b6b]">Transaction ID (Trx ID)</label>
                  <input type="text" value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                    placeholder="e.g. 8N3K9P2M" required />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#6b6b6b]">Your Phone Number</label>
                  <input type="text" value={paymentForm.phone}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3 text-[#1c1c1e] outline-none focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                    placeholder="01XXXXXXXXX" required />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal}
                    className="flex-1 rounded-2xl border border-[#1c1c1e]/20 py-3 text-[#6b6b6b] transition-all hover:bg-[#faf8f5]">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 rounded-2xl py-3 font-semibold text-white">Pay {paymentForm.amount}৳ & Enroll</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
