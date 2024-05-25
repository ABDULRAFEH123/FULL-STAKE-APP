// export { default } from "next-auth/middleware";

// export const config = {matcher :["/home"]};
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const middleware = async (req) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   console.log(token, "User token");

  // If the request path is for the admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // If no token or the user is not an admin, redirect to login
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Allow access to the admin route
    return NextResponse.next();
  }

  // If the request path is for the home route
  if (req.nextUrl.pathname === '/home') {
    // If token is found, allow access
    if (token) {
      return NextResponse.next();
    }
    // If token is not found, redirect to the login page
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Default behavior: proceed with the request
  return NextResponse.next();
};

export default withAuth(middleware, {
  callbacks: {
    // Authorization callback to check if the user is authorized
    authorized: ({ token }) => !!token,
  },
});

// Configuration object to specify which routes the middleware should apply to
export const config = {
  matcher: ["/home", "/admin"],
};

