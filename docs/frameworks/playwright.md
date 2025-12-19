# Playwright Integration Guide

Complete guide for using QAagentic with Playwright.

---

## Installation

```bash
npm install @qagentic/reporter --save-dev
```

**Requirements:**
- Node.js 16+
- Playwright 1.40+

---

## Setup

### Configure Reporter

Update your `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';
import { qagenticReporter } from '@qagentic/reporter/playwright';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['list'],
    qagenticReporter({
      projectName: 'my-playwright-project',
      environment: process.env.CI ? 'ci' : 'local',
      apiUrl: process.env.QAGENTIC_API_URL,
      apiKey: process.env.QAGENTIC_API_KEY,
      outputDir: './qagentic-results',
    }),
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

## Usage Examples

### Basic Test with Steps

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { step } from '@qagentic/reporter/playwright';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await step('Enter email address', async () => {
      await page.fill('[data-testid="email-input"]', 'user@example.com');
    });

    await step('Enter password', async () => {
      await page.fill('[data-testid="password-input"]', 'SecurePassword123');
    });

    await step('Click login button', async () => {
      await page.click('[data-testid="login-button"]');
    });

    await step('Verify successful login', async () => {
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="welcome-message"]'))
        .toBeVisible();
    });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await step('Enter invalid credentials', async () => {
      await page.fill('[data-testid="email-input"]', 'wrong@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
    });

    await step('Submit login form', async () => {
      await page.click('[data-testid="login-button"]');
    });

    await step('Verify error message', async () => {
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Invalid credentials');
    });
  });
});
```

### E-commerce Flow Example

```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { step, attachJson, attachScreenshot } from '@qagentic/reporter/playwright';

test.describe('E-commerce Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login helper
    await page.fill('#email', 'customer@example.com');
    await page.fill('#password', 'password');
    await page.click('#login');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should complete purchase successfully', async ({ page }) => {
    await step('Search for product', async () => {
      await page.fill('[data-testid="search-input"]', 'iPhone 15');
      await page.press('[data-testid="search-input"]', 'Enter');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    await step('Select product from results', async () => {
      await page.click('[data-testid="product-card"]:first-child');
      await expect(page).toHaveURL(/.*product/);
    });

    await step('Add product to cart', async () => {
      await page.click('[data-testid="add-to-cart"]');
      await expect(page.locator('[data-testid="cart-count"]'))
        .toContainText('1');
    });

    await step('Proceed to checkout', async () => {
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-button"]');
      await expect(page).toHaveURL(/.*checkout/);
    });

    await step('Fill shipping information', async () => {
      await page.fill('[data-testid="shipping-address"]', '123 Main St');
      await page.fill('[data-testid="shipping-city"]', 'New York');
      await page.fill('[data-testid="shipping-zip"]', '10001');
      await page.selectOption('[data-testid="shipping-method"]', 'standard');
    });

    await step('Enter payment details', async () => {
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvv"]', '123');
    });

    await step('Complete purchase', async () => {
      await page.click('[data-testid="place-order"]');
    });

    await step('Verify order confirmation', async () => {
      await expect(page).toHaveURL(/.*order-confirmation/);
      
      const orderNumber = await page
        .locator('[data-testid="order-number"]')
        .textContent();
      
      attachJson({
        orderNumber,
        timestamp: new Date().toISOString()
      }, 'Order Details');
      
      await expect(page.locator('[data-testid="order-number"]'))
        .toBeVisible();
    });
  });
});
```

### API Testing

```typescript
// tests/api.spec.ts
import { test, expect } from '@playwright/test';
import { step, attachJson } from '@qagentic/reporter/playwright';

test.describe('API Tests', () => {
  test('should create and retrieve user', async ({ request }) => {
    let userId: string;

    await step('Create new user via API', async () => {
      const response = await request.post('/api/users', {
        data: {
          name: 'Test User',
          email: 'test@example.com'
        }
      });
      
      expect(response.status()).toBe(201);
      const body = await response.json();
      userId = body.id;
      
      attachJson(body, 'Create User Response');
    });

    await step('Retrieve created user', async () => {
      const response = await request.get(`/api/users/${userId}`);
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.name).toBe('Test User');
      
      attachJson(body, 'Get User Response');
    });

    await step('Delete test user', async () => {
      const response = await request.delete(`/api/users/${userId}`);
      expect(response.status()).toBe(204);
    });
  });
});
```

### Using Page Object Model

```typescript
// tests/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async verifyLoginSuccess() {
    await expect(this.page).toHaveURL(/.*dashboard/);
    await expect(this.welcomeMessage).toBeVisible();
  }

  async verifyLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// tests/login-pom.spec.ts
import { test } from '@playwright/test';
import { step } from '@qagentic/reporter/playwright';
import { LoginPage } from './pages/LoginPage';

test.describe('Login with Page Object Model', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Navigate to login page', async () => {
      await loginPage.goto();
    });

    await step('Enter valid credentials', async () => {
      await loginPage.enterEmail('user@example.com');
      await loginPage.enterPassword('password123');
    });

    await step('Submit login form', async () => {
      await loginPage.clickLogin();
    });

    await step('Verify successful login', async () => {
      await loginPage.verifyLoginSuccess();
    });
  });
});
```

### Using Test Annotations

```typescript
// tests/annotated.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Annotated Tests', () => {
  test('critical login test', async ({ page }) => {
    // Add annotations for QAagentic
    test.info().annotations.push(
      { type: 'feature', description: 'Authentication' },
      { type: 'story', description: 'User Login' },
      { type: 'severity', description: 'critical' },
      { type: 'tag', description: 'smoke' },
      { type: 'tag', description: 'regression' }
    );

    await page.goto('/login');
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password');
    await page.click('#submit');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectName` | `string` | `"playwright-project"` | Project identifier |
| `environment` | `string` | `"local"` | Environment name |
| `apiUrl` | `string` | `undefined` | QAagentic API endpoint |
| `apiKey` | `string` | `undefined` | API authentication key |
| `outputDir` | `string` | `"./qagentic-results"` | Output directory |

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
          QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
          QAGENTIC_ENVIRONMENT: ci
      
      - name: Upload QAagentic results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qagentic-results
          path: qagentic-results/
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### GitLab CI

```yaml
playwright:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  stage: test
  script:
    - npm ci
    - npx playwright test
  variables:
    QAGENTIC_API_URL: $QAGENTIC_API_URL
    QAGENTIC_API_KEY: $QAGENTIC_API_KEY
    QAGENTIC_ENVIRONMENT: ci
  artifacts:
    when: always
    paths:
      - qagentic-results/
      - playwright-report/
    reports:
      junit: qagentic-results/junit.xml
```

---

## Best Practices

### 1. Use Locator Strategies

```typescript
// Prefer data-testid
page.locator('[data-testid="submit-button"]');

// Or role-based selectors
page.getByRole('button', { name: 'Submit' });

// Or text content
page.getByText('Submit');
```

### 2. Use Auto-Waiting

```typescript
// Playwright auto-waits for elements
await page.click('[data-testid="button"]');

// Use expect for assertions with auto-retry
await expect(page.locator('[data-testid="result"]'))
  .toBeVisible();
```

### 3. Organize with Steps

```typescript
await step('Complete user registration', async () => {
  await page.fill('#name', 'John Doe');
  await page.fill('#email', 'john@example.com');
  await page.fill('#password', 'SecurePass123');
  await page.click('#register');
});
```

### 4. Use Fixtures

```typescript
// tests/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

// tests/login.spec.ts
import { test } from './fixtures';

test('login test', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
});
```
