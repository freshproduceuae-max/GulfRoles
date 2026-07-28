import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Hardcoded admin user for MVP
// In production, this should be fetched from a database
const ADMIN_USER = {
  id: '1',
  email: 'admin@jobbrowser.app',
  password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.EjjUbHKxcfgxjzhEqTNB.1Wd8M.bNVm', // 'password' hashed with bcrypt
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@jobbrowser.app' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Find user (in MVP, we check against hardcoded user)
        if (credentials.email !== ADMIN_USER.email) {
          throw new Error('Invalid credentials');
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          ADMIN_USER.password
        );

        if (!passwordMatch) {
          throw new Error('Invalid credentials');
        }

        return {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          name: 'Admin User',
          role: 'admin',
        };
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
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
