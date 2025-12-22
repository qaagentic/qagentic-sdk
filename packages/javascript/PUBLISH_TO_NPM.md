# Publishing QAagentic Reporter to NPM

## Version 0.1.3 - Simplified Cypress SDK

### Pre-Publishing Checklist

- ✅ Version updated to 0.1.3
- ✅ Cypress simplified setup implemented
- ✅ Documentation updated
- ✅ Build scripts configured
- ✅ TypeScript types included
- ✅ Exports configured for all frameworks

### Publishing Steps

#### 1. Build the Package
```bash
cd packages/javascript
npm run build
```

#### 2. Verify Build
```bash
ls -la dist/
# Should contain:
# - index.js, index.mjs, index.d.ts
# - cypress/index.js, cypress/index.mjs, cypress/index.d.ts
# - playwright/index.js, playwright/index.mjs, playwright/index.d.ts
# - jest/index.js, jest/index.mjs, jest/index.d.ts
```

#### 3. Login to NPM
```bash
npm login
# Enter your NPM credentials
```

#### 4. Publish to NPM
```bash
npm publish
```

#### 5. Verify Publication
```bash
npm view qagentic-reporter@0.1.3
# Should show package details on NPM registry
```

### Installation After Publishing

Users can now install with:
```bash
npm install qagentic-reporter
```

### Cypress Quick Start (After Publishing)

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

### What's New in 0.1.3

✨ **Simplified Cypress Integration**
- One-line setup: `setupQAgentic(on, config)`
- Auto-configuration from environment variables
- Zero manual configuration needed
- Error handling and logging built-in

🎯 **Features**
- Automatic test result capture
- Pass/fail status tracking
- Error messages and stack traces
- Test duration metrics
- AI-powered failure analysis
- Flaky test detection

📚 **Documentation**
- CYPRESS_QUICK_START.md - 3-step setup guide
- Simple setup module with auto-configuration
- Example integration for VCC project

### NPM Package Details

**Package Name**: `qagentic-reporter`
**Version**: 0.1.3
**Repository**: https://github.com/qagentic/qagentic-sdk
**License**: MIT
**Node Version**: >=16.0.0

### Exports

```javascript
// Main export
import { qagentic } from 'qagentic-reporter';

// Simplified Cypress setup
import { setupQAgentic } from 'qagentic-reporter/cypress/simple-setup';

// Cypress full setup
import { qagentic as cypressQAgentic } from 'qagentic-reporter/cypress';

// Playwright
import { playwrightQAgentic } from 'qagentic-reporter/playwright';

// Jest
import { jestQAgentic } from 'qagentic-reporter/jest';
```

### Support

- Documentation: https://github.com/qagentic/qagentic-sdk
- Issues: https://github.com/qagentic/qagentic-sdk/issues
- Email: team@qagentic.io
