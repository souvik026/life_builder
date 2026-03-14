import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

export const metadata: Metadata = {
  title: "Aesthetic Life Tracker — 90 Days",
  description: "A calming, green-themed space to track habits, boost productivity, and embrace daily self-care",
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
