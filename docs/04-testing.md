# D. Testing Documentation — Synteco Demo

## 1. Test strategy

| Level | Tool | Scope | Command | Needs DB? |
|---|---|---|---|---|
| **Unit** | Jest + ts-jest | Services and pattern classes with mocked `PrismaClient` | `pnpm --filter @synteco/api test` | No |
| **E2E (API)** | Jest + Supertest | Full NestJS `AppModule` over HTTP against the demo PostgreSQL | `pnpm --filter @synteco/api test:e2e` | Yes (`docker compose up -d` + `pnpm db:demo`) |
| **Manual UI** | Browser (Chrome) | Storefront and admin panel walkthrough | see §6 | Yes |

Test files live next to the code they test (`*.spec.ts` for unit tests, `*.e2e.spec.ts` for E2E tests). New tests written for this project:

| File | Tests | Covers |
|---|---|---|
| `apps/api/src/modules/orders/orders.service.spec.ts` | 13 | Main order workflows (TC-01 … TC-13) |
| `apps/api/src/modules/promotions/strategies/discount-strategies.spec.ts` | 16 | **Strategy**: each strategy, registry, adding a new strategy |
| `apps/api/src/modules/promotions/promotions.service.spec.ts` | 11 | **Strategy** client: validation, runtime switch, new strategy without code change |
| `apps/api/src/modules/payments/adapters/payment-adapters.spec.ts` | 13 | **Adapter**: format translation, response mapping, polymorphic use |
| `apps/api/src/modules/payments/payments.service.spec.ts` | 5 | Payment recording, auto-confirmation, error cases |
| `apps/api/src/modules/orders/order-cost/order-cost.decorators.spec.ts` | 11 | **Decorator** (order services): wrapping, stacking, new decorator |
| `apps/api/src/modules/notifications/notifiers.spec.ts` | 4 | **Decorator** (notification channels) |
| `apps/api/src/modules/orders/checkout-patterns.e2e.spec.ts` | 6 | Whole checkout through HTTP with all three patterns |

The original Synteco test suites (auth, cart, inventory, pricing, products, search, CRM, inquiries…) still pass and are included in the totals.

## 2. Main functionality test cases

Unit tests in `orders.service.spec.ts` (IDs match the comments in the file):

| ID | Requirement | Scenario / input | Expected result | Result |
|---|---|---|---|---|
| TC-01 | FR-06, FR-07, FR-09 | Quote for cart of 50 000 ₸ with promo `safety10` + `express_delivery` | discount 5 000, services 7 500, VAT 6 300, total 58 800, lines goods/discount/express/vat | ✅ Pass |
| TC-02 | FR-10, FR-11, FR-19 | Create order with promo, certificates service, Kaspi payment | order row with full breakdown; 2 stock reservations; promo `usedCount+1`; cart cleared; payment charged; notifications `order_created`, `payment_succeeded` | ✅ Pass |
| TC-03 | FR-10 | Create order with an empty cart | `CART_EMPTY` (400) | ✅ Pass |
| TC-04 | FR-10 | Helmet: requested 2, available 1 | `INVENTORY_INSUFFICIENT_STOCK` (400), no transaction started | ✅ Pass |
| TC-05 | FR-13 | `paymentMethod: "bitcoin"` | `PAYMENT_METHOD_UNSUPPORTED`, stock not touched | ✅ Pass |
| TC-06 | FR-08 | `promoCode: "WRONG"` | `PROMO_INVALID` (422), no order created | ✅ Pass |
| TC-07 | FR-12 | Kaspi declines the payment | order created, `lastPayment.status = failed`, notifications `order_created`, `payment_failed` | ✅ Pass |
| TC-08 | FR-16 | Admin moves `pending → shipped`; then `confirmed → processing` | first `ORDER_INVALID_TRANSITION`; second succeeds and notifies the customer | ✅ Pass |
| TC-09 | FR-16 | Customer tries to change status | `AUTH_INSUFFICIENT_ROLE` (403) | ✅ Pass |
| TC-10 | FR-18 | Customer cancels someone else's order | `AUTH_INSUFFICIENT_ROLE` (403) | ✅ Pass |
| TC-11 | FR-18, FR-16 | Customer/admin cancel a shipped order | customer → `ORDER_CANNOT_CANCEL`; admin → `ORDER_INVALID_TRANSITION` | ✅ Pass |
| TC-12 | FR-17 | Cancel a paid confirmed order | status `cancelled`, payment status `refunded`, refund payment row, stock released | ✅ Pass |
| TC-13 | FR-12 | Retry payment for another customer's order | `AUTH_INSUFFICIENT_ROLE`, gateway not called | ✅ Pass |

## 3. Design-pattern tests

### 3.1 Strategy (`discount-strategies.spec.ts`, `promotions.service.spec.ts`)

| ID | What is verified | Result |
|---|---|---|
| ST-01 | `PercentageDiscountStrategy`: 10% of 30 000 = 3 000; cap `maxDiscount` 5 000 respected; invalid percent rejected | ✅ |
| ST-02 | `FixedAmountDiscountStrategy`: −5 000; never more than subtotal; amount ≤ 0 rejected | ✅ |
| ST-03 | `VolumeTierDiscountStrategy`: only lines reaching a tier get a discount; highest tier chosen; tier config validated | ✅ |
| ST-04 | `BuyXGetYFreeStrategy`: buy 3 get 1 on 12 pcs → 3 free; non-integer config rejected | ✅ |
| ST-05 | **Runtime selection**: the registry resolves `percentage` / `fixed_amount` by type string | ✅ |
| ST-06 | **Runtime selection by data**: promo `BUY3GET1` → `buy_x_get_y` algorithm is used | ✅ |
| ST-07 | **Runtime switch**: `PATCH` changes promotion strategy `percentage → fixed_amount`; the next evaluation returns 3 000 instead of 2 000 | ✅ |
| ST-08 | **Open/closed**: a new `PerLineDiscountStrategy` (defined only in the test) is registered and used. No existing class changed. | ✅ |
| ST-09 | **Open/closed**: a new `seasonal_double` strategy is used by the *unchanged* `PromotionsService.evaluate()` | ✅ |
| ST-10 | Unknown strategy type → `DISCOUNT_STRATEGY_UNKNOWN` | ✅ |
| ST-11 | Promo validation: not found, inactive, expired, not started, usage limit, below min amount, duplicate code (create and rename) | ✅ |

### 3.2 Adapter (`payment-adapters.spec.ts`, `payments.service.spec.ts`)

| ID | What is verified | Result |
|---|---|---|
| AD-01 | `KaspiPayAdapter` sends exactly `{MerchantId, Phone: "7011234567", Amount: 1250050 (tiyn), Comment, ExternalId}` to the **unmodified** `KaspiPayClient` (spy) | ✅ |
| AD-02 | Kaspi `Approved` → `paid`; `Rejected/InsufficientFunds` → `failed` "недостаточно средств"; `StatusCode 503` → `failed` "недоступен" | ✅ |
| AD-03 | Kaspi phone normalisation and validation (`+7 (701) …`, `8701…`, fallback to profile phone, malformed → `PAYMENT_DETAILS_INVALID`) | ✅ |
| AD-04 | `HalykCardAdapter` wraps the **callback** API into a Promise; card mapped to `{pan, exp_month, exp_year, holder}`, amount `"1250050"`, currency `398` | ✅ |
| AD-05 | ISO codes mapped: `51` insufficient funds, `14` invalid number (Luhn), `54` expired card | ✅ |
| AD-06 | Vendor exception → rejected promise; `PaymentsService` turns it into a *failed* payment instead of a crash | ✅ |
| AD-07 | **All four gateways used polymorphically** through `PaymentGateway` → `paid, paid, pending, pending` | ✅ |
| AD-08 | `PaymentsService`: paid → `payments` row + order `paid` + auto-`confirmed` + history; failed → no status change; already paid → 409; cancelled → error | ✅ |

### 3.3 Decorator (`order-cost.decorators.spec.ts`, `notifiers.spec.ts`)

| ID | What is verified | Result |
|---|---|---|
| DE-01 | `BaseOrderCost` = goods − discount, itemised lines | ✅ |
| DE-02 | Each of the 4 decorators wraps an `OrderCost` and adds its charge (express +7 500, certificates +2 500, insurance +1.5%, installation +5% / min 15 000) | ✅ |
| DE-03 | **Combination**: insurance over express over base = 98 963; lines in wrapping order | ✅ |
| DE-04 | Same decorator twice (double express) works | ✅ |
| DE-05 | All four combined = 228 150 (installation minimum fee applied) | ✅ |
| DE-06 | `buildOrderCost` is order-independent and ignores duplicates; unknown service → `ORDER_SERVICE_UNKNOWN` | ✅ |
| DE-07 | **Extension without modification**: a new `GiftWrapDecorator` (defined in the test) wraps existing decorators | ✅ |
| DE-08 | Notification chain `Sms(Email(Realtime(InApp)))` delivers to all channels and stores `["sms","email","websocket","in_app"]` | ✅ |
| DE-09 | A channel without an address (no phone) is skipped while others still work | ✅ |
| DE-10 | `NotificationsService.notify` never throws (DB failure → `[]`) | ✅ |

## 4. Invalid input and error handling examples

All errors are returned as RFC 7807 Problem Details, for example:

```json
{
  "type": "https://api.synteco.kz/errors/PROMO_INVALID",
  "title": "Promo Invalid",
  "status": 422,
  "detail": "Срок действия промокода истёк",
  "instance": "/api/v1/orders/quote",
  "errorCode": "PROMO_INVALID",
  "requestId": "9b5ef583-…",
  "timestamp": "2026-10-22T16:51:26.514Z"
}
```

| # | Request | Response | Where tested |
|---|---|---|---|
| E-1 | `POST /orders/quote {"promoCode":"EXPIRED2025"}` | 422 `PROMO_INVALID` "Срок действия промокода истёк" | E2E, UI (screenshot 03) |
| E-2 | `POST /orders/quote {"services":["teleport"]}` | 400 `ORDER_SERVICE_UNKNOWN` "Неизвестные услуги: teleport" | E2E, unit DE-06 |
| E-3 | `POST /orders {"paymentMethod":"halyk_card","paymentDetails":{"cardNumber":"1234"}}` | 400 `PAYMENT_DETAILS_INVALID` "Проверьте данные карты: номер карты — 16 цифр, срок действия в формате ММ/ГГ, CVC — 3 цифры, имя держателя карты" | E2E, unit AD-04 |
| E-4 | `POST /orders` with an empty cart | 400 `CART_EMPTY` | unit TC-03 |
| E-5 | `POST /orders` requesting more than the stock | 400 `INVENTORY_INSUFFICIENT_STOCK` with item list | unit TC-04 |
| E-6 | `POST /orders/:id/pay` on a paid order | 409 `ORDER_ALREADY_PAID` | E2E, unit AD-08 |
| E-7 | Customer `POST /orders/:id/cancel` for a shipped order | 400 `ORDER_CANNOT_CANCEL` | unit TC-11 |
| E-8 | `POST /orders/:id/transition {"status":"shipped"}` from `pending` | 400 `ORDER_INVALID_TRANSITION` "Allowed transitions: confirmed, cancelled" | unit TC-08 |
| E-9 | `POST /promotions {"strategy":"percentage","value":0,…}` | 400 `VALIDATION_ERROR` "Процент должен быть в диапазоне (0; 100]" | unit ST-11 |
| E-10 | `POST /auth/register` without consent | 400 `VALIDATION_ERROR` "Для регистрации необходимо согласие…" | E2E (auth) |
| E-11 | `POST /cart/items {"quantity":0}` | 400 `VALIDATION_ERROR` (`@Min(1)`) | DTO validation |
| E-12 | Any protected endpoint without a token | 401 `AUTH_TOKEN_INVALID` | E2E (auth) |

**Payment declines.** These are not errors: the order is created and the payment is recorded as *failed*. The customer can retry, and the UI shows the reason.

- Kaspi phone `…0000` → "Kaspi Pay отклонил платёж: недостаточно средств"
- Card `4000 0000 0000 0002` → "Банк отклонил платёж: недостаточно средств на карте"

## 5. Results of the test run

Run on 2026-10-22, Windows 10, Node 24.15, PostgreSQL 16 (Docker). Full logs: [`docs/test-results/unit-tests.txt`](test-results/unit-tests.txt) and [`docs/test-results/e2e-tests.txt`](test-results/e2e-tests.txt).

```
pnpm --filter @synteco/api test
Test Suites: 19 passed, 19 total
Tests:       262 passed, 262 total

pnpm --filter @synteco/api test:e2e
Test Suites: 6 passed, 6 total
Tests:       64 passed, 64 total
```

| Group | Tests | Passed | Failed |
|---|---|---|---|
| Main order workflows (TC-01…13) | 13 | 13 | 0 |
| Strategy pattern | 27 | 27 | 0 |
| Adapter pattern | 18 | 18 | 0 |
| Decorator pattern | 15 | 15 | 0 |
| Checkout E2E with all patterns | 6 | 6 | 0 |
| Original Synteco suites (unit + E2E) | 247 | 247 | 0 |
| **Total** | **326** | **326** | **0** |

Two original E2E expectations were outdated relative to the current code and were corrected. Registration now requires personal-data consent, and `/auth/refresh` with an empty body returns 401 (no token) instead of 400.

## 6. Manual UI test (storefront + admin)

Performed in Chrome at 1366×900. Screenshots are in `docs/screenshots/`.

| Step | Action | Expected | Result |
|---|---|---|---|
| M-1 | Open `/login?redirect=/checkout`, log in as `customer@synteco.kz` | Redirect back to checkout | ✅ |
| M-2 | Product page → ×10 → “Добавить в заказ” (01-product.png) | Price 11 247 ₸ shown; cart badge 10 | ✅ |
| M-3 | Cart (02-cart.png) | Line total 112 470 ₸, “Оформить заказ” | ✅ |
| M-4 | Promo `EXPIRED2025` (03-promo-expired.png) | Inline error “Срок действия промокода истёк”, total unchanged | ✅ |
| M-5 | Promo `SAFETY10` + express delivery + insurance (04-checkout.png) | −11 247; +7 500; +1 631; VAT 13 242; total 123 596 ₸ | ✅ |
| M-6 | Pay by card 4400 4300 0000 0007 (05-order-paid.png) | “Заказ оформлен и оплачен”, transaction HALYK-… | ✅ |
| M-7 | “Мои заказы” (06-my-orders.png) | Status *Подтверждён*, payment *Оплачен*, breakdown, history, payments | ✅ |
| M-8 | “Уведомления” (07-notifications.png) | New notifications with channels sms · email · push · in-app | ✅ |
| M-9 | Admin → Промокоды (08, 09) | Table of 5 codes with strategy; edit form shows strategy-specific fields | ✅ |
| M-10 | Admin → Заказы → order → “Собирается” (10-admin-order.png) | Status changes to *processing*; customer is notified | ✅ |
