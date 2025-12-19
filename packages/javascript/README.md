# QAagentic JavaScript/TypeScript SDK

<p align="center">
  <strong>AI-Powered Test Intelligence for JavaScript/TypeScript</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@qagentic/reporter">
    <img src="https://img.shields.io/npm/v/@qagentic/reporter.svg" alt="npm version">
  </a>
  <a href="https://github.com/qagentic/qagentic-sdk/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
</p>

---

## 🚀 Installation

```bash
npm install @qagentic/reporter
# or
yarn add @qagentic/reporter
# or
pnpm add @qagentic/reporter
```

## ⚡ Quick Start

### Cypress

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');
const { qagentic } = require('@qagentic/reporter/cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      qagentic(on, config, {
        projectName: 'my-project',
        apiUrl: 'http://localhost:8080',
      });
      return config;
    },
  },
});
```

### Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { qagenticReporter } from '@qagentic/reporter/playwright';

export default defineConfig({
  reporter: [
    ['html'],
    qagenticReporter({
      projectName: 'my-project',
      apiUrl: 'http://localhost:8080',
    }),
  ],
});
```

### Jest

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['@qagentic/reporter/jest', {
      projectName: 'my-project',
      apiUrl: 'http://localhost:8080',
    }],
  ],
};
```

## 📝 Usage Examples

### Steps in Cypress

```javascript
// cypress/e2e/login.cy.js
import { step, feature, story, severity } from '@qagentic/reporter/cypress';

describe('User Authentication', () => {
  it('should login successfully', () => {
    step('Navigate to login page', () => {
      cy.visit('/login');
    });

    step('Enter credentials', () => {
      cy.get('#email').type('user@example.com');
      cy.get('#password').type('password123');
    });

    step('Submit and verify', () => {
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });
});
```

### Steps in Playwright

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { step } from '@qagentic/reporter/playwright';

test('should login successfully', async ({ page }) => {
  await step('Navigate to login page', async () => {
    await page.goto('/login');
  });

  await step('Enter credentials', async () => {
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password123');
  });

  await step('Submit and verify', async () => {
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### Attachments

```javascript
import { attach, attachScreenshot, attachJson } from '@qagentic/reporter';

// Attach screenshot
attachScreenshot('path/to/screenshot.png', 'Login Page');

// Attach JSON data
attachJson({ status: 'success', userId: 123 }, 'API Response');

// Attach text
attachText('Log output here...', 'Console Logs');
```

## ⚙️ Configuration

### Environment Variables

```bash
QAGENTIC_PROJECT_NAME=my-project
QAGENTIC_API_URL=http://localhost:8080
QAGENTIC_API_KEY=your-api-key
QAGENTIC_OUTPUT_DIR=./qagentic-results
QAGENTIC_AI_ANALYSIS=true
```

### Configuration File

```yaml
# qagentic.yaml
project:
  name: my-project
  environment: staging

reporting:
  api:
    enabled: true
    url: http://localhost:8080
    key: ${QAGENTIC_API_KEY}
  local:
    enabled: true
    output_dir: ./qagentic-results
    formats:
      - json
      - html
      - junit

features:
  ai_analysis: true
  screenshots: on_failure
```

## 🔌 CI/CD Integration

### GitHub Actions

```yaml
- name: Run Cypress Tests
  run: npx cypress run
  env:
    QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
    QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}

- name: Upload Results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: qagentic-results
    path: qagentic-results/
```

### GitLab CI

```yaml
test:
  script:
    - npx cypress run
  artifacts:
    when: always
    paths:
      - qagentic-results/
    reports:
      junit: qagentic-results/junit.xml
```

## 📊 Output Formats

- **JSON Report** - Machine-readable results
- **JUnit XML** - CI/CD compatible
- **HTML Report** - Interactive dashboard

## 🧠 AI Features

When connected to QAagentic server:

- **Automatic Root Cause Analysis**
- **Failure Clustering**
- **Flaky Test Detection**
- **Smart Recommendations**

## 📚 API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `step(name, fn)` | Create a test step |
| `attach(data, name)` | Attach data to test |
| `attachScreenshot(path)` | Attach screenshot |
| `attachJson(data)` | Attach JSON data |

### Decorators/Labels

| Function | Description |
|----------|-------------|
| `feature(name)` | Group by feature |
| `story(name)` | Group by user story |
| `severity(level)` | Set severity level |
| `tag(...tags)` | Add tags |

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
