import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "imitsankit@gmail.com";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || "the-shreyash-files-super-secret-operative-key-2006",
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // Automatically logs out operative after 7 days (604800s)
    updateAge: 24 * 60 * 60, // Refresh session token if active within 24 hours
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        const isMasterAdmin =
          session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        (session.user as any).role = isMasterAdmin ? "admin" : "operative";
        (session.user as any).isAdmin = isMasterAdmin;
        (session.user as any).clearance = isMasterAdmin
          ? "DIRECTORATE // MASTER KEY"
          : "FIELD OPERATIVE // LEVEL 2";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role =
          user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
            ? "admin"
            : "operative";
      }
      return token;
    },
  },
  pages: {
    signIn: "/home",
  },
};
