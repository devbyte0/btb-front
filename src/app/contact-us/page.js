"use client";

import { useState } from "react";
import { contactApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMessage(""); setError("");
    try {
      await contactApi.submit(form);
      setMessage("Thank you! Your message has been received. We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e] min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-16">
        <Reveal variant="fade-up">
          <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">
            Get in Touch
          </span>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6b6b6b] md:text-lg">
            Visit our campus, book a trial class, or ask about custom training for your team.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2 md:gap-6">
          <Reveal variant="fade-left" delay={100}>
            <div className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
              <h2 className="text-xl font-bold md:text-2xl">Contact Information</h2>
              <ul className="mt-4 space-y-4 text-[#6b6b6b]">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4803c]/10 text-sm text-[#d4803c]">📞</span>
                  <div className="min-w-0">
                    <a href="tel:+8801911769822" className="font-semibold text-[#1c1c1e] hover:text-[#d4803c] break-all">+880 1911-769822</a>
                    <p className="text-sm text-[#6b6b6b]">
                      <a href="https://wa.me/8801911769822?text=Hi!%20I'm%20interested%20in%20barista%20training." target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Chat on WhatsApp</a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4803c]/10 text-sm text-[#d4803c]">✉</span>
                  <div className="min-w-0">
                    <a href="mailto:info.baristatrainingbangladesh@gmail.com" className="font-semibold text-[#d4803c] hover:underline break-all">info.baristatrainingbangladesh@gmail.com</a>
                    <p className="text-sm text-[#6b6b6b]">Email us anytime</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4803c]/10 text-sm text-[#d4803c]">📘</span>
                  <div className="min-w-0">
                    <a href="https://www.facebook.com/info.btb2025" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#d4803c] hover:underline break-all">Facebook Page</a>
                    <p className="text-sm text-[#6b6b6b]">@info.btb2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4803c]/10 text-sm text-[#d4803c]">📍</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1c1c1e]">1/1, 1/2, Road-2, Block-G, Shah Ali, Mirpur-1</p>
                    <p className="text-sm text-[#6b6b6b] break-words">(Take-Out Restaurant Building), Dhaka-1216, Dhaka, Bangladesh</p>
                  </div>
                </li>
              </ul>

              {/* Map */}
              <div className="mt-6 overflow-hidden rounded-xl border border-[#1c1c1e]/6">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.702!2d90.374!3d23.806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzIxLjYiTiA5MMKwMjInMjYuNCJF!5e0!3m2!1sen!2sbd!4v1" width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full" />
              </div>
            </div>
          </Reveal>

          <Reveal variant="fade-right" delay={200}>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
              <h2 className="text-xl font-bold md:text-2xl">Quick inquiry</h2>
              <div className="mt-4 space-y-3">
                <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3.5 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                  placeholder="Your Name *" />
                <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3.5 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                  placeholder="Your Email" />
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3.5 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                  placeholder="Your Phone" />
                <textarea required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full rounded-xl border border-[#1c1c1e]/15 bg-white px-4 py-3.5 text-[#1c1c1e] outline-none transition-all focus:border-[#d4803c] focus:ring-2 focus:ring-[#d4803c]/15"
                  placeholder="Your Message *" />
                {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">{message}</p>}
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="btn-primary w-full rounded-xl px-5 py-3.5 font-semibold text-white disabled:opacity-60">
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
