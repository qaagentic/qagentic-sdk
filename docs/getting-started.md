# Getting Started with QAagentic SDK

Get up and running with QAagentic in under 5 minutes.

---

## Prerequisites

### For Python Projects
- Python 3.8 or higher
- pytest 7.0 or higher (for pytest integration)
- pip or poetry for package management

### For JavaScript/TypeScript Projects
- Node.js 16 or higher
- npm, yarn, or pnpm
- One of: Cypress 12+, Playwright 1.40+, or Jest 29+

---

## Installation

### Python

```bash
# Using pip
pip install qagentic-pytest

# Using poetry
poetry add qagentic-pytest --group dev

# Using pipenv
pipenv install qagentic-pytest --dev
```

### JavaScript/TypeScript

```bash
# Using npm
npm install @qagentic/reporter --save-dev

# Using yarn
yarn add @qagentic/reporter --dev

# Using pnpm
pnpm add @qagentic/reporter --save-dev
```

---

## Your First Test with QAagentic

### Python Example

Create a test file `test_example.py`:

```python
"""Example test demonstrating QAagentic features."""
from qagentic import feature, story, severity, Severity, step, attach_json

@feature("Calculator")
@story("Basic Operations")
@severity(Severity.NORMAL)
def test_addition():
    """Test that addition works correctly."""
    
    with step("Prepare test data"):
        a = 5
        b = 3
        expected = 8
    
    with step("Perform calculation"):
        result = a + b
        attach_json({"a": a, "b": b, "result": result}, "Calculation Details")
    
    with step("Verify result"):
        assert result == expected, f"Expected {expected}, got {result}"


@feature("Calculator")
@story("Basic Operations")
@severity(Severity.CRITICAL)
def test_division():
    """Test that division works correctly."""
    
    with step("Perform division"):
        result = 10 / 2
    
    with step("Verify result"):
        assert result == 5.0


@feature("Calculator")
@story("Error Handling")
@severity(Severity.BLOCKER)
def test_division_by_zero():
    """Test that division by zero raises an error."""
    
    with step("Attempt division by zero"):
        try:
            result = 10 / 0
            assert False, "Should have raised ZeroDivisionError"
        except ZeroDivisionError:
            pass  # Expected behavior
```

Run the tests:

```bash
pytest test_example.py --qagentic -v
```

### Cypress Example

Create a test file `cypress/e2e/example.cy.js`:

```javascript
import { step, feature, story, severity } from '@qagentic/reporter/cypress';

describe('Calculator App', () => {
  beforeEach(() => {
    cy.visit('/calculator');
  });

  it('should perform addition correctly', () => {
    step('Enter first number', () => {
      cy.get('#num1').type('5');
    });

    step('Enter second number', () => {
      cy.get('#num2').type('3');
    });

    step('Click add button', () => {
      cy.get('#add').click();
    });

    step('Verify result', () => {
      cy.get('#result').should('have.text', '8');
    });
  });

  it('should handle division by zero', () => {
    step('Enter numerator', () => {
      cy.get('#num1').type('10');
    });

    step('Enter zero as denominator', () => {
      cy.get('#num2').type('0');
    });

    step('Click divide button', () => {
      cy.get('#divide').click();
    });

    step('Verify error message', () => {
      cy.get('#error').should('be.visible');
      cy.get('#error').should('contain', 'Cannot divide by zero');
    });
  });
});
```

### Playwright Example

Create a test file `tests/example.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { step } from '@qagentic/reporter/playwright';

test.describe('Calculator App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator');
  });

  test('should perform addition correctly', async ({ page }) => {
    await step('Enter first number', async () => {
      await page.fill('#num1', '5');
    });

    await step('Enter second number', async () => {
      await page.fill('#num2', '3');
    });

    await step('Click add button', async () => {
      await page.click('#add');
    });

    await step('Verify result', async () => {
      await expect(page.locator('#result')).toHaveText('8');
    });
  });
});
```

---

## Understanding the Output

After running your tests, QAagentic generates reports in the `qagentic-results` directory:

```
qagentic-results/
├── run.json           # Complete test run data
├── junit.xml          # JUnit XML for CI/CD
├── tests/
│   ├── test_001.json  # Individual test results
│   ├── test_002.json
│   └── ...
└── attachments/       # Screenshots, logs, etc.
```

### Console Output

```
============================================================
🚀 QAagentic Test Run - my-project
Environment: local
============================================================

  ✓ test_addition
  ✓ test_division
  ✓ test_division_by_zero

============================================================
✅ Test Run Complete - 100.0% Pass Rate
Passed: 3 | Failed: 0 | Skipped: 0
============================================================
```

---

## Next Steps

1. **[Configuration Guide](./configuration.md)** - Learn how to customize QAagentic
2. **[API Reference](./api-reference.md)** - Explore all available functions
3. **[CI/CD Integration](./ci-cd.md)** - Set up automated reporting
4. **[AI Features](./ai-features.md)** - Leverage AI-powered insights

---

## Need Help?

- Check our [Troubleshooting Guide](./troubleshooting.md)
- Join our [Discord Community](https://discord.gg/qagentic)
- Open an issue on [GitHub](https://github.com/qagentic/qagentic-sdk/issues)
