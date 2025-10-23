"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * ConditionalLayout - Mostra Navbar e Footer solo per pagine pubbliche
 *
 * La dashboard ha il suo layout dedicato con sidebar, quindi escludiamo
 * Navbar e Footer quando siamo sotto /dashboard/*
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    // Dashboard: nessuna navbar/footer (gestiti dal dashboard layout)
    return <>{children}</>;
  }

  // Pagine pubbliche: con navbar e footer
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-[80vh]">{children}</main>
      <Footer />
    </>
  );
}
