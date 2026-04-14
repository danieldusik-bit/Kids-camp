import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcryptModule from "bcryptjs";
import { prisma } from "./prisma";

// bcryptjs v3 is ESM — handle both default and named exports
const bcrypt = (bcryptModule as any).default || bcryptModule;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        console.log("[AUTH] Looking up user:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("[AUTH] User found:", !!user, user ? { id: user.id, isActive: user.isActive, role: user.role, hashLength: user.passwordHash?.length } : null);

        if (!user || !user.isActive) {
          console.log("[AUTH] User not found or inactive");
          return null;
        }

        console.log("[AUTH] bcrypt module keys:", Object.keys(bcrypt));
        console.log("[AUTH] bcrypt.compare type:", typeof bcrypt.compare);

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        console.log("[AUTH] Password valid:", isValid);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
