import { NextResponse } from "next/server";
import { getItems } from "@/lib/items-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ items: getItems() }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
