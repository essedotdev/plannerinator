"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

/**
 * ConditionalLayout - Mostra Navbar solo per pagine pubbliche
 *
 * La dashboard ha il suo layout dedicato con sidebar, quindi escludiamo
 * Navbar quando siamo sotto /dashboard/*
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    // Dashboard: nessuna navbar (gestita dal dashboard layout)
    return <>{children}</>;
  }

  // Pagine pubbliche: con navbar
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
