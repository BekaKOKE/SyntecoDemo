import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
}

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: {
        email: { not: ADMIN_EMAIL },
        role: { in: [UserRole.super_admin, UserRole.admin] },
      },
      data: {
        role: UserRole.customer_viewer,
        isActive: false,
      },
    });

    const admin = await tx.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        passwordHash,
        firstName: 'Bekzhan',
        lastName: 'Sauytbek',
        role: UserRole.super_admin,
        isActive: true,
        phone: '+77011234567',
        companyId: null,
      },
      create: {
        email: ADMIN_EMAIL,
        passwordHash,
        firstName: 'Bekzhan',
        lastName: 'Sauytbek',
        role: UserRole.super_admin,
        isActive: true,
        phone: '+77011234567',
      },
    });

    await tx.refreshToken.updateMany({
      where: { userId: admin.id },
      data: { isRevoked: true },
    });
  });

  const adminCount = await prisma.user.count({
    where: { role: { in: [UserRole.super_admin, UserRole.admin] }, isActive: true },
  });

  console.log(`Admin ready: ${ADMIN_EMAIL}`);
  console.log(`Active admin users: ${adminCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
