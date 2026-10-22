'use client';

import { useState } from 'react';
import { StaticPage } from '@/components/layouts/StaticPage';
import Link from 'next/link';
import { Icons } from '@/lib/icons';

const FAQ = [
  {
    cat: 'Заказы',
    items: [
      ['Как оформить заказ?', 'Найдите нужный товар через каталог или поиск, добавьте в корзину и нажмите «Оформить заявку». Менеджер свяжется с вами для уточнения наличия, цены и сроков доставки.'],
      ['Как узнать статус заказа?', 'Статус заказа доступен в личном кабинете в разделе «Мои заказы». Также вы можете уточнить статус у менеджера по телефону.'],
      ['Можно ли изменить заказ после оформления?', 'Да, если заказ ещё не передан на сборку. Свяжитесь с менеджером по телефону +7 702 475 17 03.'],
      ['Какие документы я получу с заказом?', 'Счёт, накладная и сертификаты соответствия при наличии. Для юрлиц — полный пакет закрывающих документов.'],
    ],
  },
  {
    cat: 'Оплата',
    items: [
      ['Какие способы оплаты доступны?', 'Банковский перевод по счёту — основной способ для юрлиц. Уточните другие варианты у менеджера.'],
      ['Работаете ли вы с НДС?', 'Да. Цены на сайте указаны с НДС 12%. Вы получаете полный комплект документов.'],
      ['Выставляете ли вы счёт?', 'Да, счёт и коммерческое предложение выставляются после запроса.'],
    ],
  },
  {
    cat: 'Доставка',
    items: [
      ['Как доставляется заказ?', 'Самовывоз со склада в Атырау или доставка курьерскими службами по Казахстану.'],
      ['Как узнать стоимость доставки?', 'Стоимость и сроки зависят от региона, габаритов и службы доставки. Рассчитывается менеджером при подтверждении заказа.'],
      ['Можно ли забрать заказ самостоятельно?', 'Да, самовывоз доступен со склада в Атырау. Адрес — на странице «Контакты».'],
    ],
  },
  {
    cat: 'Гарантия и возврат',
    items: [
      ['Какая гарантия на товары?', 'Гарантия зависит от производителя и категории товара. Условия указываются при оформлении заказа.'],
      ['Как оформить возврат?', 'Позвоните менеджеру +7 702 475 17 03 или напишите в WhatsApp. Подробная процедура — на странице «Возврат и обмен».'],
      ['Что делать если товар пришёл повреждённым?', 'Сфотографируйте упаковку и товар до вскрытия, свяжитесь с нами как можно скорее. Разберёмся и заменим товар или вернём деньги.'],
    ],
  },
  {
    cat: 'Личный кабинет',
    items: [
      ['Как зарегистрироваться?', 'Нажмите «Регистрация» в верхнем меню и заполните форму. Для B2B-аккаунта менеджер уточнит данные компании.'],
      ['Я забыл пароль. Что делать?', 'Свяжитесь с менеджером — поможем восстановить доступ.'],
      ['Как добавить сотрудников в аккаунт компании?', 'Эта возможность в разработке. Пока для каждого сотрудника можно создать отдельный аккаунт.'],
    ],
  },
  {
    cat: 'Сертификаты и документы',
    items: [
      ['Предоставляете ли вы сертификаты соответствия?', 'Да, сертификаты и декларации соответствия предоставляются по запросу для товаров, на которые они распространяются.'],
      ['Можно ли получить техническую документацию?', 'Да: паспорт изделия, руководство по эксплуатации и другая документация предоставляются по запросу.'],
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState<string | null>(null);

  const filtered = search.trim()
    ? FAQ.flatMap(c => c.items).filter(([q, a]) => q!.toLowerCase().includes(search.toLowerCase()) || a!.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <StaticPage title="Помощь и FAQ" subtitle="Ответы на частые вопросы о заказах, доставке, оплате и возврате." compact>
      <div className="card" style={{ padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, maxWidth: 600 }}>
        <Icons.search width={18} height={18} />
        <input
          placeholder="Поиск по вопросам…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 15, height: 44, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
        />
        {search && <span className="muted" style={{ fontSize: 12, paddingRight: 12 }}>{filtered.length} результатов</span>}
      </div>

      {search ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ marginBottom: 12, color: 'var(--color-ink-4)' }}><Icons.inbox width={40} height={40} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Ничего не найдено</h3>
              <p className="muted" style={{ fontSize: 14 }}>
                Попробуйте другой запрос или <Link href="/contacts" style={{ color: 'var(--color-accent)' }}>свяжитесь с нами</Link>.
              </p>
            </div>
          )}
          {filtered.map(([q, a]) => (
            <details key={q} className="card" style={{ padding: 0 }}>
              <summary style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                {q}
                <span style={{ fontSize: 18, color: 'var(--color-ink-4)' }}>+</span>
              </summary>
              <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.6 }}>{a}</div>
            </details>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FAQ.map(cat => (
            <div key={cat.cat}>
              <button
                onClick={() => setOpenCat(openCat === cat.cat ? null : cat.cat)}
                style={{
                  width: '100%', border: 0, background: 'var(--color-surface-2)', padding: '16px 20px',
                  borderRadius: 12, cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', fontSize: 18, fontWeight: 600,
                }}
              >
                {cat.cat}
                <span style={{ color: 'var(--color-ink-4)', transition: 'transform .2s', transform: openCat === cat.cat ? 'rotate(45deg)' : '' }}>+</span>
              </button>
              {openCat === cat.cat && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                  {cat.items.map(([q, a]) => (
                    <details key={q} className="card" style={{ padding: 0 }}>
                      <summary style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                        {q}
                        <span style={{ fontSize: 16, color: 'var(--color-ink-4)' }}>+</span>
                      </summary>
                      <div style={{ padding: '0 20px 14px', fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.6 }}>{a}</div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </StaticPage>
  );
}
