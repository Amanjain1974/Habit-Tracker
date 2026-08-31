export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/tasks",
    "/priority",
    "/habits",
    "/goals",
    "/timelog",
    "/analytics",
    "/review",
    "/notes"
  ]
};
