import { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/rate-limiter";
import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server";

export async function middleware(req: NextRequest) {
  // get the relative path
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    const ip = req.ip ?? "127.0.0.1";

    try {
      const { success } = await rateLimiter.limit(ip);

      if (!success) {
        return new Response("You are prompting too fast.");
      }
    } catch (err) {
      return new Response(
        "Sorry, something went wrong while processing your message. Please try again later."
      );
    }
  }
}

export const config = {
  matcher: ["/api/message/:path*", "/dashboard/:path*", "/auth-callback"],
};

export default authMiddleware;
