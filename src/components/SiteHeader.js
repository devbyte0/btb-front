"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

const defaultNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/courses", label: "Courses" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

const adminNavLinks = [
  { href: "/dashboard/admin/popups", label: "Popups" },
  { href: "/dashboard/admin/carousels", label: "Carousels" },
  { href: "/dashboard/admin/about-us", label: "About" },
  { href: "/dashboard/admin/announcements", label: "Announce" },
  { href: "/dashboard/admin/trainers", label: "Trainers" },
  { href: "/dashboard/admin/enrollments", label: "Enrollments" },
  { href: "/dashboard/admin/batches", label: "Batches" },
  { href: "/dashboard/admin/attendance", label: "Attend" },
  { href: "/dashboard/admin/contact-inquiries", label: "Inquiries" },
];

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  const navLinks = isAdmin ? adminNavLinks : defaultNavLinks;

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#160d08]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
        <Link href="/" className="flex items-center gap-3 text-[#ffd4a5] transition-all hover:opacity-80">
          <Image src="/btb-logo.png" alt="Barista Training Bangladesh logo" width={52} height={52}
            className="h-12 w-12 rounded-full bg-white object-cover p-1 transition-transform duration-300 hover:scale-105" priority />
          <span className="max-w-[130px] text-xs font-bold tracking-wide sm:max-w-none sm:text-sm md:text-base">
            Barista Training Bangladesh
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Profile */}
          {user && (
            <Link href="/dashboard/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-[#ffe7ce] transition-all hover:border-[#f0963a]/40"
              aria-label="Profile">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}

          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <button onClick={handleNotifClick}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-[#ffe7ce] transition-all hover:border-[#f0963a]/40"
                aria-label="Notifications">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f39b45] text-[10px] font-bold text-[#2a1608] animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-[#1a1009]/95 p-3 shadow-2xl backdrop-blur-xl">
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                      <p className="text-xs font-semibold text-[#ffe7ce]">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] text-[#f39b45] hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-64 space-y-1 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-[#e6c6a5]">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <Link key={n._id} href={n.link || "#"} onClick={() => setNotifOpen(false)}
                            className={`block rounded-xl px-3 py-2 text-xs transition-all hover:bg-white/5 ${n.read ? "opacity-50" : "border-l-2 border-[#f39b45]"}`}>
                            <p className="font-medium text-[#ffe7ce]">{n.title}</p>
                            {n.message && <p className="mt-0.5 text-[#e6c6a5] truncate">{n.message}</p>}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 text-sm md:flex md:gap-2 md:text-base">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="nav-link rounded-full px-3 py-1.5 text-[#ffe7ce] transition-all hover:bg-[#f0963a]/15 hover:text-[#f0963a]">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={isAdmin ? "/dashboard/admin" : "/dashboard"}
                  className="rounded-full bg-gradient-to-r from-[#f39b45] to-[#d4803c] px-3 py-1.5 font-semibold text-[#2a1608] shadow-lg shadow-[#f39b45]/25 transition-all hover:scale-105 hover:shadow-xl">
                  {user.role}
                </Link>

                <button type="button" onClick={logout}
                  className="rounded-full border border-[#f6bf86]/40 px-3 py-1.5 text-[#ffe4c4] transition-all hover:border-[#f6bf86] hover:bg-[#f6bf86]/10">
                  Logout
                </button>
              </>
            ) : null}
          </nav>

          {/* Mobile: Hamburger + Dashboard/Login */}
          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <Link href={isAdmin ? "/dashboard/admin" : "/dashboard"}
                className="rounded-full bg-gradient-to-r from-[#f39b45] to-[#d4803c] px-3 py-1.5 text-xs font-semibold text-[#2a1608] shadow-lg shadow-[#f39b45]/25">
                Dashboard
              </Link>
            ) : (
              <Link href="/login"
                className="rounded-full border border-[#f6bf86]/40 px-3 py-1.5 text-xs font-semibold text-[#ffe4c4]">
                Login
              </Link>
            )}
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-[#ffe7ce] transition-all hover:border-[#f0963a]/40"
              aria-label="Toggle navigation">
              <div className="flex flex-col gap-1">
                <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
          <nav className="mobile-menu-enter fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-1 border-l border-white/10 bg-[#1a1009]/95 p-6 pt-20 backdrop-blur-xl md:hidden">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-[#ffe7ce] transition-all hover:bg-[#f0963a]/15 hover:text-[#f0963a]">
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-[#ffe7ce] transition-all hover:bg-[#f0963a]/15 hover:text-[#f0963a]">
                Profile
              </Link>
            ) : null}
            {user ? (
              <button type="button" onClick={() => { logout(); setMobileOpen(false); }}
                className="mt-4 rounded-xl border border-red-400/30 px-4 py-3 text-left text-red-300 transition-all hover:bg-red-400/10">
                Logout
              </button>
            ) : null}
          </nav>
        </>
      )}
    </header>
  );
}
