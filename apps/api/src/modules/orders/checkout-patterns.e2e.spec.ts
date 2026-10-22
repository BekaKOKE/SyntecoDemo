import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

/**
 * Full checkout through HTTP against the demo database:
 * Strategy (promo code) + Decorator (services) + Adapter (payment) + notifications.
 * Requires: docker compose up -d && pnpm db:demo
 */
describe('Checkout with design patterns (E2E)', () => {
  let app: INestApplication;
  let http: any;
  let auth: { Authorization: string };
  let productId: string;

  const PAID_CARD = { cardNumber: '4400 4300 0000 0007', cardExpiry: '12/30', cardCvc: '123', cardHolder: 'Ivan Ivanov' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    await app.init();
    http = app.getHttpServer();

    const login = await request(http).post('/api/v1/auth/login')
      .send({ email: 'customer@synteco.kz', password: 'Customer123!' });
    auth = { Authorization: `Bearer ${login.body.accessToken}` };

    const products = await request(http).get('/api/v1/products').query({ limit: 5 });
    productId = products.body.data.find((p: any) => Number(p.price) > 0)?.id ?? products.body.data[0].id;

    await request(http).delete('/api/v1/cart').set(auth);
    await request(http).post('/api/v1/cart/items').set(auth).send({ productId, quantity: 12 });
  });

  afterAll(async () => {
    await request(http).delete('/api/v1/cart').set(auth);
    await app.close();
  });

  it('lists payment methods and optional services (public)', async () => {
    const methods = await request(http).get('/api/v1/payments/methods').expect(200);
    expect(methods.body.map((m: any) => m.method)).toEqual(['kaspi', 'halyk_card', 'bank_invoice', 'cash_on_delivery']);

    const services = await request(http).get('/api/v1/orders/services').expect(200);
    expect(services.body).toHaveLength(4);
  });

  it('quote: switching the promo code switches the discount strategy', async () => {
    const codes = ['SAFETY10', 'MINUS5000', 'OPT2026', 'BUY3GET1'];
    const quotes = await Promise.all(codes.map(promoCode =>
      request(http).post('/api/v1/orders/quote').set(auth).send({ promoCode }).expect(200)));

    expect(quotes.map(q => q.body.discountStrategy)).toEqual(['percentage', 'fixed_amount', 'volume_tier', 'buy_x_get_y']);
    quotes.forEach(q => expect(q.body.discount).toBeGreaterThan(0));
  });

  it('quote: services are stacked on top of the discounted cost', async () => {
    const plain = await request(http).post('/api/v1/orders/quote').set(auth).send({}).expect(200);
    const decorated = await request(http).post('/api/v1/orders/quote').set(auth)
      .send({ services: ['express_delivery', 'certificates'] }).expect(200);

    expect(decorated.body.servicesTotal).toBe(7500 + 2500);
    expect(decorated.body.total).toBeGreaterThan(plain.body.total);
    expect(decorated.body.lines.map((l: any) => l.code)).toEqual(['goods', 'express_delivery', 'certificates', 'vat']);
  });

  it('rejects an expired promo, an unknown service and bad card data', async () => {
    const expired = await request(http).post('/api/v1/orders/quote').set(auth).send({ promoCode: 'EXPIRED2025' }).expect(422);
    expect(expired.body.errorCode).toBe('PROMO_INVALID');

    await request(http).post('/api/v1/orders/quote').set(auth).send({ services: ['teleport'] }).expect(400);

    const badCard = await request(http).post('/api/v1/orders').set(auth)
      .send({ paymentMethod: 'halyk_card', paymentDetails: { cardNumber: '1234' } }).expect(400);
    expect(badCard.body.errorCode).toBe('PAYMENT_DETAILS_INVALID');
  });

  it('declined Kaspi payment → retry by card → order paid and auto-confirmed → notifications', async () => {
    const created = await request(http).post('/api/v1/orders').set(auth).send({
      promoCode: 'SAFETY10',
      services: ['cargo_insurance'],
      paymentMethod: 'kaspi',
      paymentDetails: { phone: '+7 701 555 0000' }, // simulated "insufficient funds"
    }).expect(201);

    expect(created.body).toMatchObject({ status: 'pending', paymentStatus: 'failed', promoCode: 'SAFETY10', discountStrategy: 'percentage' });
    expect(created.body.lastPayment.status).toBe('failed');

    const paid = await request(http).post(`/api/v1/orders/${created.body.orderNumber}/pay`).set(auth)
      .send({ paymentMethod: 'halyk_card', paymentDetails: PAID_CARD }).expect(200);

    expect(paid.body).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
    expect(paid.body.payments.map((p: any) => p.status)).toEqual(['paid', 'failed']);

    await request(http).post(`/api/v1/orders/${created.body.orderNumber}/pay`).set(auth)
      .send({ paymentMethod: 'bank_invoice' }).expect(409);

    const inbox = await request(http).get('/api/v1/notifications').set(auth).expect(200);
    const types = inbox.body.data.filter((n: any) => n.orderId === created.body.id).map((n: any) => n.type);
    expect(types).toEqual(expect.arrayContaining(['order_created', 'payment_failed', 'payment_succeeded']));

    // Cart was emptied by the order — refill it for the remaining tests.
    await request(http).post('/api/v1/cart/items').set(auth).send({ productId, quantity: 12 });
  });

  it('cancelling a paid order refunds it', async () => {
    const created = await request(http).post('/api/v1/orders').set(auth)
      .send({ paymentMethod: 'halyk_card', paymentDetails: PAID_CARD }).expect(201);
    expect(created.body.paymentStatus).toBe('paid');

    const cancelled = await request(http).post(`/api/v1/orders/${created.body.id}/cancel`).set(auth)
      .send({ reason: 'E2E: передумал' }).expect(200);
    expect(cancelled.body).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
  });
});
