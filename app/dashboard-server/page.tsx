import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/app/components/SignOutButton";
import { revokeOtherSessionsAction, updateUserAction } from "./actions";

export default async function DashboardServer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth");

  const { user, session: sessionData } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard (Server)
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user.name || user.email}!
              </p>
            </div>
            <div className="flex space-x-4">
              <SignOutButton />
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
                  {new Date(sessionData.expiresAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Other sessions
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Revoke every session except the one you are using right now.
            </p>
            <form action={revokeOtherSessionsAction}>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors duration-200"
              >
                Revoke other sessions
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Update profile
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Submitted through a Server Action — the page re-renders on the
            server via <code className="font-mono text-xs">revalidatePath</code>.
          </p>
          <form action={updateUserAction} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="name"
              defaultValue={user.name ?? ""}
              placeholder="Your name"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Save name
            </button>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Authentication Status
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Session resolved server-side (RSC)
            </p>
            <p className="text-sm text-green-700 mt-1">
              Loaded with{" "}
              <code className="font-mono text-xs">
                auth.api.getSession(&#123; headers &#125;)
              </code>{" "}
              — no client hooks, no loading flash. Mutations run through Server
              Actions in{" "}
              <code className="font-mono text-xs">actions.ts</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
