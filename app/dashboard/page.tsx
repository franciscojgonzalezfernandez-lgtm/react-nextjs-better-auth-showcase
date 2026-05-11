"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace("/auth");
  }, [isPending, session, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user.name || user.email}!
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
              <Link
                href="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Account
            </h3>
            <dl className="text-sm text-gray-600 space-y-1">
              <div>
                <dt className="inline font-medium text-gray-800">Email: </dt>
                <dd className="inline">{user.email}</dd>
              </div>
              {user.name && (
                <div>
                  <dt className="inline font-medium text-gray-800">Name: </dt>
                  <dd className="inline">{user.name}</dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium text-gray-800">Verified: </dt>
                <dd className="inline">{user.emailVerified ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Session
            </h3>
            <dl className="text-sm text-gray-600 space-y-1">
              <div>
                <dt className="inline font-medium text-gray-800">
                  Expires:{" "}
                </dt>
                <dd className="inline">
                  {new Date(session.session.expiresAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Settings
            </h3>
            <p className="text-gray-600 text-sm">
              Configure your preferences (boilerplate placeholder).
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Authentication Status
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Signed in via better-auth
            </p>
            <p className="text-sm text-green-700 mt-1">
              Session is backed by Postgres on Neon and protected by middleware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
