import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  // Se l'utente è autenticato, redirect al dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Altrimenti redirect al login
  redirect("/auth");
}
