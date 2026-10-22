/**
 * Critical Flow 1: Browse → Search → Product Detail → Add to Cart → Checkout → Order
 *
 * This test verifies the complete storefront purchase flow end-to-end.
 * Run: npx playwright test --config=playwright.config.ts
 *
 * Prerequisites:
 *   - API running on :3000
 *   - Database seeded with products and a test user
 *   - `npx playwright install chromium`
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api/v1';
const WEB = 'http://localhost:3001';

test.describe('Checkout Flow — Browse to Order', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    // Login as test buyer
    const res = await request.post(`${API}/auth/login`, {
      data: { email: 'admin@synteco.kz', password: 'Admin123!' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    accessToken = body.accessToken;
  });

  test('should complete full checkout flow', async ({ page, request }) => {
    // Step 1: Browse catalog
    await page.goto(`${WEB}/products`);
    await expect(page.locator('h1')).toContainText('Каталог');

    // Step 2: Search for a product
    await page.fill('input[placeholder*="Поиск"]', 'bosch');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('.card')).not.toHaveCount(0);

    // Step 3: Click first product → product detail page
    await page.locator('.card a').first().click();
    await expect(page.locator('text=Количество')).toBeVisible();

    // Step 4: Add to cart
    await page.click('button:has-text("В корзину")');
    await page.waitForTimeout(500);

    // Step 5: Navigate to cart
    await page.click('a[href="/cart"]');
    await expect(page.locator('h1')).toContainText('Корзина');

    // Step 6: Proceed to checkout
    await page.click('text=Оформить заказ');
    await page.waitForURL('**/checkout');

    // Step 7: Place order
    await page.click('button:has-text("Подтвердить заказ")');
    await page.waitForTimeout(1000);

    // Step 8: Verify — should be on orders page or confirmation
    const url = page.url();
    expect(url.includes('order') || url.includes('account')).toBeTruthy();
  });
});
