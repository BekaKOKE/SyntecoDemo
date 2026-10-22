'use client';

import { StaticPage } from '@/components/layouts/StaticPage';
import Link from 'next/link';

const SIDEBAR = [
  { label: 'Возврат и обмен', href: '/returns' },
  { label: 'Доставка', href: '/delivery' },
  { label: 'Оплата', href: '/help#payment' },
  { label: 'Гарантия', href: '/help#warranty' },
  { label: 'Помощь', href: '/help' },
  { label: 'Контакты', href: '/contacts' },
];

export default function ReturnsPage() {
  return (
    <StaticPage title="Возврат и обмен" subtitle="30 дней на возврат. Простая процедура. Быстрый возврат средств." sidebar={SIDEBAR} sidebarTitle="Покупателям">
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em' }}>Условия возврата</h2>
      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, lineHeight: 1.6 }}>
          <li>• Возврат возможен в течение <strong>30 календарных дней</strong> с даты получения заказа.</li>
          <li>• Товар должен быть в оригинальной упаковке, без следов использования и механических повреждений.</li>
          <li>• Сохраните все ярлыки, бирки, пломбы и сопроводительные документы.</li>
          <li>• Для возврата необходим <strong>номер заказа</strong> и документ, удостоверяющий личность (для самовывоза).</li>
          <li>• Возврат денежных средств — в течение <strong>10 рабочих дней</strong> после получения и проверки товара.</li>
        </ul>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em' }}>Процесс возврата — 5 шагов</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {[
          ['01', 'Свяжитесь с менеджером', 'Позвоните по телефону +7 702 475 17 03 или напишите в WhatsApp. Назовите номер заказа и причину возврата. Менеджер согласует способ возврата.'],
          ['02', 'Заполните заявление', 'Мы отправим вам форму заявления на возврат. Заполните и приложите фото товара (при необходимости).'],
          ['03', 'Отправьте товар', 'Согласуйте способ возврата с менеджером: самовывоз из Атырау или отправка транспортной компанией.'],
          ['04', 'Проверка качества', 'Склад проверяет товар: целостность упаковки, отсутствие следов использования, комплектность.'],
          ['05', 'Возврат средств', 'После успешной проверки мы возвращаем деньги. Срок возврата зависит от способа оплаты и банка.'],
        ].map(([n, t, d]) => (
          <div key={n} className="card" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-ink)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>{n}</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.55, margin: 0 }}>{d}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.02em' }}>Товары, не подлежащие возврату</h2>
      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--color-ink-2)' }}>
          <li>• Товары, изготовленные по индивидуальному заказу (нестандартные размеры, спецспецификации).</li>
          <li>• Продукция с истекшим сроком годности на момент возврата.</li>
          <li>• Средства индивидуальной защиты (СИЗ) после вскрытия упаковки (гигиенические требования).</li>
          <li>• Программное обеспечение и электронные ключи активации.</li>
          <li>• Химические реактивы и расходные материалы после вскрытия.</li>
          <li>• Товары, утратившие товарный вид по вине покупателя.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 32, background: 'var(--color-surface-2)', textAlign: 'center' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Остались вопросы по возврату?</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>Менеджер поможет оформить возврат и ответит на вопросы.</p>
        <Link href="/contacts" className="btn btn-primary btn-lg">Связаться с менеджером</Link>
      </div>
    </StaticPage>
  );
}
