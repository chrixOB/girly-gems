import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { removeItem, updateItem, type StoreItem } from "@/lib/items-store";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authorized = verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!authorized) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid item ID." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const updates: Partial<Omit<StoreItem, "id">> = {};

  if (typeof body?.name === "string") updates.name = body.name.trim();
  if (["Necklaces", "Earrings", "Rings", "Bracelets"].includes(body?.category)) updates.category = body.category;
  if (body?.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return NextResponse.json({ message: "Price must be a positive number." }, { status: 400 });
    updates.price = price;
  }
  if (typeof body?.image === "string") updates.image = body.image.trim();

  if (updates.name === "") return NextResponse.json({ message: "Name cannot be empty." }, { status: 400 });

  const item = updateItem(id, updates);
  if (!item) return NextResponse.json({ message: "Item not found." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authorized = verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!authorized) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid item ID." }, { status: 400 });

  if (!removeItem(id)) return NextResponse.json({ message: "Item not found." }, { status: 404 });
  return NextResponse.json({ message: "Item removed." });
}
