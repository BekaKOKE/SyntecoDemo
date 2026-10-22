// Synteco — создание/обновление аккаунта менеджера.
//
// Роль `manager` видит ТОЛЬКО «Заявки» и «Заказы» в админке
// (см. apps/admin/src/lib/roles.ts → MANAGER_ALLOWED_SCREENS).
//
// БЕЗОПАСНОСТЬ: скрипт НИЧЕГО НЕ УДАЛЯЕТ. Он только upsert-ит один
// аккаунт по email. Заявки, заказы, другие пользователи, каталог —
// не затрагиваются вообще.
//
// Запуск (пароль передаётся через переменную окружения, в код не попадает):
//   MANAGER_EMAIL=manager@synteco.kz MANAGER_PASSWORD='Synteco1!' \
//     pnpm --filter @synteco/api exec tsx prisma/create-manager.ts

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = process.env.MANAGER_EMAIL ?? 'manager@synteco.kz';
const PASSWORD = process.env.MANAGER_PASSWORD;
const FIRST_NAME = process.env.MANAGER_FIRST_NAME ?? 'Жасмин';
const LAST_NAME = process.env.MANAGER_LAST_NAME ?? 'Толегенова';
const PHONE = process.env.MANAGER_PHONE ?? '+77024751703';

if (!PASSWORD) {
  throw new Error('MANAGER_PASSWORD is required (передайте через переменную окружения)');
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    // Если аккаунт уже есть — обновляем только пароль/роль/имя, ничего не удаляя.
    update: {
      passwordHash,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      role: UserRole.manager,
      isActive: true,
      phone: PHONE,
    },
    create: {
      email: EMAIL,
      passwordHash,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      role: UserRole.manager,
      isActive: true,
      phone: PHONE,
    },
  });

  console.log(`✓ Менеджер готов: ${user.email} (роль: ${user.role}, доступ: заявки + заказы)`);
}

main()
  .catch((error) => {
    console.error('Ошибка:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
