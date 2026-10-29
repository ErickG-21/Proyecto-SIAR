import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const statuses = ["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { waiter: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } }
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("waiterId" in body) || !("items" in body) ||
      typeof body.waiterId !== "string" || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ message: "Agrega al menos un producto al pedido." }, { status: 400 });
  }

  const items = body.items.filter((item): item is { productId: string; quantity: number } =>
    typeof item === "object" && item !== null && "productId" in item && "quantity" in item &&
    typeof item.productId === "string" && typeof item.quantity === "number" && item.quantity > 0
  );
  if (items.length !== body.items.length) {
    return NextResponse.json({ message: "El detalle del pedido no es válido." }, { status: 400 });
  }

  const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) }, available: true } });
  if (products.length !== new Set(items.map((item) => item.productId)).size) {
    return NextResponse.json({ message: "Uno o más productos no están disponibles." }, { status: 400 });
  }
  const total = items.reduce((sum, item) => {
    const product = products.find((current) => current.id === item.productId);
    return sum + Number(product?.price ?? 0) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      waiterId: body.waiterId,
      tableNumber: "tableNumber" in body && typeof body.tableNumber === "number" ? body.tableNumber : null,
      customer: "customer" in body && typeof body.customer === "string" ? body.customer.trim() : null,
      total,
      items: { create: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: products.find((product) => product.id === item.productId)!.price })) }
    },
    include: { items: { include: { product: true } } }
  });
  return NextResponse.json(order, { status: 201 });
}
