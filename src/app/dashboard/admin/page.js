"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDashboard } from "@/context/DashboardContext";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { announcementApi, dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const { courses, loadingCourses, coursesError } = useDashboard();
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ users: 0, trainers: 0, students: 0, batches: 0 });

  useEffect(() => {
    announcementApi.list(token).then((res) => setAnnouncements(unwrap(res))).catch(() => {});
    dashboardApi.listUsers(token).then((res) => {
      const users = unwrap(res);
      setStats({ users: users.length, trainers: users.filter((u) => u.role === "trainer").length, students: users.filter((u) => u.role === "student").length, batches: 0 });
    }).catch(() => {});
    dashboardApi.listBatches(token).then((res) => {
      setStats((p) => ({ ...p, batches: (res?.data || res || []).length }));
    }).catch(() => {});
  }, [token]);

  const quickLinks = [
    { href: "/dashboard/admin/popups", title: "Popups", desc: "Manage homepage popup ads." },
    { href: "/dashboard/admin/carousels", title: "Carousels", desc: "Manage homepage slider images." },
    { href: "/dashboard/admin/about-us", title: "About Us", desc: "Edit page content, media, and video collage." },
    { href: "/dashboard/admin/announcements", title: "Announcements", desc: "Send announcements to users." },
    { href: "/dashboard/admin/trainers", title: "Trainers", desc: "Manage trainers and students." },
    { href: "/dashboard/admin/enrollments", title: "Enrollments", desc: "View enrollments and payments." },
    { href: "/dashboard/admin/batches", title: "Batches", desc: "Control batches and assignments." },
    { href: "/dashboard/admin/admins", title: "Courses & Promos", desc: "Manage courses and promo codes." },
    { href: "/dashboard/admin/attendance", title: "Attendance", desc: "Mark and monitor attendance." },
    { href: "/dashboard/admin/contact-inquiries", title: "Inquiries", desc: "View contact form submissions." },
  ];

  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <section className="mb-8 overflow-hidden rounded-3xl border border-amber-200/20 bg-gradient-to-r from-[#2a170d] via-[#3a220f] to-[#1f120a] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">
                  {user?.role === "super_admin" ? "Super Admin" : "Admin Control Center"}
                </span>
                <h1 className="mt-4 text-3xl font-black text-[#fff0df] md:text-4xl">
                  Welcome, {user?.name || "Admin"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#f0cfad] md:text-base">
                  Manage trainers, enrollment activity, admin operations, and attendance monitoring from one place.
                </p>
              </div>
              <span className="hidden shrink-0 rounded-full border border-[#f39b45]/40 bg-[#f39b45]/10 px-4 py-2 text-sm font-semibold text-[#f39b45] md:inline-block">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </section>
        </Reveal>

        <Reveal variant="fade-up" delay={50}>
          <AdminSectionNav />
        </Reveal>

        {announcements.length > 0 && (
          <Reveal variant="fade-up" delay={70}>
            <section className="section-card mb-6 rounded-2xl p-5">
              <h2 className="text-lg font-black text-[#fff0df]">Recent Announcements</h2>
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

        <Reveal variant="fade-up" delay={100}>
          <section className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            {[
              { label: "Total Courses", value: courses.length },
              { label: "Students", value: stats.students },
              { label: "Trainers", value: stats.trainers },
              { label: "Batches", value: stats.batches },
            ].map((item, i) => (
              <article key={item.label} className="section-card rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1">
                <p className="text-xs uppercase tracking-wider text-[#ffcc95]">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#fff0df]">{item.value}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal variant="fade-up" delay={130}>
          <section className="section-card mb-6 rounded-2xl p-5">
            <h2 className="text-lg font-black text-[#fff0df]">Quick Links</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="group rounded-xl border border-white/10 bg-[#211309] p-3 transition-all duration-300 hover:border-[#f39b45]/40 hover:bg-[#211309]/80">
                  <p className="font-semibold text-[#ffebd4] text-sm group-hover:text-[#f39b45] transition-colors">{link.title}</p>
                  <p className="mt-0.5 text-xs text-[#e6c6a5]">{link.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          <Reveal delay={200} variant="fade-up" className="md:col-span-2">
            <section className="section-card rounded-2xl p-5 md:p-6">
              <h2 className="text-2xl font-black text-[#fff0df]">Course Snapshot</h2>
              {coursesError ? <p className="mt-2 text-red-300">{coursesError}</p> : null}
              {loadingCourses ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-[#211309] p-4">
                      <div className="skeleton h-5 w-3/4" /><div className="skeleton mt-2 h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <p className="mt-4 text-[#e6c6a5]">No courses yet.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <article key={course._id} className="rounded-xl border border-white/10 bg-[#211309] p-4 transition-all duration-300 hover:border-[#f39b45]/30">
                      {course.thumbnailUrl && (
                        <div className="mb-2 h-20 overflow-hidden rounded-lg bg-[#2a170d]">
                          <img src={course.thumbnailUrl} alt="" className="h-full w-full object-contain" />
                        </div>
                      )}
                      <h3 className="font-bold text-[#ffebd4]">{course.title}</h3>
                      <p className="mt-1 text-sm text-[#e3c2a0]">Days: {course.durationDays}</p>
                      <p className="mt-1 text-sm text-[#ffc489]">Tk {course.basePrice}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </div>
      </div>
    </ProtectedRoute>
  );
}
