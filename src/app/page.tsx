import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  // Se l'utente è autenticato, redirect al dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Altrimenti redirect al login
  redirect("/login");
}
