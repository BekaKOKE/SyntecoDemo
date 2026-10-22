-- Фиксация согласия на обработку персональных данных (Закон РК № 94-V).
--
-- БЕЗОПАСНОСТЬ МИГРАЦИИ: только добавление необязательных колонок.
-- Существующие строки не изменяются, ничего не удаляется и не переименовывается.
-- Откат: ALTER TABLE customer.users DROP COLUMN ... (данные при этом теряются,
-- поэтому перед откатом снимите бэкап).

ALTER TABLE customer.users
  ADD COLUMN IF NOT EXISTS consent_at        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS consent_version   VARCHAR(32),
  ADD COLUMN IF NOT EXISTS consent_ip        VARCHAR(64),
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN customer.users.consent_at IS
  'Дата и время получения согласия на обработку персональных данных';
COMMENT ON COLUMN customer.users.consent_version IS
  'Редакция политики конфиденциальности, с которой согласился пользователь';
COMMENT ON COLUMN customer.users.consent_ip IS
  'IP-адрес, с которого дано согласие — доказательство факта';
COMMENT ON COLUMN customer.users.marketing_consent IS
  'Отдельное согласие на маркетинговые рассылки. По умолчанию false: '
  'объединять его с согласием на обработку данных закон не позволяет';
