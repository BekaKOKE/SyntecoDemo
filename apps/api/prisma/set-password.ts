// Synteco — смена пароля ОДНОМУ пользователю по email.
//
// БЕЗОПАСНОСТЬ: скрипт НИЧЕГО НЕ УДАЛЯЕТ и не трогает другие аккаунты.
// Он меняет ТОЛЬКО пароль указанного email (и опционально отзывает его
// активные сессии). Роль, имя, заявки, заказы, каталог — без изменений.
//
// В отличие от set-admin.ts, этот скрипт НЕ отключает других админов.
//
// Запуск (пароль передаётся через переменную окружения, в код не попадает):
//   TARGET_EMAIL=admin@synteco.kz NEW_PASSWORD='новый_пароль' \
//     pnpm --filter @synteco/api exec tsx prisma/set-password.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = process.env.TARGET_EMAIL;
const PASSWORD = process.env.NEW_PASSWORD;
// Отозвать активные refresh-токены (выйти из всех сессий)? По умолчанию — да.
const REVOKE = (process.env.REVOKE_SESSIONS ?? 'true') !== 'false';

if (!EMAIL || !PASSWORD) {
  throw new Error('TARGET_EMAIL и NEW_PASSWORD обязательны (передайте через переменные окружения)');
}

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!existing) {
    throw new Error(`Пользователь ${EMAIL} не найден — пароль не менялся, ничего не создано.`);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.update({
    where: { email: EMAIL },
    data: { passwordHash },
  });

  if (REVOKE) {
    const res = await prisma.refreshToken.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });
    console.log(`  отозвано активных сессий: ${res.count}`);
  }

  console.log(`✓ Пароль обновлён для ${user.email} (роль: ${user.role}, без изменений). Другие аккаунты не тронуты.`);
}

main()
  .catch((error) => {
    console.error('Ошибка:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
