# API Reference

Complete API documentation for QAagentic SDK.

---

## Python API

### Configuration

#### `configure(**options)`

Configure QAagentic SDK settings.

```python
import qagentic

qagentic.configure(
    project_name="my-project",
    environment="staging",
    api_url="https://api.qagentic.io",
    api_key="your-api-key",
    output_dir="./qagentic-results",
    ai_analysis=True,
    screenshots="on_failure",
    videos="on_failure",
)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_name` | `str` | `"default"` | Project identifier |
| `environment` | `str` | `"local"` | Environment name (local, staging, production) |
| `api_url` | `str` | `None` | QAagentic API endpoint |
| `api_key` | `str` | `None` | API authentication key |
| `output_dir` | `str` | `"./qagentic-results"` | Local output directory |
| `ai_analysis` | `bool` | `True` | Enable AI-powered analysis |
| `screenshots` | `str` | `"on_failure"` | Screenshot capture mode |
| `videos` | `str` | `"on_failure"` | Video capture mode |

---

### Decorators

#### `@feature(name: str)`

Group tests by feature.

```python
from qagentic import feature

@feature("User Authentication")
def test_login():
    pass
```

#### `@story(name: str)`

Group tests by user story.

```python
from qagentic import story

@story("Login with valid credentials")
def test_valid_login():
    pass
```

#### `@epic(name: str)`

Group tests by epic.

```python
from qagentic import epic

@epic("User Management")
def test_user_creation():
    pass
```

#### `@severity(level: Severity)`

Set test severity level.

```python
from qagentic import severity, Severity

@severity(Severity.CRITICAL)
def test_payment_processing():
    pass
```

**Severity Levels:**

| Level | Value | Description |
|-------|-------|-------------|
| `Severity.BLOCKER` | `"blocker"` | System is unusable |
| `Severity.CRITICAL` | `"critical"` | Major feature is broken |
| `Severity.NORMAL` | `"normal"` | Standard priority |
| `Severity.MINOR` | `"minor"` | Minor issue |
| `Severity.TRIVIAL` | `"trivial"` | Cosmetic issue |

#### `@tag(*tags: str)`

Add tags to a test.

```python
from qagentic import tag

@tag("smoke", "regression", "priority-high")
def test_critical_flow():
    pass
```

#### `@owner(name: str)`

Set test owner.

```python
from qagentic import owner

@owner("john.doe@company.com")
def test_feature():
    pass
```

#### `@link(url: str, name: str = None, link_type: str = "link")`

Add external link.

```python
from qagentic import link

@link("https://docs.example.com/feature", "Documentation")
def test_feature():
    pass
```

#### `@issue(url: str, name: str = None)`

Link to issue tracker.

```python
from qagentic import issue

@issue("https://jira.company.com/browse/PROJ-123", "PROJ-123")
def test_bugfix():
    pass
```

#### `@testcase(url: str, name: str = None)`

Link to test management system.

```python
from qagentic import testcase

@testcase("https://testrail.company.com/index.php?/cases/view/456", "TC-456")
def test_requirement():
    pass
```

#### `@description(text: str)`

Add detailed description.

```python
from qagentic import description

@description("""
This test verifies the complete checkout flow including:
- Cart validation
- Payment processing
- Order confirmation
""")
def test_checkout():
    pass
```

#### `@title(name: str)`

Override test title.

```python
from qagentic import title

@title("Verify user can complete purchase with credit card")
def test_checkout_credit_card():
    pass
```

#### `@label(name: str, value: str)`

Add custom label.

```python
from qagentic import label

@label("sprint", "2024-Q4-S3")
@label("priority", "P1")
def test_feature():
    pass
```

---

### Step Context Manager

#### `step(name: str, description: str = None)`

Create a test step.

```python
from qagentic import step

def test_example():
    with step("Step 1: Setup"):
        # Setup code
        pass
    
    with step("Step 2: Action", "Perform the main action"):
        # Action code
        pass
    
    with step("Step 3: Verify"):
        # Verification code
        pass
```

**Step Object Methods:**

| Method | Description |
|--------|-------------|
| `attach(data, name, type)` | Attach data to step |
| `attach_screenshot(path, name)` | Attach screenshot |
| `attach_json(data, name)` | Attach JSON data |
| `attach_text(text, name)` | Attach plain text |
| `set_parameter(name, value)` | Set step parameter |

```python
with step("Verify API response") as s:
    response = api.get("/users")
    s.attach_json(response.json(), "API Response")
    s.set_parameter("status_code", response.status_code)
    assert response.status_code == 200
```

---

### Attachments

#### `attach(data, name: str, attachment_type: str = None)`

Attach data to current test or step.

```python
from qagentic import attach

# Attach file
attach("path/to/file.log", "Application Logs")

# Attach binary data
attach(screenshot_bytes, "Screenshot", "image/png")

# Attach text
attach("Error details here", "Error Info", "text/plain")
```

#### `attach_file(path: str, name: str = None)`

Attach a file.

```python
from qagentic import attach_file

attach_file("logs/app.log", "Application Log")
attach_file("data/test-data.csv", "Test Data")
```

#### `attach_screenshot(path: str, name: str = "Screenshot")`

Attach a screenshot image.

```python
from qagentic import attach_screenshot

attach_screenshot("screenshots/login-page.png", "Login Page")
```

#### `attach_json(data: dict, name: str = "JSON Data")`

Attach JSON data.

```python
from qagentic import attach_json

attach_json({
    "request": {"method": "POST", "url": "/api/users"},
    "response": {"status": 201, "body": {"id": 123}}
}, "API Transaction")
```

#### `attach_text(text: str, name: str = "Text")`

Attach plain text.

```python
from qagentic import attach_text

attach_text("Console output:\n> Starting server...\n> Ready", "Console Log")
```

#### `attach_html(html: str, name: str = "HTML")`

Attach HTML content.

```python
from qagentic import attach_html

attach_html("<h1>Test Report</h1><p>All tests passed</p>", "Summary")
```

#### `attach_video(path: str, name: str = "Video")`

Attach video recording.

```python
from qagentic import attach_video

attach_video("recordings/test-run.mp4", "Test Recording")
```

#### `attach_csv(data: list, name: str = "CSV Data")`

Attach CSV data.

```python
from qagentic import attach_csv

attach_csv([
    ["Name", "Email", "Status"],
    ["John", "john@example.com", "Active"],
    ["Jane", "jane@example.com", "Pending"]
], "User Data")
```

---

## JavaScript/TypeScript API

### Configuration

#### `configure(options)`

Configure QAagentic SDK.

```typescript
import { configure } from '@qagentic/reporter';

configure({
  projectName: 'my-project',
  environment: 'staging',
  apiUrl: 'https://api.qagentic.io',
  apiKey: 'your-api-key',
  outputDir: './qagentic-results',
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectName` | `string` | `"default"` | Project identifier |
| `environment` | `string` | `"local"` | Environment name |
| `apiUrl` | `string` | `undefined` | API endpoint |
| `apiKey` | `string` | `undefined` | API key |
| `outputDir` | `string` | `"./qagentic-results"` | Output directory |

---

### Step Function

#### `step(name, fn)` / `step(name, description, fn)`

Create a test step.

```typescript
import { step } from '@qagentic/reporter';

// Synchronous
step('Click button', () => {
  button.click();
});

// Asynchronous
await step('Fetch data', async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// With description
step('Verify result', 'Check that the result matches expected value', () => {
  expect(result).toBe(expected);
});
```

---

### Decorators

#### `@feature(name)`

```typescript
import { feature } from '@qagentic/reporter';

@feature('Authentication')
class AuthTests {
  // tests
}
```

#### `@story(name)`

```typescript
import { story } from '@qagentic/reporter';

@story('User Login')
class LoginTests {
  // tests
}
```

#### `@severity(level)`

```typescript
import { severity, Severity } from '@qagentic/reporter';

@severity(Severity.CRITICAL)
class CriticalTests {
  // tests
}
```

#### `@tag(...tags)`

```typescript
import { tag } from '@qagentic/reporter';

@tag('smoke', 'regression')
class SmokeTests {
  // tests
}
```

---

### Attachments

#### `attach(data, name, type?)`

```typescript
import { attach } from '@qagentic/reporter';

attach(fileContent, 'Log File', 'text/plain');
attach(imageBuffer, 'Screenshot', 'image/png');
```

#### `attachScreenshot(pathOrData, name?)`

```typescript
import { attachScreenshot } from '@qagentic/reporter';

attachScreenshot('path/to/screenshot.png', 'Login Page');
attachScreenshot(screenshotBuffer, 'Error State');
```

#### `attachJson(data, name?)`

```typescript
import { attachJson } from '@qagentic/reporter';

attachJson({ status: 'success', data: result }, 'API Response');
```

#### `attachText(text, name?)`

```typescript
import { attachText } from '@qagentic/reporter';

attachText('Console output here', 'Logs');
```

---

### Enums

#### `Severity`

```typescript
import { Severity } from '@qagentic/reporter';

Severity.BLOCKER   // 'blocker'
Severity.CRITICAL  // 'critical'
Severity.NORMAL    // 'normal'
Severity.MINOR     // 'minor'
Severity.TRIVIAL   // 'trivial'
```

#### `Status`

```typescript
import { Status } from '@qagentic/reporter';

Status.PASSED   // 'passed'
Status.FAILED   // 'failed'
Status.BROKEN   // 'broken'
Status.SKIPPED  // 'skipped'
Status.PENDING  // 'pending'
```

---

## Framework-Specific APIs

### Cypress Plugin

```javascript
// cypress.config.js
const { qagentic } = require('@qagentic/reporter/cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      qagentic(on, config, {
        projectName: 'my-project',
        environment: 'ci',
        apiUrl: 'https://api.qagentic.io',
        apiKey: process.env.QAGENTIC_API_KEY,
        outputDir: './qagentic-results',
        screenshotsOnFailure: true,
        videosOnFailure: true,
      });
      return config;
    },
  },
});
```

### Playwright Reporter

```typescript
// playwright.config.ts
import { qagenticReporter } from '@qagentic/reporter/playwright';

export default defineConfig({
  reporter: [
    ['html'],
    qagenticReporter({
      projectName: 'my-project',
      environment: 'ci',
      apiUrl: 'https://api.qagentic.io',
      apiKey: process.env.QAGENTIC_API_KEY,
      outputDir: './qagentic-results',
    }),
  ],
});
```

### Jest Reporter

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['@qagentic/reporter/jest', {
      projectName: 'my-project',
      environment: 'ci',
      apiUrl: 'https://api.qagentic.io',
      apiKey: process.env.QAGENTIC_API_KEY,
      outputDir: './qagentic-results',
    }],
  ],
};
```

---

## Type Definitions

### TestResult

```typescript
interface TestResult {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  status: Status;
  startTime?: Date;
  endTime?: Date;
  durationMs: number;
  errorMessage?: string;
  errorType?: string;
  stackTrace?: string;
  labels: TestLabels;
  links: TestLink[];
  parameters: Record<string, unknown>;
  steps: StepResult[];
  attachments: Attachment[];
  filePath?: string;
  lineNumber?: number;
  retryCount: number;
  isRetry: boolean;
  isFlaky: boolean;
}
```

### StepResult

```typescript
interface StepResult {
  id: string;
  name: string;
  status: Status;
  startTime?: Date;
  endTime?: Date;
  durationMs: number;
  error?: string;
  errorTrace?: string;
  attachments: Attachment[];
  children: StepResult[];
  parameters: Record<string, unknown>;
}
```

### Attachment

```typescript
interface Attachment {
  id: string;
  name: string;
  type: string;
  extension?: string;
  content: string;
  size: number;
  timestamp: string;
}
```

### TestLabels

```typescript
interface TestLabels {
  feature?: string;
  story?: string;
  epic?: string;
  severity?: Severity;
  tags?: string[];
  owner?: string;
  layer?: string;
  suite?: string;
  [key: string]: unknown;
}
```
