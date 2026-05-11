import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import resend from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your email in Better Auth Demo",
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    disableSessionRefresh: true,
  },
});
