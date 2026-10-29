const { PrismaClient, UserRole } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@siar.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Andrea García";

  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: await hash(password, 12), role: UserRole.ADMIN, active: true },
    create: { name, email, passwordHash: await hash(password, 12), role: UserRole.ADMIN }
  });

  console.log(`Usuario administrador listo: ${email}`);
}

main()
  .catch((error) => {
    console.error("No se pudo crear el usuario administrador.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
