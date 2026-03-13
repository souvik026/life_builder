import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

export const metadata: Metadata = {
  title: "Habit Tracker — 90 Day Challenge",
  description: "Personal 90-day habit tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
