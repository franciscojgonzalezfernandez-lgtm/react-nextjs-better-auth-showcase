import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-300/40">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              Better-Auth demo
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive authentication demo showcasing various login methods
            including email/password, GitHub, and Google authentication.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md shadow-brand-600/20 transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-brand-50 text-gray-800 font-semibold py-3 px-8 rounded-lg border border-brand-100 transition-colors duration-200"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-100">
            <h3 className="text-xl font-semibold mb-3 text-black">
              Email & Password
            </h3>
            <p className="text-gray-600">
              Traditional authentication with email and password validation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-100">
            <h3 className="text-xl font-semibold mb-3 text-black">
              GitHub OAuth
            </h3>
            <p className="text-gray-600">
              Sign in with your GitHub account for quick and secure access.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-brand-100">
            <h3 className="text-xl font-semibold mb-3 text-black">
              Google OAuth
            </h3>
            <p className="text-gray-600">
              One-click authentication using your Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
