"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import { useDashboard } from "@/context/DashboardContext";
import Reveal from "@/components/Reveal";

export default function AdminAdminsPage() {
  const { token, user } = useAuth();
  const { courses, setCourses } = useDashboard();
  const [promoForm, setPromoForm] = useState({ code: "", discountType: "percent", discountValue: 10, usageLimit: 100 });
  const [courseForm, setCourseForm] = useState({ title: "", description: "", durationDays: 30, basePrice: 0, thumbnailUrl: "" });
  const [editingCourseId, setEditingCourseId] = useState("");
  const [promos, setPromos] = useState([]);
  const [editingPromoId, setEditingPromoId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.listPromos(token).then((res) => setPromos(res?.data || res || [])).catch((err) => setError(err.message));
  }, [token]);

  const handleCreatePromo = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      await dashboardApi.createPromo(token, { ...promoForm, discountValue: Number(promoForm.discountValue), usageLimit: Number(promoForm.usageLimit) });
      setMessage("Promo code created.");
      setPromoForm({ code: "", discountType: "percent", discountValue: 10, usageLimit: 100 });
      const promosRes = await dashboardApi.listPromos(token);
      setPromos(promosRes?.data || promosRes || []);
    } catch (err) { setError(err.message); }
  };

  const handleCreateCourse = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      const payload = { ...courseForm, durationDays: Number(courseForm.durationDays), basePrice: Number(courseForm.basePrice) };
      await dashboardApi.createCourse(token, payload);
      setMessage("Course created successfully.");
      setCourseForm({ title: "", description: "", durationDays: 30, basePrice: 0, thumbnailUrl: "" });
      const coursesRes = await dashboardApi.listCourses(token);
      setCourses(coursesRes?.data || []);
    } catch (err) { setError(err.message); }
  };

  const handleUpdateCourse = async (courseId) => {
    try {
      await dashboardApi.updateCourse(token, courseId, { ...courseForm, durationDays: Number(courseForm.durationDays), basePrice: Number(courseForm.basePrice), thumbnailUrl: courseForm.thumbnailUrl || undefined });
      setMessage("Course updated.");
      setEditingCourseId("");
      const coursesRes = await dashboardApi.listCourses(token);
      setCourses(coursesRes?.data || []);
    } catch (err) { setError(err.message); }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await dashboardApi.deleteCourse(token, courseId);
      setMessage("Course deleted.");
      const coursesRes = await dashboardApi.listCourses(token);
      setCourses(coursesRes?.data || []);
    } catch (err) { setError(err.message); }
  };

  const handleUpdatePromo = async (promoId) => {
    try {
      await dashboardApi.updatePromo(token, promoId, { ...promoForm, discountValue: Number(promoForm.discountValue), usageLimit: Number(promoForm.usageLimit) });
      setEditingPromoId("");
      setMessage("Coupon updated.");
      const promosRes = await dashboardApi.listPromos(token);
      setPromos(promosRes?.data || promosRes || []);
    } catch (err) { setError(err.message); }
  };

  const handleDeletePromo = async (promoId) => {
    try {
      await dashboardApi.deletePromo(token, promoId);
      setMessage("Coupon deleted.");
      const promosRes = await dashboardApi.listPromos(token);
      setPromos(promosRes?.data || promosRes || []);
    } catch (err) { setError(err.message); }
  };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">{user?.role === "trainer" ? "Courses" : "Admins"}</h1>
          <p className="mt-2 text-[#e6c6a5]">{user?.role === "trainer" ? "Manage courses for your training programs." : "Control promo codes, discounts, and admin-level actions."}</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {user?.role !== "trainer" ? (
          <Reveal variant="fade-left" delay={100}>
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Create Promo Code</h2>
              <form className="mt-4 space-y-3" onSubmit={handleCreatePromo}>
                <input required placeholder="Promo Code" value={promoForm.code}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                <select value={promoForm.discountType} onChange={(e) => setPromoForm((prev) => ({ ...prev, discountType: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none">
                  <option value="percent">Percent</option><option value="flat">Flat</option>
                </select>
                <input required type="number" min="0" placeholder="Discount Value" value={promoForm.discountValue}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                <input required type="number" min="1" placeholder="Usage Limit" value={promoForm.usageLimit}
                  onChange={(e) => setPromoForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                <button className="btn-primary w-full rounded-xl px-4 py-2.5 font-semibold text-white">Create Promo</button>
              </form>
            </section>
          </Reveal>
          ) : null}

          {user?.role !== "student" ? (
            <Reveal variant="fade-right" delay={100}>
              <section className="section-card rounded-2xl p-5 md:p-6">
                <h2 className="text-2xl font-black text-[#fff0df]">Add Course</h2>
                <form className="mt-4 space-y-3" onSubmit={handleCreateCourse}>
                  <input required placeholder="Course Title" value={courseForm.title}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <textarea placeholder="Description" value={courseForm.description}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <input required type="number" min="1" placeholder="Duration Days" value={courseForm.durationDays}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, durationDays: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <input required type="number" min="0" placeholder="Base Price" value={courseForm.basePrice}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, basePrice: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <input placeholder="Thumbnail Image URL (optional)" value={courseForm.thumbnailUrl}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  <button className="w-full rounded-xl border border-[#f6bf86] px-4 py-2.5 font-semibold text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Add Course</button>
                </form>
              </section>
            </Reveal>
          ) : null}
        </div>

        {user?.role !== "student" ? (
          <Reveal variant="fade-up" delay={150}>
            <section className="section-card mt-5 rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Course CRUD</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {courses.map((course, i) => (
                  <Reveal key={course._id} delay={i * 30} variant="fade-up">
                    <article className="group rounded-xl border border-white/10 bg-[#211309] p-4 transition-all duration-300 hover:border-[#f39b45]/30">
                      {editingCourseId === course._id ? (
                        <div className="space-y-2">
                          <input value={courseForm.title} onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                          <input type="number" value={courseForm.basePrice} onChange={(e) => setCourseForm((prev) => ({ ...prev, basePrice: e.target.value }))}
                            className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                          <input value={courseForm.thumbnailUrl} onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                            placeholder="Thumbnail URL"
                            className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                          <button type="button" onClick={() => handleUpdateCourse(course._id)}
                            className="btn-primary w-full rounded-lg px-3 py-2 text-sm font-semibold text-white">Save</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-3">
                            {course.thumbnailUrl && (
                              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#2a170d]">
                                <img src={course.thumbnailUrl} alt="" className="h-full w-full object-contain" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-[#ffebd4] group-hover:text-[#f39b45] transition-colors">{course.title}</p>
                              <p className="text-sm text-[#e6c6a5]">Days: {course.durationDays}</p>
                              <p className="text-sm text-[#e6c6a5]">BDT {course.basePrice}</p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button type="button" onClick={() => { setEditingCourseId(course._id); setCourseForm({ title: course.title || "", description: course.description || "", durationDays: course.durationDays || 30, basePrice: course.basePrice || 0, thumbnailUrl: course.thumbnailUrl || "" }); }}
                              className="rounded-lg border border-[#f6bf86] px-2 py-1.5 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                            <button type="button" onClick={() => handleDeleteCourse(course._id)}
                              className="rounded-lg border border-red-400/60 px-2 py-1.5 text-xs text-red-300 transition-all hover:bg-red-400/10">Delete</button>
                          </div>
                        </>
                      )}
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {user?.role !== "trainer" ? (
        <Reveal variant="fade-up" delay={200}>
          <section className="section-card mt-5 rounded-2xl p-5 md:p-6">
            <h2 className="text-2xl font-black text-[#fff0df]">Coupons CRUD</h2>
            <p className="mt-2 text-sm text-[#e6c6a5]">Total coupons: {promos.length} | Active: {promos.filter((p) => p.isActive !== false).length}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {promos.map((promo, i) => (
                <Reveal key={promo._id} delay={i * 30} variant="fade-up">
                  <article className="group rounded-xl border border-white/10 bg-[#211309] p-4 transition-all duration-300 hover:border-[#f39b45]/30">
                    {editingPromoId === promo._id ? (
                      <div className="space-y-2">
                        <input value={promoForm.code} onChange={(e) => setPromoForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                        <input type="number" value={promoForm.discountValue} onChange={(e) => setPromoForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                          className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                        <button type="button" onClick={() => handleUpdatePromo(promo._id)}
                          className="btn-primary w-full rounded-lg px-3 py-2 text-sm font-semibold text-white">Save</button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-[#ffebd4] group-hover:text-[#f39b45] transition-colors">{promo.code}</p>
                        <p className="text-sm text-[#e6c6a5]">{promo.discountType} - {promo.discountValue}</p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button type="button" onClick={() => { setEditingPromoId(promo._id); setPromoForm({ code: promo.code || "", discountType: promo.discountType || "percent", discountValue: promo.discountValue || 0, usageLimit: promo.usageLimit || 100 }); }}
                            className="rounded-lg border border-[#f6bf86] px-2 py-1.5 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                          <button type="button" onClick={() => handleDeletePromo(promo._id)}
                            className="rounded-lg border border-red-400/60 px-2 py-1.5 text-xs text-red-300 transition-all hover:bg-red-400/10">Delete</button>
                        </div>
                      </>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
        ) : null}

        {message && <Reveal variant="fade-up"><p className="mt-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-3 text-red-300">{error}</p></Reveal>}
      </div>
    </ProtectedRoute>
  );
}
