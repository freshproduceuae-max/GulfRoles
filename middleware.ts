import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // Allow /admin/login without authentication
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }
        // Allow access to other /admin routes only if user is authenticated
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
