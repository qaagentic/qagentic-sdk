# QAagentic Cypress - Quick Start Guide

## 🚀 One-Line Setup (Just Like Allure!)

### Step 1: Install
```bash
npm install @qagentic/reporter
```

### Step 2: Add One Line to cypress.config.ts
```typescript
import { defineConfig } from 'cypress';
import { setupQAgentic } from '@qagentic/reporter/cypress/simple-setup';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      setupQAgentic(on, config);  // ← That's it!
      return config;
    },
  },
});
```

### Step 3: Run Tests
```bash
npm test
```

**Done!** Results automatically appear in QAagentic Portal at http://localhost:3000

---

## 📊 What You Get (Automatically)

✅ Test execution timeline
✅ Pass/fail status tracking
✅ Error messages and stack traces
✅ Test duration metrics
✅ AI-powered failure analysis
✅ Flaky test detection
✅ Performance insights

---

## 🔧 Configuration (Optional)

Set environment variables to customize:

```bash
# API Gateway URL (default: http://localhost:8080)
QAGENTIC_API_URL=http://localhost:8080

# Project name (default: Cypress E2E Tests)
QAGENTIC_PROJECT_NAME=My Project

# Environment (default: e2e)
QAGENTIC_ENVIRONMENT=staging
```

---

## 📝 Example Test File

No changes needed to your tests! They work as-is:

```typescript
describe("Login Tests", () => {
  it("should login successfully", () => {
    cy.visit('/');
    cy.get('[data-cy=username]').type('user@example.com');
    cy.get('[data-cy=password]').type('password');
    cy.get('[data-cy=login-btn]').click();
    cy.contains('Dashboard').should('be.visible');
  });

  it("should show error on invalid credentials", () => {
    cy.visit('/');
    cy.get('[data-cy=username]').type('invalid');
    cy.get('[data-cy=password]').type('invalid');
    cy.get('[data-cy=login-btn]').click();
    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

---

## 🎯 View Results

1. **QAagentic Portal**: http://localhost:3000
   - Test execution timeline
   - Status distribution
   - AI insights

2. **Local Reports**: `./qagentic-results/`
   - JSON test results
   - Screenshots on failure

---

## ⚡ That's All!

No complex configuration. No boilerplate. Just one line and you're done!

Compare with Allure:
- ✅ QAagentic: One line
- ❌ Allure: Multiple configuration files

---

## 🆘 Troubleshooting

### Tests not being reported?
```bash
# Check if QAagentic services are running
docker ps | grep qagentic

# Verify API URL
echo $QAGENTIC_API_URL
```

### Want to see logs?
Look for `[QAagentic]` messages in console output

---

## 📚 Next Steps

- View AI Insights: http://localhost:3000/ai-features
- Check documentation: http://localhost:3000/docs
- Explore failure patterns: http://localhost:3000/failure-atlas

**That's it! Happy testing! 🎉**
