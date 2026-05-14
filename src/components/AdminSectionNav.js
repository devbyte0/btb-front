"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/dashboard/admin/students", label: "Students" },
  { href: "/dashboard/admin/popups", label: "Popups" },
  { href: "/dashboard/admin/carousels", label: "Carousels" },
  { href: "/dashboard/admin/about-us", label: "About Us" },
  { href: "/dashboard/admin/announcements", label: "Announce" },
  { href: "/dashboard/admin/trainers", label: "Trainers" },
  { href: "/dashboard/admin/enrollments", label: "Enrollments" },
  { href: "/dashboard/admin/batches", label: "Batches" },
  { href: "/dashboard/admin/admins", label: "Admins" },
  { href: "/dashboard/admin/attendance", label: "Attend" },
  { href: "/dashboard/admin/contact-inquiries", label: "Inquiries" },
];

export default function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {adminLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-all duration-300 ${
              active
                ? "border-[#f39b45] bg-gradient-to-r from-[#f39b45] to-[#d4803c] text-[#2a1608] shadow-lg shadow-[#f39b45]/25"
                : "border-white/10 bg-black/20 text-[#ffe7ce] hover:border-[#f39b45]/60 hover:bg-[#f39b45]/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
