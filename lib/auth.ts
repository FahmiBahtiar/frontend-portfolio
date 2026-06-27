import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { mintInternalToken } from "@/lib/backend-auth";
import { API_BASE_URL } from "@/lib/config";

// Get backend URL (without /api prefix for direct backend calls)
const BACKEND_URL = API_BASE_URL;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is authorized
      if (!user.email) {
        return false;
      }

      try {
        const checkUrl = `${BACKEND_URL}/api/admin/auth/users/check/${encodeURIComponent(user.email)}`;
        const internalToken = await mintInternalToken();

        const response = await fetch(checkUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${internalToken}`,
          },
        });

        if (!response.ok) {
          console.error('❌ Authorization check failed:', response.status);
          return false;
        }

        const result = await response.json();

        if (result.success && result.data?.isAuthorized && result.data?.user) {
          return true;
        }

        return false;
      } catch (error) {
        console.error('❌ Authorization check error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user && user.email) {
        // Fetch user details from backend on first sign in
        try {
          const internalToken = await mintInternalToken();
          const response = await fetch(
            `${BACKEND_URL}/api/admin/auth/users/check/${encodeURIComponent(user.email)}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${internalToken}`,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();

            if (result.success && result.data?.user) {
              token.role = result.data.user.role;
              token.userId = result.data.user._id;
              token.email = user.email;
            }
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.userId = token.userId as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
});
