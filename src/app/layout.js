import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Barista Training Bangladesh",
    template: "%s | Barista Training Bangladesh",
  },
  description:
    "Master coffee craft, latte art, and cafe entrepreneurship at Barista Training Bangladesh. Professional barista training, espresso courses, and coffee certification in Dhaka.",
  keywords: ["barista training", "coffee course", "latte art", "Bangladesh", "Dhaka", "espresso", "coffee academy", "barista certification"],
  authors: [{ name: "Barista Training Bangladesh" }],
  openGraph: {
    title: "Barista Training Bangladesh",
    description: "Master coffee craft, latte art, and cafe entrepreneurship at Barista Training Bangladesh.",
    url: "https://baristatrainingbangladesh.com",
    siteName: "Barista Training Bangladesh",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barista Training Bangladesh",
    description: "Master coffee craft, latte art, and cafe entrepreneurship.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/btb-logo.png",
    shortcut: "/btb-logo.png",
    apple: "/btb-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full">
        <div className="grain-overlay" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
