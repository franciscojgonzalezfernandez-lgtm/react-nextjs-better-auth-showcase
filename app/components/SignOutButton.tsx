"use client";

import { signOutAction } from "@/app/dashboard-server/actions";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Sign Out
      </button>
    </form>
  );
}
