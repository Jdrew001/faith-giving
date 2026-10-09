// Playwright CLI evaluates this file as its function input.
// skipcq: JS-0128
async function featureFlagsSmoke(page) {
  const base = 'http://127.0.0.1:48179/give/';
  const donorA = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    firstname: 'Beta',
    lastname: 'Donor',
    email: 'beta@example.test',
    phone: '5555550100',
  };
  const donorB = {
    ...donorA,
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    firstname: 'Regular',
  };
  const state = {
    enabled: false,
    session: null,
    otpDonor: donorA,
    signals: [],
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
      return json(route, { success: true, data: [] });
    if (path.endsWith('/reference')) return json(route, []);
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
    window.Stripe = () => ({
      elements: () => ({
        create: () => ({
          mount: () => undefined,
          addEventListener: () => undefined,
        }),
      }),
    });
  });
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'OPTIONS') return json(route, {});
    if (url.pathname.endsWith('/assets/feature-flags.json')) {
      return json(
        route,
        state.enabled
          ? {
              enabled: true,
              firebase: {
                apiKey: 'smoke-only-key',
                projectId: 'faith-giving-smoke',
                appId: '1:123456789:web:smoke',
              },
            }
          : { enabled: false }
      );
    }
    if (url.pathname.includes('/api/')) return mockApi(route, url.pathname);
    if (url.hostname === 'firebaseinstallations.googleapis.com') {
      const body = route.request().postDataJSON();
      return json(route, {
        fid: body.fid,
        refreshToken: 'smoke-refresh',
        authToken: { token: 'smoke-token', expiresIn: '604800s' },
      });
    }
    if (url.hostname === 'firebaseremoteconfig.googleapis.com') {
      // Leave the simulated realtime connection open; all fetches are deterministic below.
      if (url.pathname.endsWith(':streamFetchInvalidations')) return undefined;
      const donor =
        route.request().postDataJSON().custom_signals?.user_id ?? null;
      state.signals.push(donor);
      return json(
        route,
        {
          entries: { beta_access: String(donor === donorA.id) },
          state: 'UPDATE',
          templateVersion: '1',
        },
        { ETag: `smoke-${state.signals.length}` }
      );
    }
    if (url.hostname === 'js.stripe.com')
      return route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: '',
      });
    if (url.origin === new URL(base).origin) return route.continue();
    return route.abort();
  });

  async function waitForSignal(expected) {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      if (
        state.signals[state.signals.length - 1] === expected &&
        state.signals.length > 0
      )
        return;
      await page.waitForTimeout(50);
    }
    throw new Error(
      `Expected latest donor signal ${expected}; received ${JSON.stringify(
        state.signals
      )}`
    );
  }
  async function signIn(donor) {
    state.otpDonor = donor;
    await page.getByLabel('Phone Number').fill(donor.phone);
    await page.getByRole('button', { name: 'Send Code' }).click();
    await page.getByLabel('Verification Code').fill('123456');
    await page.getByRole('button', { name: /^Verify\b/ }).click();
    await page
      .getByRole('heading', { name: `Welcome back, ${donor.firstname}!` })
      .waitFor();
    await waitForSignal(donor.id);
  }
  async function signOut() {
    await page.getByText('Not you? Sign out', { exact: true }).click();
    await page.getByRole('heading', { name: 'Sign in to give' }).waitFor();
    await waitForSignal(null);
  }

  await page.goto(`${base}give?guest=true`);
  await page.getByRole('heading', { name: 'Online Giving' }).waitFor();
  await page.getByText('Your Details', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  assert(
    state.sessionChecks === 0,
    'Explicit guest route unexpectedly restored a session'
  );
  assert(
    state.signals.length === 0,
    'Disabled configuration unexpectedly fetched Remote Config'
  );
  await page.getByRole('button', { name: 'Pay with Stripe' }).click();
  await page.getByRole('heading', { name: 'Online Giving' }).waitFor();
  assert(
    state.unexpected.length === 0,
    'Invalid guest submission requested a payment'
  );

  state.enabled = true;
  state.session = donorA;
  await page.goto(`${base}give`);
  await page.getByRole('heading', { name: 'Welcome back, Beta!' }).waitFor();
  await waitForSignal(donorA.id);
  assert(
    state.sessionChecks === 1,
    'Existing session restoration ownership changed'
  );
  assert(
    (await page.getByText('Your Details', { exact: true }).count()) === 0,
    'Authenticated donor saw guest details'
  );
  await page.locator('input[formcontrolname="tithe"]').fill('25');
  await page.getByRole('button', { name: 'Pay with Stripe' }).click();
  await page.getByText('Card Details', { exact: true }).waitFor();
  await page.screenshot({ path: 'output/playwright/authenticated-giving.png' });
  await signOut();

  await signIn(donorB);
  await signOut();
  await signIn(donorA);
  assert(
    state.unexpected.length === 0,
    `Unexpected API routes: ${JSON.stringify(state.unexpected)}`
  );
  assert(
    state.pageErrors.length === 0,
    `Browser runtime errors: ${JSON.stringify(state.pageErrors)}`
  );
  return {
    passed: [
      'disabled guest startup',
      'existing version dialog remains available',
      'guest route skips session restore',
      'invalid guest submission stays in giving',
      'authenticated session restoration',
      'existing card-details navigation',
      'logout clears Firebase donor signal',
      'OTP sign-in includes donor UUID',
      'account switching replaces donor signal',
    ],
    donorSignals: state.signals,
    liveRequests: 0,
  };
}
