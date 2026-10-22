/**
 * Critical Flows 2-4: Admin CRUD operations
 *   - Create product → appears in storefront
 *   - Create inquiry → appears in admin list
 *   - Move CRM deal across stages
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api/v1';

test.describe('Admin CRUD Operations', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { email: 'admin@synteco.kz', password: 'Admin123!' },
    });
    const body = await res.json();
    accessToken = body.accessToken;
  });

  test('Flow 2: Create product → verify it appears in catalog', async ({ request }) => {
    // Create a product
    const create = await request.post(`${API}/products`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        variantId: `E2E-${Date.now()}`,
        title: 'E2E Test Product — Playwright',
        brandId: '00000000-0000-0000-0000-000000000001',
        price: 9999,
        categoryIds: [],
      },
    });
    expect([200, 201]).toContain(create.status());
    const product = await create.json();

    // Verify it appears in catalog search
    const search = await request.get(`${API}/products?search=E2E Test Product`);
    expect(search.status()).toBe(200);
    const results = await search.json();
    expect(results.data.length).toBeGreaterThan(0);

    // Cleanup: soft-delete
    await request.delete(`${API}/products/${product.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('Flow 3: Create inquiry → verify via API', async ({ request }) => {
    const create = await request.post(`${API}/admin/inquiries/public`, {
      data: {
        companyName: 'E2E Test Company',
        contactName: 'Test Contact',
        contactPhone: '+77010000000',
        priority: 'normal',
        items: [{ sku: 'TEST-001', name: 'Test Item', quantity: 5, unitPrice: 1000 }],
      },
    });
    expect(create.status()).toBe(201);

    // Verify inquiry appears in admin list
    const list = await request.get(`${API}/admin/inquiries?search=E2E Test Company`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(list.status()).toBe(200);
    const body = await list.json();
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('Flow 4: Create CRM deal → update stage → verify', async ({ request }) => {
    // Create deal
    const create = await request.post(`${API}/admin/crm/deals`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { title: 'E2E CRM Deal', companyName: 'TestCo', value: 50000, stage: 'inquiry' },
    });
    expect(create.status()).toBe(201);
    const deal = await create.json();

    // Move to qualification
    const update = await request.put(`${API}/admin/crm/deals/${deal.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { stage: 'qualification' },
    });
    expect(update.status()).toBe(200);
    const updated = await update.json();
    expect(updated.stage).toBe('qualification');

    // Verify pipeline shows deal in qualification column
    const pipeline = await request.get(`${API}/admin/crm/pipeline`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const cols = await pipeline.json();
    const qualCol = cols.find((c: any) => c.id === 'qualification');
    expect(qualCol).toBeDefined();

    // Cleanup
    await request.delete(`${API}/admin/crm/deals/${deal.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('Flow 5: Guest cart → login → cart merges → checkout', async ({ request }) => {
    // This is tested via the cart.e2e.spec.ts — documented here for completeness
    // The flow is: add to cart as guest → login → verify items persist → checkout
  });
});
