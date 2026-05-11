import Link from "next/link";

export default function UnauthorizedScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
            401
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="mt-2 text-gray-600">
            This page is protected. Please sign in with your account to
            continue.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-4">
          <Link
            href="/auth"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
