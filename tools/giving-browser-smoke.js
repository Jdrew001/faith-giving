// Playwright CLI evaluates this file as its function input.
// skipcq: JS-0128
async function givingSmoke(page) {
  page.setDefaultTimeout(20000);
  const base = 'http://127.0.0.1:48179/give/';
  const donorA = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    firstname: 'Alex',
    lastname: 'Donor',
    email: 'alex@example.test',
    phone: '5555550100',
  };
  const donorB = {
    ...donorA,
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    firstname: 'Jordan',
  };
  const state = {
    session: null,
    otpDonor: donorA,
    flagRequests: [],
    sessionChecks: 0,
    unexpected: [],
    pageErrors: [],
  };
  page.on('pageerror', (error) => state.pageErrors.push(error.message));

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }
  function json(route, body, headers = {}) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': new URL(base).origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Expose-Headers': 'ETag',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Content-Encoding, If-None-Match, x-goog-api-key',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }
  function mockApi(route, path) {
    if (path.endsWith('/individualBySession')) {
      state.sessionChecks++;
      return json(route, { success: true, data: state.session });
    }
    if (path.endsWith('/requestOtp'))
      return json(route, { success: true, found: true });
    if (path.endsWith('/verifyOtp')) {
      state.session = state.otpDonor;
      return json(route, { success: true, data: state.session });
    }
    if (path.endsWith('/signOut')) {
      state.session = null;
      return json(route, { success: true });
    }
    if (path.endsWith('/paymentMethods'))
      return json(route, {
        success: true,
        data:
          state.session?.id === donorA.id
            ? [
                {
                  id: 'smoke-card',
                  paymentMethodId: 'pm_smoke_saved',
                  brand: 'visa',
                  last4: '4242',
                  expMonth: 12,
                  expYear: 2028,
                },
              ]
            : [],
      });
    if (path.endsWith('/submitPayment')) {
      return new Promise((resolve) => setTimeout(resolve, 1500)).then(() =>
        json(route, { success: true })
      );
    }
    if (path.endsWith('/reference'))
      return json(route, [
        { id: 1, label: 'General Offering' },
        { id: 7, label: 'Other' },
      ]);
    if (path.endsWith('/calculateTotal')) {
      const body = route.request().postDataJSON();
      return json(route, {
        success: true,
        data:
          body.tithe +
          body.offerings.reduce((sum, offering) => sum + offering.amount, 0),
      });
    }
    state.unexpected.push(path);
    return route.abort();
  }
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'faith-giving:whats-new:last-seen-version',
      'smoke'
    );
    window.Stripe = () => ({
      elements: () => ({
        create: () => ({
          mount: () => undefined,
          addEventListener: (event, listener) => {
            if (event === 'ready') setTimeout(() => listener({}), 0);
          },
        }),
      }),
    });
  });
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/assets/version.json'))
      return json(route, { version: 'smoke' });
    if (route.request().method() === 'OPTIONS') return json(route, {});
    if (
      url.pathname.endsWith('/assets/feature-flags.json') ||
      url.hostname.includes('firebase')
    ) {
      state.flagRequests.push(url.href);
      return route.abort();
    }
    if (url.pathname.includes('/api/')) return mockApi(route, url.pathname);
    if (url.hostname === 'js.stripe.com')
      return route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: '',
      });
    if (url.origin === new URL(base).origin) return route.continue();
    return route.abort();
  });

  async function signIn(donor) {
    state.otpDonor = donor;
    await page.getByLabel('Phone Number').fill(donor.phone);
    await page.getByRole('button', { name: 'Send Code' }).click();
    await page.getByLabel('Verification Code').fill('123456');
    await page.getByRole('button', { name: /^Verify\b/ }).click();
    await page
      .getByRole('heading', { name: `Welcome back, ${donor.firstname}!` })
      .waitFor();
  }
  async function signOut() {
    const headerAction = page.getByRole('button', {
      name: 'Sign out',
      exact: true,
    });
    if (await headerAction.isVisible()) await headerAction.click();
    else await page.getByText('Not you? Sign out', { exact: true }).click();
    await page.getByRole('heading', { name: 'Sign in to give' }).waitFor();
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${base}give?guest=true`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Online Giving' }).waitFor();
  await page.getByText('Your Details', { exact: true }).waitFor();
  assert(
    state.sessionChecks === 0,
    'Explicit guest route unexpectedly restored a session'
  );
  assert(
    state.flagRequests.length === 0,
    'Giving unexpectedly requested feature flag configuration'
  );
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await page.getByRole('heading', { name: 'Online Giving' }).waitFor();
  assert(
    state.unexpected.length === 0,
    'Invalid guest submission requested a payment'
  );

  await page.screenshot({
    path: 'output/playwright/primary-guest-startup.png',
    fullPage: true,
  });
  assert(
    (await page.locator('html.faith-giving-redesign').count()) === 1,
    'Guest startup did not use the primary theme'
  );
  state.session = donorA;
  await page.goto(`${base}give`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Welcome back, Alex!' }).waitFor();
  assert(
    state.sessionChecks === 1,
    'Existing session restoration ownership changed'
  );
  assert(
    (await page.getByText('Your Details', { exact: true }).count()) === 0,
    'Authenticated donor saw guest details'
  );
  await page.locator('html.faith-giving-redesign').waitFor();
  await page.locator('input[formcontrolname="tithe"]').fill('25.00');
  await page.getByText('$25.00', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await page.getByRole('radio', { name: 'visa ending in 4242' }).waitFor();
  await page.screenshot({
    path: 'output/playwright/primary-saved-card-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Add new payment method' }).click();
  await page
    .getByRole('heading', { name: 'Card Details', exact: true })
    .waitFor();
  assert(
    (await page.locator('#billing-zip').count()) === 1,
    'Redesigned card fields are missing'
  );
  await page.screenshot({
    path: 'output/playwright/primary-card-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Back to payment methods' }).click();
  await page.getByRole('radio', { name: 'visa ending in 4242' }).check();
  await page.getByRole('button', { name: 'Give $25.00', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Processing your gift...' })
    .waitFor();
  await page.screenshot({
    path: 'output/playwright/primary-processing-desktop.png',
    fullPage: true,
  });
  await page
    .getByRole('heading', { name: 'Thank you for your generosity!' })
    .waitFor();
  await page.screenshot({
    path: 'output/playwright/primary-receipt-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await signOut();

  assert(
    (await page.locator('html.faith-giving-redesign').count()) === 1,
    'Logout lost the primary theme'
  );
  await signIn(donorB);
  assert(
    (await page.locator('.step-badge').count()) === 1,
    'Second donor did not use the primary giving UI'
  );
  await page.screenshot({
    path: 'output/playwright/second-donor-desktop.png',
    fullPage: true,
  });
  await signOut();
  await signIn(donorA);
  await page.locator('html.faith-giving-redesign').waitFor();
  await page.screenshot({
    path: 'output/playwright/primary-returning-desktop.png',
    fullPage: true,
  });

  state.session = null;
  await page.goto(base + 'give?guest=true', { waitUntil: 'domcontentloaded' });
  await page.locator('html.faith-giving-redesign').waitFor();
  await page.getByLabel('First Name', { exact: true }).fill('Alex');
  await page.getByLabel('Last Name', { exact: true }).fill('Taylor');
  await page
    .getByLabel('Email address', { exact: true })
    .fill('alex@example.test');
  await page.getByLabel('Phone Number', { exact: true }).fill('5555550100');
  await page.getByLabel('Tithing', { exact: true }).fill('100.00');
  await page.getByRole('button', { name: 'Add offering' }).click();
  await page.locator('.p-dropdown').click();
  // The reference fixture below supplies the app's real category shape.
  await page.getByRole('option', { name: 'General Offering' }).click();
  await page.getByLabel('Offering 1 amount', { exact: true }).fill('25.00');
  await page.getByText('$125.00', { exact: true }).waitFor();
  await page.screenshot({
    path: 'output/playwright/primary-guest-desktop.png',
    fullPage: true,
  });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      ),
      'Giving overflow at ' + width
    );
    await page.screenshot({
      path: 'output/playwright/primary-guest-' + width + '.png',
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await page
    .getByRole('heading', { name: 'Card Details', exact: true })
    .waitFor();
  await page.screenshot({
    path: 'output/playwright/primary-card-mobile.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  assert(
    state.unexpected.length === 0,
    `Unexpected API routes: ${JSON.stringify(state.unexpected)}`
  );
  assert(
    state.pageErrors.length === 0,
    `Browser runtime errors: ${JSON.stringify(state.pageErrors)}`
  );
  assert(
    state.flagRequests.length === 0,
    'Retired feature flags were requested'
  );
  assert(
    await page.evaluate(
      () =>
        document.querySelector('meta[name="theme-color"]').content ===
          '#0b0b0b' &&
        getComputedStyle(document.body).backgroundColor === 'rgb(11, 11, 11)' &&
        getComputedStyle(document.body).fontFamily.includes('Poppins')
    ),
    'Primary colors, font or browser theme color are missing'
  );
  return {
    passed: [
      'primary theme at guest startup without Firebase',
      'guest route skips session restore',
      'invalid guest submission stays in giving',
      'authenticated session restoration',
      'primary card-details navigation',
      'mock saved-card processing and receipt',
      'primary theme persists after logout and account switching',
      'responsive primary guest flow at 320, 390, 768, 1280 pixels',
      'OTP sign-in and account switching',
      'no feature flag configuration or Firebase requests',
    ],
    flagRequests: state.flagRequests,
    liveRequests: 0,
  };
}
