# Jest Integration Guide

Complete guide for using QAagentic with Jest.

---

## Installation

```bash
npm install @qagentic/reporter --save-dev
```

**Requirements:**
- Node.js 16+
- Jest 29+

---

## Setup

### Configure Reporter

Update your `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  
  reporters: [
    'default',
    ['@qagentic/reporter/jest', {
      projectName: 'my-jest-project',
      environment: process.env.CI ? 'ci' : 'local',
      apiUrl: process.env.QAGENTIC_API_URL,
      apiKey: process.env.QAGENTIC_API_KEY,
      outputDir: './qagentic-results',
    }],
  ],
};
```

### TypeScript Configuration

For TypeScript projects, update `jest.config.ts`:

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  reporters: [
    'default',
    ['@qagentic/reporter/jest', {
      projectName: 'my-jest-project',
      environment: process.env.CI ? 'ci' : 'local',
      apiUrl: process.env.QAGENTIC_API_URL,
      apiKey: process.env.QAGENTIC_API_KEY,
      outputDir: './qagentic-results',
    }],
  ],
};

export default config;
```

---

## Usage Examples

### Basic Test with Steps

```javascript
// tests/calculator.test.js
import { step, attachJson } from '@qagentic/reporter/jest';

describe('Calculator', () => {
  describe('Addition', () => {
    it('should add two positive numbers', () => {
      step('Prepare test data', () => {
        const a = 5;
        const b = 3;
        attachJson({ a, b }, 'Input Values');
      });

      step('Perform calculation', () => {
        const result = 5 + 3;
        expect(result).toBe(8);
      });

      step('Verify result', () => {
        attachJson({ result: 8, expected: 8 }, 'Calculation Result');
      });
    });

    it('should add negative numbers', () => {
      step('Calculate with negative numbers', () => {
        const result = -5 + -3;
        expect(result).toBe(-8);
      });
    });
  });

  describe('Division', () => {
    it('should divide two numbers', () => {
      step('Perform division', () => {
        const result = 10 / 2;
        expect(result).toBe(5);
      });
    });

    it('should throw error for division by zero', () => {
      step('Attempt division by zero', () => {
        expect(() => {
          const result = 10 / 0;
          if (!isFinite(result)) throw new Error('Division by zero');
        }).toThrow('Division by zero');
      });
    });
  });
});
```

### API Testing

```javascript
// tests/api.test.js
import { step, attachJson } from '@qagentic/reporter/jest';

describe('User API', () => {
  let userId;

  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should create a new user', async () => {
    await step('Send POST request to create user', async () => {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com'
        })
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      userId = data.id;
      
      attachJson(data, 'Create User Response');
    });
  });

  it('should retrieve the created user', async () => {
    await step('Send GET request for user', async () => {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.name).toBe('Test User');
      
      attachJson(data, 'Get User Response');
    });
  });

  it('should update user details', async () => {
    await step('Send PUT request to update user', async () => {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated User'
        })
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.name).toBe('Updated User');
      
      attachJson(data, 'Update User Response');
    });
  });

  it('should delete the user', async () => {
    await step('Send DELETE request', async () => {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE'
      });

      expect(response.status).toBe(204);
    });
  });
});
```

### Unit Testing with Mocks

```javascript
// tests/userService.test.js
import { step, attachJson } from '@qagentic/reporter/jest';
import { UserService } from '../src/services/UserService';
import { UserRepository } from '../src/repositories/UserRepository';

jest.mock('../src/repositories/UserRepository');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = new UserRepository();
    userService = new UserService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      step('Setup mock repository', () => {
        mockUserRepository.create.mockResolvedValue({
          id: '123',
          ...userData,
          createdAt: new Date()
        });
      });

      await step('Call createUser service method', async () => {
        const result = await userService.createUser(userData);
        
        attachJson(result, 'Created User');
        
        expect(result.id).toBe('123');
        expect(result.name).toBe('John Doe');
      });

      step('Verify repository was called correctly', () => {
        expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
        expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      });
    });

    it('should throw error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      await step('Attempt to create user with invalid email', async () => {
        await expect(userService.createUser(userData))
          .rejects
          .toThrow('Invalid email format');
      });

      step('Verify repository was not called', () => {
        expect(mockUserRepository.create).not.toHaveBeenCalled();
      });
    });
  });
});
```

### Async Testing

```javascript
// tests/async.test.js
import { step, attachJson } from '@qagentic/reporter/jest';

describe('Async Operations', () => {
  it('should handle promises', async () => {
    await step('Execute async operation', async () => {
      const result = await new Promise((resolve) => {
        setTimeout(() => resolve({ status: 'success' }), 100);
      });
      
      expect(result.status).toBe('success');
      attachJson(result, 'Async Result');
    });
  });

  it('should handle async/await', async () => {
    const fetchData = async () => {
      return { data: [1, 2, 3] };
    };

    await step('Fetch data asynchronously', async () => {
      const result = await fetchData();
      expect(result.data).toHaveLength(3);
      attachJson(result, 'Fetched Data');
    });
  });

  it('should handle rejected promises', async () => {
    const failingOperation = async () => {
      throw new Error('Operation failed');
    };

    await step('Handle rejected promise', async () => {
      await expect(failingOperation()).rejects.toThrow('Operation failed');
    });
  });
});
```

### Parameterized Tests

```javascript
// tests/validation.test.js
import { step, attachJson } from '@qagentic/reporter/jest';

describe('Email Validation', () => {
  const validEmails = [
    'user@example.com',
    'user.name@example.com',
    'user+tag@example.com',
    'user@subdomain.example.com',
  ];

  const invalidEmails = [
    'invalid',
    '@example.com',
    'user@',
    'user@.com',
    'user@example',
  ];

  describe.each(validEmails)('valid email: %s', (email) => {
    it('should accept valid email', () => {
      step(`Validate email: ${email}`, () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
        attachJson({ email, isValid }, 'Validation Result');
      });
    });
  });

  describe.each(invalidEmails)('invalid email: %s', (email) => {
    it('should reject invalid email', () => {
      step(`Validate email: ${email}`, () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
        attachJson({ email, isValid }, 'Validation Result');
      });
    });
  });
});
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectName` | `string` | `"jest-project"` | Project identifier |
| `environment` | `string` | `"local"` | Environment name |
| `apiUrl` | `string` | `undefined` | QAagentic API endpoint |
| `apiKey` | `string` | `undefined` | API authentication key |
| `outputDir` | `string` | `"./qagentic-results"` | Output directory |

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Jest Tests

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
      
      - name: Run Jest tests
        run: npm test
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
jest:
  image: node:20
  stage: test
  script:
    - npm ci
    - npm test
  variables:
    QAGENTIC_API_URL: $QAGENTIC_API_URL
    QAGENTIC_API_KEY: $QAGENTIC_API_KEY
    QAGENTIC_ENVIRONMENT: ci
  artifacts:
    when: always
    paths:
      - qagentic-results/
    reports:
      junit: qagentic-results/junit.xml
```

---

## Best Practices

### 1. Organize Tests Logically

```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw error for invalid email', () => {});
  });

  describe('updateUser', () => {
    it('should update user details', () => {});
    it('should throw error for non-existent user', () => {});
  });
});
```

### 2. Use Meaningful Step Names

```javascript
// ❌ Bad
step('Step 1', () => {});

// ✅ Good
step('Validate user input against schema', () => {});
```

### 3. Attach Evidence

```javascript
it('should process order', async () => {
  await step('Submit order', async () => {
    const result = await orderService.submit(orderData);
    attachJson(result, 'Order Submission Result');
    expect(result.status).toBe('confirmed');
  });
});
```

### 4. Use Setup and Teardown

```javascript
describe('Database Tests', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  beforeEach(async () => {
    await database.clear();
  });

  // Tests...
});
```
