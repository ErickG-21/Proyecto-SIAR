import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("currentStock" in body) || typeof body.currentStock !== "number" || body.currentStock < 0) {
    return NextResponse.json({ message: "Cantidad de inventario inválida." }, { status: 400 });
  }
  const item = await prisma.inventoryItem.update({
    where: { id: params.id },
    data: { currentStock: body.currentStock },
    include: { product: { select: { id: true, name: true, category: true } } }
  });
  return NextResponse.json(item);
}
