import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/priority/:path*",
    "/habits/:path*",
    "/goals/:path*",
    "/timelog/:path*",
    "/analytics/:path*",
    "/review/:path*",
    "/notes/:path*",
  ],
};
