import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("available" in body) || typeof body.available !== "boolean") {
    return NextResponse.json({ message: "Disponibilidad inválida." }, { status: 400 });
  }
  const product = await prisma.product.update({ where: { id: params.id }, data: { available: body.available } });
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
