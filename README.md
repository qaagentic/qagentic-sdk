# QAagentic SDK

<p align="center">
  <img src="docs/assets/logo.png" alt="QAagentic Logo" width="200"/>
</p>

<p align="center">
  <strong>AI-Powered Test Intelligence Platform SDK</strong>
</p>

<p align="center">
  <a href="#python-sdk">Python</a> •
  <a href="#javascript-sdk">JavaScript</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#ci-cd-integration">CI/CD</a>
</p>

---

## 🚀 What is QAagentic SDK?

QAagentic SDK is a next-generation test reporting and analytics library that brings **AI-powered insights** to your test automation. Unlike traditional reporters, QAagentic automatically:

- 🧠 **Analyzes test failures** using AI to identify root causes
- 📊 **Clusters similar failures** to reduce noise
- 🔮 **Predicts flaky tests** before they become problems
- 📈 **Tracks quality trends** across your entire test suite
- 🎯 **Provides actionable recommendations** to improve test reliability

## ✨ Features

| Feature | QAagentic | Allure | ReportPortal |
|---------|-----------|--------|--------------|
| Beautiful Reports | ✅ | ✅ | ✅ |
| AI Root Cause Analysis | ✅ | ❌ | ❌ |
| Failure Clustering | ✅ | ❌ | ⚠️ Limited |
| Flaky Test Detection | ✅ | ❌ | ✅ |
| Real-time Dashboard | ✅ | ❌ | ✅ |
| Local + Cloud Reporting | ✅ | ✅ | ❌ |
| Zero Config Setup | ✅ | ⚠️ | ❌ |
| Multi-framework Support | ✅ | ✅ | ✅ |

## 📦 Installation

### Python (pytest, unittest, robot)

```bash
pip install qagentic-pytest
```

### JavaScript/TypeScript (Cypress, Playwright, Jest)

```bash
npm install @qagentic/reporter
# or
yarn add @qagentic/reporter
```

## 🏃 Quick Start

### Python with pytest

```python
# conftest.py
import qagentic

# That's it! QAagentic automatically hooks into pytest

# Optional: Configure settings
qagentic.configure(
    project_name="my-project",
    api_url="http://localhost:8080",  # Or your QAagentic server
    api_key="your-api-key",           # Optional for cloud
)
```

```python
# test_example.py
import qagentic
from qagentic import feature, story, step, severity, Severity

@feature("User Authentication")
@story("Login Flow")
@severity(Severity.CRITICAL)
def test_user_login():
    with step("Navigate to login page"):
        # Your test code
        pass
    
    with step("Enter credentials"):
        qagentic.attach_screenshot("login_page.png")
        # Your test code
        pass
    
    with step("Verify successful login"):
        # Your test code
        pass
```

### JavaScript with Cypress

```javascript
// cypress.config.js
const { qagentic } = require('@qagentic/reporter/cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      qagentic(on, config);
      return config;
    },
  },
});
```

```javascript
// cypress/e2e/login.cy.js
import { feature, story, step, severity } from '@qagentic/reporter';

describe('User Authentication', { feature: 'Authentication' }, () => {
  it('should login successfully', { severity: 'critical', story: 'Login' }, () => {
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

### JavaScript with Playwright

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

## 🔧 Configuration

### Environment Variables

```bash
# Required
QAGENTIC_PROJECT_NAME=my-project

# Optional - API reporting
QAGENTIC_API_URL=http://localhost:8080
QAGENTIC_API_KEY=your-api-key

# Optional - Local reporting
QAGENTIC_OUTPUT_DIR=./qagentic-results
QAGENTIC_OUTPUT_FORMAT=json,html

# Optional - Features
QAGENTIC_AI_ANALYSIS=true
QAGENTIC_SCREENSHOT_ON_FAILURE=true
QAGENTIC_VIDEO_ON_FAILURE=true
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
  failure_clustering: true
  flaky_detection: true
  screenshots: on_failure
  videos: on_failure

labels:
  team: platform
  component: auth
```

## 🔌 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Tests
        run: pytest --qagentic
        env:
          QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
          QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
      
      - name: Upload QAagentic Report
        uses: qagentic/upload-action@v1
        if: always()
        with:
          results-path: ./qagentic-results
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'pytest --qagentic'
            }
            post {
                always {
                    qagentic results: 'qagentic-results'
                }
            }
        }
    }
}
```

### GitLab CI

```yaml
test:
  script:
    - pytest --qagentic
  artifacts:
    when: always
    paths:
      - qagentic-results/
    reports:
      junit: qagentic-results/junit.xml
```

## 📊 Report Types

### Local Reports

QAagentic generates beautiful local reports in multiple formats:

- **HTML Report** - Interactive dashboard with AI insights
- **JSON Report** - Machine-readable for custom integrations
- **JUnit XML** - Compatible with CI/CD tools
- **Allure Format** - Drop-in replacement for Allure reports

### Cloud Dashboard

Connect to QAagentic Cloud for:

- Real-time test monitoring
- Historical trend analysis
- Team collaboration
- AI-powered recommendations
- Slack/Teams notifications

## 🧠 AI Features

### Automatic Root Cause Analysis

When a test fails, QAagentic automatically:

1. Captures error messages and stack traces
2. Analyzes patterns across similar failures
3. Identifies the most likely root cause
4. Suggests fixes based on historical data

### Failure Clustering

QAagentic groups related failures together:

- Reduces alert fatigue
- Identifies systemic issues
- Prioritizes fixes by impact

### Flaky Test Detection

Automatically identifies flaky tests by:

- Tracking pass/fail patterns
- Analyzing timing variations
- Detecting environment dependencies

## 📚 Documentation

- [Python SDK Guide](./packages/python/README.md)
- [JavaScript SDK Guide](./packages/javascript/README.md)
- [API Reference](./docs/api-reference.md)
- [Configuration Guide](./docs/configuration.md)
- [CI/CD Integration](./docs/ci-cd.md)
- [Best Practices](./docs/best-practices.md)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Made with ❤️ by the QAagentic Team
</p>
