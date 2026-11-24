import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'crypto';
import { queryOne } from './db';

function passwordsMatch(supplied: string, expected: string): boolean {
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Admin email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) {
          throw new Error('Invalid credentials');
        }

        const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const envPassword = process.env.ADMIN_PASSWORD;
        const envHash = process.env.ADMIN_PASSWORD_HASH;
        if (envEmail && email === envEmail) {
          if (envHash && (await bcrypt.compare(password, envHash))) {
            return { id: 'env-admin', email, name: 'Admin', role: 'admin' };
          }
          if (envPassword && passwordsMatch(password, envPassword)) {
            return { id: 'env-admin', email, name: 'Admin', role: 'admin' };
          }
        }

        if (process.env.DATABASE_URL) {
          try {
            const row = await queryOne<{
              id: string;
              email: string;
              password_hash: string;
              role: string;
            }>(
              'SELECT id, email, password_hash, role FROM admin_users WHERE LOWER(email) = $1',
              [email]
            );
            if (row && (await bcrypt.compare(password, row.password_hash))) {
              return { id: row.id, email: row.email, name: 'Admin', role: row.role || 'admin' };
            }
          } catch (error) {
            console.error('Admin lookup failed', error instanceof Error ? error.message : error);
          }
        }

        throw new Error('Invalid credentials');
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
