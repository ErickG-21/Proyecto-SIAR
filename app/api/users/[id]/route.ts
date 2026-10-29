import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type RouteContext = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteContext) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || !("active" in body) || typeof body.active !== "boolean") {
    return NextResponse.json({ message: "Estado de usuario inválido." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { active: body.active },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
  });

  return NextResponse.json(user);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  await prisma.user.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
