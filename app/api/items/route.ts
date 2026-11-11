import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { addItem, getItems, isValidProductImages, type StoreItem } from "@/lib/items-store";
import { persistProductImages } from "@/lib/product-images";

export const runtime = "nodejs";

function requireAdmin(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ items: getItems() });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = body?.category;
  const price = Number(body?.price);
  const image = typeof body?.image === "string" ? body.image.trim() : "";
  if (body?.images !== undefined && !isValidProductImages(body.images)) {
    return NextResponse.json({ message: "Choose up to 3 valid images (JPEG, PNG, or WebP)." }, { status: 400 });
  }
  const images = Array.isArray(body?.images) ? body.images : image ? [image] : [];
  const validCategories = ["Necklaces", "Earrings", "Rings", "Bracelets"];

  if (!name || !validCategories.includes(category) || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ message: "Name, category, and a valid price are required." }, { status: 400 });
  }

  const storedImages = await persistProductImages(images);
  const item = addItem({ name, category: category as StoreItem["category"], price, image: storedImages[0] || "", images: storedImages });
  return NextResponse.json({ item }, { status: 201 });
}
