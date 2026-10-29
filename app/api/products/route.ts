import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const categories = ["FOOD", "DRINK", "DESSERT"] as const;

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("name" in body) || !("price" in body) || !("category" in body) ||
      typeof body.name !== "string" || typeof body.price !== "number" || !categories.includes(body.category as typeof categories[number])) {
    return NextResponse.json({ message: "Completa los datos del producto correctamente." }, { status: 400 });
  }
  if (body.name.trim().length < 2 || body.price <= 0) {
    return NextResponse.json({ message: "El nombre y el precio deben ser válidos." }, { status: 400 });
  }
  const description = "description" in body && typeof body.description === "string" ? body.description.trim() : null;
  const category = body.category as typeof categories[number];
  const product = await prisma.product.create({
    data: { name: body.name.trim(), description, price: body.price, category }
  });
  return NextResponse.json(product, { status: 201 });
}
