"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileTabBar from "@/components/MobileTabBar";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
      <DashboardProvider>
        <div className="flex min-h-dvh flex-col bg-[#160d08] text-[#f7ede2]">
          <SiteHeader />
          <main className="flex-1 pb-20 md:pb-24">{children}</main>
          <SiteFooter />
          <MobileTabBar />
        </div>
      </DashboardProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
