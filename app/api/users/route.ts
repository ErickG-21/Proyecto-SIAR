import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    !("name" in body) ||
    !("email" in body) ||
    !("password" in body) ||
    !("role" in body) ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    (body.role !== "ADMIN" && body.role !== "WAITER")
  ) {
    return NextResponse.json({ message: "Completa todos los campos correctamente." }, { status: 400 });
  }

  if (body.name.trim().length < 2 || body.password.length < 6) {
    return NextResponse.json(
      { message: "El nombre debe tener al menos 2 caracteres y la contraseña 6." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        passwordHash: await hash(body.password, 12),
        role: body.role
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ message: "Ya existe un usuario con ese correo." }, { status: 409 });
    }
    throw error;
  }
}
