import { useAuthStore } from "@/stores/useAuthStore";
import NextAuth, { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import GoogleProvider from "next-auth/providers/google";

import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/services/authService";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, user, account, profile }) {
      const googleIdToken = account?.id_token; // Lấy id_token từ account nếu đăng nhập bằng google

      if (trigger === "signIn" && account?.provider != "credentials") {
        const { accessToken, refreshToken } = await authService.signInGoogle(
          googleIdToken!,
        );

        if (accessToken && refreshToken) {
          const cookieStore = await cookies();

          cookieStore.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
          });

          cookieStore.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            path: "/",
            maxAge: 14 * 24 * 60 * 60, // 14 days
          });
        }
      }

      return token;
    },
    async session({ session }) {
      return session;
    },
  },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
