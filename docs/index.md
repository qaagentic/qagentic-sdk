# QAagentic SDK Documentation

<div align="center">
  <h2>🚀 AI-Powered Test Intelligence Platform</h2>
  <p><strong>Version 1.0.0</strong> | Released December 2024</p>
  
  <p>
    <a href="#installation">Installation</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#frameworks">Frameworks</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#cicd">CI/CD</a>
  </p>
</div>

---

## Overview

QAagentic SDK is a next-generation test reporting library that transforms how you understand and manage test failures. Unlike traditional reporters, QAagentic leverages **artificial intelligence** to automatically analyze failures, cluster related issues, and provide actionable insights.

### Why QAagentic?

| Challenge | Traditional Tools | QAagentic Solution |
|-----------|-------------------|-------------------|
| Understanding failures | Manual investigation | **AI-powered root cause analysis** |
| Too many alerts | Alert fatigue | **Intelligent failure clustering** |
| Flaky tests | Guess and retry | **Predictive flaky detection** |
| Historical context | Limited or none | **Full trend analysis & patterns** |
| Setup complexity | Complex configuration | **Zero-config integration** |

---

## Installation

### Python

```bash
pip install qagentic-pytest
```

**Requirements:** Python 3.8+, pytest 7.0+

### JavaScript / TypeScript

```bash
npm install @qagentic/reporter
# or
yarn add @qagentic/reporter
# or
pnpm add @qagentic/reporter
```

**Requirements:** Node.js 16+

---

## Quick Start

### Python with pytest

**Step 1:** Install the package
```bash
pip install qagentic-pytest
```

**Step 2:** Run your tests with QAagentic
```bash
pytest --qagentic
```

**Step 3:** (Optional) Add rich metadata to your tests
```python
from qagentic import feature, story, severity, Severity, step

@feature("User Authentication")
@story("Login Flow")
@severity(Severity.CRITICAL)
def test_user_login():
    with step("Navigate to login page"):
        # Your test code here
        pass
    
    with step("Enter credentials"):
        # Your test code here
        pass
    
    with step("Verify successful login"):
        assert True
```

### Cypress

**Step 1:** Install the package
```bash
npm install @qagentic/reporter
```

**Step 2:** Configure in `cypress.config.js`
```javascript
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

**Step 3:** Use in your tests
```javascript
import { step } from '@qagentic/reporter/cypress';

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

### Playwright

**Step 1:** Install the package
```bash
npm install @qagentic/reporter
```

**Step 2:** Configure in `playwright.config.ts`
```typescript
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

**Step 1:** Install the package
```bash
npm install @qagentic/reporter
```

**Step 2:** Configure in `jest.config.js`
```javascript
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

---

## Supported Frameworks

| Framework | Language | Package | Status |
|-----------|----------|---------|--------|
| **pytest** | Python | `qagentic-pytest` | ✅ Stable |
| **unittest** | Python | `qagentic-pytest` | ✅ Stable |
| **Cypress** | JavaScript | `@qagentic/reporter` | ✅ Stable |
| **Playwright** | TypeScript | `@qagentic/reporter` | ✅ Stable |
| **Jest** | JavaScript | `@qagentic/reporter` | ✅ Stable |
| **Robot Framework** | Python | `qagentic-robot` | 🔜 Coming Soon |
| **TestNG** | Java | `qagentic-java` | 🔜 Coming Soon |
| **JUnit 5** | Java | `qagentic-java` | 🔜 Coming Soon |

---

## Configuration

QAagentic can be configured through multiple methods (in order of precedence):

1. **Programmatic configuration** (highest priority)
2. **Environment variables**
3. **Configuration file** (`qagentic.yaml`)
4. **Default values** (lowest priority)

### Environment Variables

```bash
# Project Settings
QAGENTIC_PROJECT_NAME=my-project
QAGENTIC_ENVIRONMENT=staging

# API Reporting
QAGENTIC_API_URL=https://api.qagentic.io
QAGENTIC_API_KEY=your-api-key
QAGENTIC_API_ENABLED=true

# Local Reporting
QAGENTIC_OUTPUT_DIR=./qagentic-results
QAGENTIC_OUTPUT_FORMAT=json,html,junit
QAGENTIC_LOCAL_ENABLED=true

# Features
QAGENTIC_AI_ANALYSIS=true
QAGENTIC_SCREENSHOTS=on_failure
QAGENTIC_VIDEOS=on_failure

# Labels
QAGENTIC_TEAM=platform
QAGENTIC_COMPONENT=auth
```

### Configuration File

Create `qagentic.yaml` in your project root:

```yaml
# QAagentic SDK Configuration
# Version: 1.0.0

project:
  name: my-awesome-project
  environment: ${QAGENTIC_ENVIRONMENT:-local}

reporting:
  api:
    enabled: true
    url: https://api.qagentic.io
    key: ${QAGENTIC_API_KEY}
    timeout: 30000
    retry_count: 3
    batch_size: 100
  
  local:
    enabled: true
    output_dir: ./qagentic-results
    formats:
      - json
      - html
      - junit
    clean_on_start: true

features:
  ai_analysis: true
  failure_clustering: true
  flaky_detection: true
  screenshots: on_failure  # always | on_failure | never
  videos: on_failure       # always | on_failure | never
  console_output: true

labels:
  team: platform
  component: authentication
  custom:
    sprint: "2024-Q4"
    priority: high
```

### Programmatic Configuration

#### Python

```python
import qagentic

qagentic.configure(
    project_name="my-project",
    environment="staging",
    api_url="https://api.qagentic.io",
    api_key="your-api-key",
    output_dir="./qagentic-results",
    ai_analysis=True,
)
```

#### JavaScript

```javascript
import { configure } from '@qagentic/reporter';

configure({
  projectName: 'my-project',
  environment: 'staging',
  apiUrl: 'https://api.qagentic.io',
  apiKey: 'your-api-key',
  outputDir: './qagentic-results',
});
```

---

## API Reference

### Python API

#### Decorators

| Decorator | Description | Example |
|-----------|-------------|---------|
| `@feature(name)` | Group tests by feature | `@feature("Authentication")` |
| `@story(name)` | Group tests by user story | `@story("User Login")` |
| `@epic(name)` | Group tests by epic | `@epic("User Management")` |
| `@severity(level)` | Set test severity | `@severity(Severity.CRITICAL)` |
| `@tag(*tags)` | Add tags to test | `@tag("smoke", "regression")` |
| `@owner(name)` | Set test owner | `@owner("john.doe")` |
| `@link(url, name, type)` | Add external link | `@link("https://jira.com/ABC-123", "Ticket", "issue")` |
| `@issue(url, name)` | Link to issue tracker | `@issue("https://jira.com/ABC-123")` |
| `@testcase(url, name)` | Link to test management | `@testcase("https://testrail.com/C123")` |
| `@description(text)` | Add test description | `@description("Verifies login flow")` |
| `@title(name)` | Override test title | `@title("Login with valid credentials")` |

#### Severity Levels

```python
from qagentic import Severity

Severity.BLOCKER   # System unusable
Severity.CRITICAL  # Major feature broken
Severity.NORMAL    # Standard priority (default)
Severity.MINOR     # Minor issue
Severity.TRIVIAL   # Cosmetic issue
```

#### Step Context Manager

```python
from qagentic import step

# Basic usage
with step("Step name"):
    # Your code here
    pass

# With description
with step("Step name", "Detailed description"):
    pass

# Nested steps
with step("Parent step"):
    with step("Child step 1"):
        pass
    with step("Child step 2"):
        pass

# With attachments
with step("Verify page") as s:
    s.attach_screenshot("screenshot.png")
    s.attach_json({"key": "value"}, "API Response")
```

#### Attachments

```python
import qagentic

# Attach a file
qagentic.attach("path/to/file.txt", "Log File")

# Attach screenshot
qagentic.attach_screenshot("screenshot.png", "Login Page")

# Attach JSON data
qagentic.attach_json({"status": "success"}, "API Response")

# Attach plain text
qagentic.attach_text("Some log output", "Console Logs")

# Attach HTML
qagentic.attach_html("<h1>Report</h1>", "HTML Report")

# Attach video
qagentic.attach_video("recording.mp4", "Test Recording")

# Attach CSV
qagentic.attach_csv([["a", "b"], [1, 2]], "Data Table")
```

### JavaScript API

#### Step Function

```typescript
import { step } from '@qagentic/reporter';

// Synchronous step
step('Click login button', () => {
  // Your code here
});

// Async step
await step('Fetch user data', async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// With description
step('Verify dashboard', 'Check all widgets are visible', () => {
  // Your code here
});
```

#### Decorators (TypeScript)

```typescript
import { feature, story, severity, tag } from '@qagentic/reporter';

@feature('Authentication')
@story('Login')
@severity('critical')
@tag('smoke', 'regression')
class LoginTests {
  // Test methods
}
```

#### Attachments

```typescript
import { attach, attachScreenshot, attachJson, attachText } from '@qagentic/reporter';

// Attach file
attach(fileContent, 'Log File', 'text/plain');

// Attach screenshot
attachScreenshot('path/to/screenshot.png', 'Login Page');

// Attach JSON
attachJson({ status: 'success' }, 'API Response');

// Attach text
attachText('Console output here', 'Logs');
```

---

## Output Formats

### JSON Report

Machine-readable format for custom integrations.

```json
{
  "id": "run_20241219_143052",
  "name": "pytest_20241219_143052",
  "projectName": "my-project",
  "environment": "staging",
  "startTime": "2024-12-19T14:30:52.000Z",
  "endTime": "2024-12-19T14:31:45.000Z",
  "durationMs": 53000,
  "total": 150,
  "passed": 142,
  "failed": 5,
  "broken": 2,
  "skipped": 1,
  "passRate": 94.67,
  "tests": [
    {
      "id": "test_001",
      "name": "test_user_login",
      "fullName": "tests.auth.test_login::test_user_login",
      "status": "passed",
      "durationMs": 1250,
      "labels": {
        "feature": "Authentication",
        "story": "Login Flow",
        "severity": "critical"
      },
      "steps": [
        {
          "name": "Navigate to login page",
          "status": "passed",
          "durationMs": 450
        }
      ]
    }
  ]
}
```

### JUnit XML

Compatible with CI/CD tools like Jenkins, GitLab, Azure DevOps.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="my-project" tests="150" failures="5" errors="2" skipped="1" time="53.000">
  <testcase name="test_user_login" classname="tests.auth.test_login" time="1.250"/>
  <testcase name="test_user_logout" classname="tests.auth.test_logout" time="0.850">
    <failure message="AssertionError: Expected redirect to login page">
      Traceback...
    </failure>
  </testcase>
</testsuite>
```

### HTML Report

Interactive dashboard with:
- Test execution summary
- Pass/fail trends
- Failure analysis
- Step-by-step execution details
- Screenshots and attachments
- AI-powered insights

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install qagentic-pytest
      
      - name: Run Tests
        run: pytest --qagentic
        env:
          QAGENTIC_PROJECT_NAME: ${{ github.repository }}
          QAGENTIC_ENVIRONMENT: ci
          QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
          QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
      
      - name: Upload QAagentic Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qagentic-results
          path: qagentic-results/
          retention-days: 30
```

### GitLab CI

```yaml
stages:
  - test

test:
  stage: test
  image: python:3.11
  variables:
    QAGENTIC_PROJECT_NAME: $CI_PROJECT_NAME
    QAGENTIC_ENVIRONMENT: ci
    QAGENTIC_API_URL: $QAGENTIC_API_URL
    QAGENTIC_API_KEY: $QAGENTIC_API_KEY
  script:
    - pip install -r requirements.txt
    - pip install qagentic-pytest
    - pytest --qagentic
  artifacts:
    when: always
    paths:
      - qagentic-results/
    reports:
      junit: qagentic-results/junit.xml
    expire_in: 30 days
```

### Jenkins

```groovy
pipeline {
    agent any
    
    environment {
        QAGENTIC_PROJECT_NAME = "${env.JOB_NAME}"
        QAGENTIC_ENVIRONMENT = 'ci'
        QAGENTIC_API_URL = credentials('qagentic-api-url')
        QAGENTIC_API_KEY = credentials('qagentic-api-key')
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pip install qagentic-pytest'
            }
        }
        
        stage('Test') {
            steps {
                sh 'pytest --qagentic'
            }
            post {
                always {
                    junit 'qagentic-results/junit.xml'
                    archiveArtifacts artifacts: 'qagentic-results/**/*'
                }
            }
        }
    }
}
```

### Azure DevOps

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  QAGENTIC_PROJECT_NAME: $(Build.Repository.Name)
  QAGENTIC_ENVIRONMENT: ci

steps:
  - task: UsePythonVersion@0
    inputs:
      versionSpec: '3.11'

  - script: |
      pip install -r requirements.txt
      pip install qagentic-pytest
    displayName: 'Install dependencies'

  - script: pytest --qagentic
    displayName: 'Run tests'
    env:
      QAGENTIC_API_URL: $(QAGENTIC_API_URL)
      QAGENTIC_API_KEY: $(QAGENTIC_API_KEY)

  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'qagentic-results/junit.xml'

  - task: PublishBuildArtifacts@1
    condition: always()
    inputs:
      pathToPublish: 'qagentic-results'
      artifactName: 'qagentic-results'
```

### CircleCI

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/python:3.11
    environment:
      QAGENTIC_PROJECT_NAME: my-project
      QAGENTIC_ENVIRONMENT: ci
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: |
            pip install -r requirements.txt
            pip install qagentic-pytest
      - run:
          name: Run tests
          command: pytest --qagentic
      - store_test_results:
          path: qagentic-results
      - store_artifacts:
          path: qagentic-results

workflows:
  test:
    jobs:
      - test
```

---

## AI Features

### Automatic Root Cause Analysis

When a test fails, QAagentic automatically:

1. **Captures Context** - Error messages, stack traces, test steps, environment info
2. **Analyzes Patterns** - Compares with historical failures and known issues
3. **Identifies Root Cause** - Uses AI to determine the most likely cause
4. **Suggests Fixes** - Provides actionable recommendations

Example AI Analysis Output:
```
🔍 Root Cause Analysis

Failure: test_checkout_flow
Error: TimeoutError: Element #submit-button not found

📊 Analysis:
- Confidence: 87%
- Category: UI Element Not Found
- Pattern: Similar to 12 failures in the last 7 days

🎯 Root Cause:
The submit button is rendered conditionally based on form validation.
The test is not waiting for the form to be fully validated before clicking.

💡 Recommendations:
1. Add explicit wait for form validation state
2. Use cy.get('#submit-button').should('be.visible') before clicking
3. Consider adding data-testid for more reliable selection
```

### Failure Clustering

QAagentic groups related failures to reduce noise:

- **Same Error Pattern** - Groups tests failing with identical error messages
- **Same Component** - Groups failures in the same feature/module
- **Same Root Cause** - Groups failures with similar underlying issues

Benefits:
- Reduces alert fatigue by 80%+
- Identifies systemic issues quickly
- Prioritizes fixes by impact

### Flaky Test Detection

QAagentic automatically identifies flaky tests by:

- **Pass/Fail Pattern Analysis** - Detects inconsistent results
- **Timing Variations** - Identifies tests with high duration variance
- **Environment Dependencies** - Finds tests sensitive to environment
- **Retry Analysis** - Tracks tests that pass on retry

Flaky Test Report:
```
⚠️ Flaky Tests Detected

test_async_data_load
- Flakiness Score: 73%
- Pass Rate (7 days): 82%
- Avg Retries: 1.4
- Likely Cause: Race condition in async data loading

Recommendation: Add explicit wait for data loading state
```

---

## Best Practices

### 1. Use Meaningful Step Names

```python
# ❌ Bad
with step("Step 1"):
    pass

# ✅ Good
with step("Navigate to checkout page"):
    pass
```

### 2. Add Context with Labels

```python
@feature("E-commerce")
@story("Checkout Flow")
@severity(Severity.CRITICAL)
@tag("smoke", "payment")
def test_complete_purchase():
    pass
```

### 3. Attach Evidence on Failure

```python
def test_login():
    try:
        # Test code
        pass
    except Exception as e:
        qagentic.attach_screenshot("failure.png")
        qagentic.attach_text(str(e), "Error Details")
        raise
```

### 4. Use Environment-Specific Configuration

```yaml
# qagentic.yaml
project:
  name: my-project
  environment: ${CI_ENVIRONMENT:-local}

reporting:
  api:
    enabled: ${CI:-false}  # Only enable API in CI
  local:
    enabled: true
```

### 5. Integrate with CI/CD Early

Set up QAagentic in your CI/CD pipeline from day one to:
- Track quality trends over time
- Catch regressions early
- Build historical data for AI analysis

---

## Troubleshooting

### Common Issues

#### Tests not being reported

**Cause:** QAagentic plugin not loaded

**Solution:**
```bash
# Python - ensure plugin is installed
pip install qagentic-pytest

# Run with explicit flag
pytest --qagentic
```

#### API connection failed

**Cause:** Invalid API URL or key

**Solution:**
```bash
# Verify environment variables
echo $QAGENTIC_API_URL
echo $QAGENTIC_API_KEY

# Test connection
curl -H "X-API-Key: $QAGENTIC_API_KEY" $QAGENTIC_API_URL/health
```

#### No output files generated

**Cause:** Local reporting disabled or wrong output directory

**Solution:**
```yaml
# qagentic.yaml
reporting:
  local:
    enabled: true
    output_dir: ./qagentic-results
```

### Debug Mode

Enable debug logging:

```bash
# Python
QAGENTIC_DEBUG=true pytest --qagentic

# JavaScript
DEBUG=qagentic* npm test
```

---

## Migration Guide

### From Allure

QAagentic is designed as a drop-in replacement for Allure:

| Allure | QAagentic |
|--------|-----------|
| `@allure.feature()` | `@qagentic.feature()` |
| `@allure.story()` | `@qagentic.story()` |
| `@allure.severity()` | `@qagentic.severity()` |
| `with allure.step()` | `with qagentic.step()` |
| `allure.attach()` | `qagentic.attach()` |

Migration script:
```bash
# Replace imports
sed -i 's/import allure/import qagentic/g' tests/**/*.py
sed -i 's/allure\./qagentic./g' tests/**/*.py
```

### From ReportPortal

QAagentic provides similar functionality with simpler setup:

1. Remove ReportPortal agent configuration
2. Install QAagentic: `pip install qagentic-pytest`
3. Run with `pytest --qagentic`

---

## Changelog

### Version 1.0.0 (December 2024)

**🎉 Initial Release**

- Python SDK with pytest integration
- JavaScript SDK for Cypress, Playwright, Jest
- AI-powered root cause analysis
- Failure clustering
- Flaky test detection
- Multiple output formats (JSON, HTML, JUnit XML)
- CI/CD integrations (GitHub Actions, GitLab CI, Jenkins, Azure DevOps)
- Configuration via environment variables, YAML, and programmatic API

---

## Support

- **Documentation:** https://docs.qagentic.io
- **GitHub Issues:** https://github.com/qagentic/qagentic-sdk/issues
- **Discord:** https://discord.gg/qagentic
- **Email:** support@qagentic.io

---

## License

MIT License - see [LICENSE](../LICENSE) for details.

---

<div align="center">
  <p>Made with ❤️ by the QAagentic Team</p>
  <p>© 2024 QAagentic. All rights reserved.</p>
</div>
