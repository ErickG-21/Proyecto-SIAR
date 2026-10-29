import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (
    !body ||
    typeof body !== "object" ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active || !(await compare(body.password, user.passwordHash))) {
    return NextResponse.json(
      { message: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}
