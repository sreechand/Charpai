import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let creates = 0, verifies = 0;
  await page.route('**/api/create-order', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { amount: 100, currency: 'INR', testMode: true } });
    creates++;
    return route.fulfill({ json: { order_id: 'order_browser_test', amount: 100, currency: 'INR', key_id: 'rzp_test_mock' } });
  });
  await page.route('**/api/verify-payment', route => {
    verifies++;
    assert.deepEqual(route.request().postDataJSON(), { razorpay_order_id: 'order_browser_test', razorpay_payment_id: 'pay_browser_test', razorpay_signature: 'mock-signature' });
    return route.fulfill(verifies === 1 ? { status: 400, json: { error: 'Payment is not captured yet. Wait a moment and retry verification.' } } : { json: { success: true, order_id: 'order_browser_test' } });
  });
  await page.addInitScript(() => {
    window.Razorpay = class {
      constructor(options) { window.mockCheckoutOptions = options; }
      on(_event, handler) { window.mockPaymentFailed = handler; }
      open() { window.mockCheckoutOpened = (window.mockCheckoutOpened || 0) + 1; }
    };
  });
  await page.goto(process.env.PAYMENT_TEST_URL || 'http://localhost:3000/app');
  await page.getByRole('button', { name: 'Create an email account' }).click();
  await page.getByLabel('Email', { exact: true }).fill(`payment-browser-${randomUUID()}@example.invalid`);
  await page.getByLabel('Password', { exact: true }).fill(randomUUID() + randomUUID());
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  const pay = page.getByRole('button', { name: 'Pay ₹1.00', exact: true });
  await pay.waitFor();
  await pay.click();
  await page.waitForFunction(() => window.mockCheckoutOpened === 1);
  assert.equal(creates, 1);
  await page.evaluate(() => window.mockCheckoutOptions.modal.ondismiss());
  await page.getByText('Checkout closed. You can retry when ready.').waitFor();
  await pay.click();
  await page.waitForFunction(() => window.mockCheckoutOpened === 2);
  assert.equal(creates, 1, 'cancel/retry reuses existing order');
  await page.evaluate(() => window.mockPaymentFailed({ error: { description: 'Synthetic payment failed' } }));
  await page.getByText('Synthetic payment failed').waitFor();
  await page.evaluate(() => window.mockCheckoutOptions.handler({ razorpay_order_id: 'order_browser_test', razorpay_payment_id: 'pay_browser_test', razorpay_signature: 'mock-signature' }));
  await page.getByRole('button', { name: 'Retry payment verification' }).waitFor();
  await page.getByRole('button', { name: 'Retry payment verification' }).click();
  await page.getByText('Payment verified. Your payment has been saved.').waitFor();
  assert.equal(creates, 1, 'verification retry must not charge again');
  assert.equal(verifies, 2);
  assert.deepEqual(errors, []);
  await page.screenshot({ path: '/tmp/charpai-payment-checkout.png', fullPage: true });
  console.log('PASS: signed-in mobile checkout, cancellation, failed payment, verification failure and retry without a new order. Razorpay responses mocked; no payment made.');
} finally { await browser.close(); }
