import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { Badge } from "lucide-react";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.json({ message: "Logged out.", redirectTo: "/admin" });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/", sameSite: "strict" });
  return response;
}
