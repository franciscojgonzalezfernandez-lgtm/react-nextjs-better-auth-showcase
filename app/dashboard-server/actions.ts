"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function getSessionAction() {
  return auth.api.getSession({ headers: await headers() });
}

export async function revokeOtherSessionsAction() {
  await auth.api.revokeOtherSessions({ headers: await headers() });
  revalidatePath("/dashboard-server");
}

export async function updateUserAction(formData: FormData) {
  const raw = formData.get("name");
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return;

  await auth.api.updateUser({
    headers: await headers(),
    body: { name },
  });
  revalidatePath("/dashboard-server");
}
