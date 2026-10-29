import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const inventory = await prisma.inventoryItem.findMany({
    orderBy: { updatedAt: "desc" },
    include: { product: { select: { id: true, name: true, category: true } } }
  });
  return NextResponse.json(inventory);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("productId" in body) || !("currentStock" in body) ||
      !("minimumStock" in body) || !("unit" in body) || typeof body.productId !== "string" ||
      typeof body.currentStock !== "number" || typeof body.minimumStock !== "number" || typeof body.unit !== "string") {
    return NextResponse.json({ message: "Completa los datos del inventario correctamente." }, { status: 400 });
  }
  if (body.currentStock < 0 || body.minimumStock < 0 || body.unit.trim().length === 0) {
    return NextResponse.json({ message: "Las cantidades y unidad deben ser válidas." }, { status: 400 });
  }
  const item = await prisma.inventoryItem.upsert({
    where: { productId: body.productId },
    update: { currentStock: body.currentStock, minimumStock: body.minimumStock, unit: body.unit.trim() },
    create: { productId: body.productId, currentStock: body.currentStock, minimumStock: body.minimumStock, unit: body.unit.trim() },
    include: { product: { select: { id: true, name: true, category: true } } }
  });
  return NextResponse.json(item);
}
