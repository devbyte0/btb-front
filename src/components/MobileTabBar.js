"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const guestTabs = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/courses", label: "Courses", icon: "📚" },
  { href: "/about-us", label: "About", icon: "ℹ" },
  { href: "/contact-us", label: "Contact", icon: "✉" },
  { href: "/login", label: "Login", icon: "🔑" },
];

const userTabs = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/courses", label: "Courses", icon: "📚" },
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  { href: "/logout", label: "Logout", icon: "🚪" },
];

const adminTabs = [
  { href: "/dashboard/admin/popups", label: "Ads", icon: "📢" },
  { href: "/dashboard/admin/announcements", label: "News", icon: "📰" },
  { href: "/dashboard/admin/enrollments", label: "Enroll", icon: "📝" },
  { href: "/dashboard/admin/batches", label: "Batches", icon: "📦" },
  { href: "/dashboard/admin/contact-inquiries", label: "Inbox", icon: "✉" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
  let tabs = guestTabs;
  if (user && isAdmin) tabs = adminTabs;
  else if (user) tabs = userTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1009]/98 px-2 pb-1 pt-1.5 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {tabs.map((tab) => {
          if (tab.href === "/logout") {
            return (
              <button key="logout" onClick={logout}
                className="relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium text-[#a09080] active:scale-95 transition-all duration-200">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-base">🚪</span>
                <span>Logout</span>
              </button>
            );
          }
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link key={tab.href} href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                active ? "scale-105 text-[#f39b45]" : "text-[#a09080] active:scale-95"
              }`}>
              {active && (
                <span className="absolute -top-1.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#f39b45] to-[#d4803c] shadow-lg shadow-[#f39b45]/50" />
              )}
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base transition-all duration-200 ${
                active ? "bg-[#f39b45]/15" : ""
              }`}>{tab.icon}</span>
              <span className={`${active ? "font-semibold" : ""}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
