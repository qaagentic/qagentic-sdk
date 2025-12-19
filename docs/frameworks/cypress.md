# Cypress Integration Guide

Complete guide for using QAagentic with Cypress.

---

## Installation

```bash
npm install @qagentic/reporter --save-dev
```

**Requirements:**
- Node.js 16+
- Cypress 12+

---

## Setup

### Step 1: Configure Plugin

Update your `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');
const { qagentic } = require('@qagentic/reporter/cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Initialize QAagentic plugin
      qagentic(on, config, {
        projectName: 'my-cypress-project',
        environment: process.env.CI ? 'ci' : 'local',
        apiUrl: process.env.QAGENTIC_API_URL,
        apiKey: process.env.QAGENTIC_API_KEY,
        outputDir: './qagentic-results',
        screenshotsOnFailure: true,
        videosOnFailure: true,
      });
      
      return config;
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

### Step 2: Import Utilities (Optional)

Create or update `cypress/support/e2e.js`:

```javascript
// Import QAagentic utilities for use in tests
import { step, Severity } from '@qagentic/reporter/cypress';

// Make step available globally (optional)
Cypress.Commands.add('step', (name, fn) => {
  cy.log(`**Step:** ${name}`);
  return step(name, fn);
});
```

---

## Usage Examples

### Basic Test with Steps

```javascript
// cypress/e2e/login.cy.js
import { step } from '@qagentic/reporter/cypress';

describe('User Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with valid credentials', () => {
    step('Enter email address', () => {
      cy.get('[data-testid="email-input"]')
        .type('user@example.com');
    });

    step('Enter password', () => {
      cy.get('[data-testid="password-input"]')
        .type('SecurePassword123');
    });

    step('Click login button', () => {
      cy.get('[data-testid="login-button"]').click();
    });

    step('Verify successful login', () => {
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="welcome-message"]')
        .should('contain', 'Welcome');
    });
  });

  it('should show error for invalid credentials', () => {
    step('Enter invalid credentials', () => {
      cy.get('[data-testid="email-input"]')
        .type('wrong@example.com');
      cy.get('[data-testid="password-input"]')
        .type('wrongpassword');
    });

    step('Submit login form', () => {
      cy.get('[data-testid="login-button"]').click();
    });

    step('Verify error message', () => {
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid credentials');
    });
  });
});
```

### E-commerce Flow Example

```javascript
// cypress/e2e/checkout.cy.js
import { step, attachJson, attachScreenshot } from '@qagentic/reporter/cypress';

describe('E-commerce Checkout', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('customer@example.com', 'password');
  });

  it('should complete purchase successfully', () => {
    step('Search for product', () => {
      cy.get('[data-testid="search-input"]')
        .type('iPhone 15{enter}');
    });

    step('Select product from results', () => {
      cy.get('[data-testid="product-card"]')
        .first()
        .click();
    });

    step('Add product to cart', () => {
      cy.get('[data-testid="add-to-cart"]').click();
      cy.get('[data-testid="cart-count"]')
        .should('contain', '1');
    });

    step('Proceed to checkout', () => {
      cy.get('[data-testid="cart-icon"]').click();
      cy.get('[data-testid="checkout-button"]').click();
    });

    step('Fill shipping information', () => {
      cy.get('[data-testid="shipping-address"]')
        .type('123 Main St, City, ST 12345');
      cy.get('[data-testid="shipping-method"]')
        .select('Standard Shipping');
    });

    step('Enter payment details', () => {
      cy.get('[data-testid="card-number"]')
        .type('4111111111111111');
      cy.get('[data-testid="card-expiry"]')
        .type('12/25');
      cy.get('[data-testid="card-cvv"]')
        .type('123');
    });

    step('Complete purchase', () => {
      cy.get('[data-testid="place-order"]').click();
    });

    step('Verify order confirmation', () => {
      cy.url().should('include', '/order-confirmation');
      cy.get('[data-testid="order-number"]')
        .should('be.visible')
        .invoke('text')
        .then((orderNumber) => {
          // Attach order details
          attachJson({
            orderNumber,
            timestamp: new Date().toISOString()
          }, 'Order Details');
        });
    });
  });
});
```

### API Testing with Attachments

```javascript
// cypress/e2e/api.cy.js
import { step, attachJson } from '@qagentic/reporter/cypress';

describe('API Tests', () => {
  it('should create and retrieve user', () => {
    let userId;

    step('Create new user via API', () => {
      cy.request({
        method: 'POST',
        url: '/api/users',
        body: {
          name: 'Test User',
          email: 'test@example.com'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        userId = response.body.id;
        
        attachJson(response.body, 'Create User Response');
      });
    });

    step('Retrieve created user', () => {
      cy.request(`/api/users/${userId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Test User');
        
        attachJson(response.body, 'Get User Response');
      });
    });

    step('Delete test user', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/users/${userId}`
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });
});
```

### Using Page Object Model

Following your preference for Page Object Model:

```javascript
// cypress/support/pages/LoginPage.js
export class LoginPage {
  // Selectors
  selectors = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
    welcomeMessage: '[data-testid="welcome-message"]',
  };

  visit() {
    cy.visit('/login');
    return this;
  }

  enterEmail(email) {
    cy.get(this.selectors.emailInput).type(email);
    return this;
  }

  enterPassword(password) {
    cy.get(this.selectors.passwordInput).type(password);
    return this;
  }

  clickLogin() {
    cy.get(this.selectors.loginButton).click();
    return this;
  }

  verifyLoginSuccess() {
    cy.url().should('include', '/dashboard');
    cy.get(this.selectors.welcomeMessage).should('be.visible');
    return this;
  }

  verifyLoginError(message) {
    cy.get(this.selectors.errorMessage)
      .should('be.visible')
      .and('contain', message);
    return this;
  }

  login(email, password) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickLogin();
    return this;
  }
}
```

```javascript
// cypress/e2e/login-pom.cy.js
import { step } from '@qagentic/reporter/cypress';
import { LoginPage } from '../support/pages/LoginPage';

describe('Login with Page Object Model', () => {
  const loginPage = new LoginPage();

  it('should login successfully', () => {
    step('Navigate to login page', () => {
      loginPage.visit();
    });

    step('Enter valid credentials', () => {
      loginPage.enterEmail('user@example.com');
      loginPage.enterPassword('password123');
    });

    step('Submit login form', () => {
      loginPage.clickLogin();
    });

    step('Verify successful login', () => {
      loginPage.verifyLoginSuccess();
    });
  });
});
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectName` | `string` | `"cypress-project"` | Project identifier |
| `environment` | `string` | `"local"` | Environment name |
| `apiUrl` | `string` | `undefined` | QAagentic API endpoint |
| `apiKey` | `string` | `undefined` | API authentication key |
| `outputDir` | `string` | `"./qagentic-results"` | Output directory |
| `screenshotsOnFailure` | `boolean` | `true` | Capture screenshots on failure |
| `videosOnFailure` | `boolean` | `true` | Include videos on failure |

---

## Environment Variables

```bash
# .env or CI environment
QAGENTIC_PROJECT_NAME=my-cypress-project
QAGENTIC_ENVIRONMENT=ci
QAGENTIC_API_URL=https://api.qagentic.io
QAGENTIC_API_KEY=your-api-key
QAGENTIC_OUTPUT_DIR=./qagentic-results
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Cypress Tests

on: [push, pull_request]

jobs:
  cypress:
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
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          start: npm start
          wait-on: 'http://localhost:3000'
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
```

### GitLab CI

```yaml
cypress:
  image: cypress/browsers:node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1
  stage: test
  script:
    - npm ci
    - npm start &
    - npx wait-on http://localhost:3000
    - npx cypress run
  variables:
    QAGENTIC_API_URL: $QAGENTIC_API_URL
    QAGENTIC_API_KEY: $QAGENTIC_API_KEY
    QAGENTIC_ENVIRONMENT: ci
  artifacts:
    when: always
    paths:
      - qagentic-results/
      - cypress/screenshots/
      - cypress/videos/
    reports:
      junit: qagentic-results/junit.xml
```

---

## Best Practices

### 1. Use data-testid Attributes

```html
<!-- In your application -->
<button data-testid="submit-button">Submit</button>
```

```javascript
// In your tests
cy.get('[data-testid="submit-button"]').click();
```

### 2. Create Reusable Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### 3. Use Steps for Better Reporting

```javascript
// Group related actions into meaningful steps
step('Complete checkout form', () => {
  cy.get('#name').type('John Doe');
  cy.get('#address').type('123 Main St');
  cy.get('#city').type('New York');
  cy.get('#zip').type('10001');
});
```

### 4. Attach Evidence on Failure

```javascript
Cypress.on('fail', (error, runnable) => {
  // Attach screenshot on failure
  cy.screenshot('failure-screenshot');
  throw error;
});
```
