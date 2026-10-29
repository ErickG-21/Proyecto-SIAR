import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const statuses = ["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("status" in body) || typeof body.status !== "string" || !statuses.includes(body.status as typeof statuses[number])) {
    return NextResponse.json({ message: "Estado de pedido inválido." }, { status: 400 });
  }
  const order = await prisma.order.update({ where: { id: params.id }, data: { status: body.status as typeof statuses[number] } });
  return NextResponse.json(order);
}
