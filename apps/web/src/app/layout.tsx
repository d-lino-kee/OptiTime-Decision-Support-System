import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "OptiTime",
  description: "AI-powered time management decision support system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[288px_1fr]">
          <Sidebar />
          <main className="flex flex-col gap-4">{children}</main>
        </div>
      </body>
    </html>
  );
}