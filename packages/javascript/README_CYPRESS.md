# QAagentic Reporter - Cypress Integration

## 🚀 One-Line Setup

The simplest way to integrate QAagentic with Cypress - just one line!

```typescript
import { setupQAgentic } from 'qagentic-reporter/cypress/simple-setup';

setupQAgentic(on, config);  // That's it!
```

## 📦 Installation

```bash
npm install qagentic-reporter
```

## ⚡ Quick Start

### Step 1: Update cypress.config.ts
```typescript
import { defineConfig } from 'cypress';
import { setupQAgentic } from 'qagentic-reporter/cypress/simple-setup';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      setupQAgentic(on, config);
      return config;
    },
  },
});
```

### Step 2: Run Tests
```bash
npm test
```

### Step 3: View Results
Visit http://localhost:3000 to see:
- Test execution timeline
- Status distribution
- AI insights and recommendations

## 🔧 Configuration (Optional)

Set environment variables to customize:

```bash
QAGENTIC_API_URL=http://localhost:8080
QAGENTIC_PROJECT_NAME=My Project
QAGENTIC_ENVIRONMENT=e2e
```

## ✨ Features

✅ **Automatic Test Capture**
- Pass/fail status
- Test duration
- Error messages and stack traces
- Test metadata (file, suite)

✅ **AI-Powered Analysis**
- Root cause analysis
- Failure pattern detection
- Flaky test identification
- Performance insights

✅ **Real-time Dashboard**
- Test execution timeline
- Status distribution
- AI recommendations

## 📝 Example Test

No changes needed to your tests:

```typescript
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

All results are automatically captured!

## 🎯 Advanced Setup (Optional)

For more control, use the full setup:

```typescript
import { qagentic } from 'qagentic-reporter/cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      qagentic(on, config, {
        projectName: 'My Project',
        environment: 'staging',
        apiUrl: 'http://localhost:8080',
        outputDir: './qagentic-results',
      });
      return config;
    },
  },
});
```

## 📚 Documentation

- [Quick Start Guide](./CYPRESS_QUICK_START.md)
- [Full API Reference](./README.md)
- [QAagentic Portal](http://localhost:3000)

## 🆘 Troubleshooting

### Tests not being reported?
1. Check if QAagentic services are running
2. Verify `QAGENTIC_API_URL` environment variable
3. Look for `[QAagentic]` logs in console

### Need help?
- Visit: http://localhost:3000/docs
- AI Features: http://localhost:3000/ai-features

## 📄 License

MIT
