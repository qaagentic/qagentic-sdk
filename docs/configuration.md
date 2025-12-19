# Configuration Guide

Complete guide to configuring QAagentic SDK for your project.

---

## Configuration Methods

QAagentic supports multiple configuration methods, applied in this order of precedence:

1. **Programmatic configuration** (highest priority)
2. **Environment variables**
3. **Configuration file** (`qagentic.yaml`)
4. **Default values** (lowest priority)

---

## Configuration File

Create a `qagentic.yaml` file in your project root:

```yaml
# QAagentic SDK Configuration
# Version: 1.0.0

#──────────────────────────────────────────────────────────────────────────────
# Project Settings
#──────────────────────────────────────────────────────────────────────────────
project:
  # Project name - used for grouping test runs
  name: my-awesome-project
  
  # Environment name - supports variable substitution
  environment: ${QAGENTIC_ENVIRONMENT:-local}

#──────────────────────────────────────────────────────────────────────────────
# Reporting Configuration
#──────────────────────────────────────────────────────────────────────────────
reporting:
  # API Reporting - sends results to QAagentic server
  api:
    enabled: true
    url: https://api.qagentic.io
    key: ${QAGENTIC_API_KEY}
    
    # Connection settings
    timeout: 30000        # Request timeout in milliseconds
    retry_count: 3        # Number of retries on failure
    batch_size: 100       # Number of results to batch before sending
  
  # Local Reporting - generates files on disk
  local:
    enabled: true
    output_dir: ./qagentic-results
    
    # Output formats to generate
    formats:
      - json              # Machine-readable JSON
      - html              # Interactive HTML report
      - junit             # JUnit XML for CI/CD
    
    # Clean output directory before each run
    clean_on_start: true

#──────────────────────────────────────────────────────────────────────────────
# Feature Flags
#──────────────────────────────────────────────────────────────────────────────
features:
  # AI-powered root cause analysis
  ai_analysis: true
  
  # Group related failures into clusters
  failure_clustering: true
  
  # Detect and flag flaky tests
  flaky_detection: true
  
  # Screenshot capture mode: always | on_failure | never
  screenshots: on_failure
  
  # Video capture mode: always | on_failure | never
  videos: on_failure
  
  # Print results to console
  console_output: true

#──────────────────────────────────────────────────────────────────────────────
# Default Labels
#──────────────────────────────────────────────────────────────────────────────
labels:
  # Team name
  team: platform
  
  # Component being tested
  component: authentication
  
  # Custom labels (key-value pairs)
  custom:
    sprint: "2024-Q4-S3"
    priority: high
    release: "1.0.0"
```

### File Locations

QAagentic searches for configuration files in this order:

1. `qagentic.yaml`
2. `qagentic.yml`
3. `.qagentic.yaml`
4. `.qagentic.yml`
5. `config/qagentic.yaml`

---

## Environment Variables

All configuration options can be set via environment variables:

### Project Settings

```bash
# Project name
QAGENTIC_PROJECT_NAME=my-project

# Environment (local, staging, production, ci)
QAGENTIC_ENVIRONMENT=staging
```

### API Reporting

```bash
# Enable/disable API reporting
QAGENTIC_API_ENABLED=true

# API endpoint URL
QAGENTIC_API_URL=https://api.qagentic.io

# API authentication key
QAGENTIC_API_KEY=your-secret-api-key

# Request timeout (milliseconds)
QAGENTIC_API_TIMEOUT=30000

# Retry count on failure
QAGENTIC_API_RETRY_COUNT=3
```

### Local Reporting

```bash
# Enable/disable local file reporting
QAGENTIC_LOCAL_ENABLED=true

# Output directory
QAGENTIC_OUTPUT_DIR=./qagentic-results

# Output formats (comma-separated)
QAGENTIC_OUTPUT_FORMAT=json,html,junit

# Clean output directory on start
QAGENTIC_CLEAN_ON_START=true
```

### Feature Flags

```bash
# Enable AI analysis
QAGENTIC_AI_ANALYSIS=true

# Enable failure clustering
QAGENTIC_FAILURE_CLUSTERING=true

# Enable flaky test detection
QAGENTIC_FLAKY_DETECTION=true

# Screenshot mode: always | on_failure | never
QAGENTIC_SCREENSHOTS=on_failure

# Video mode: always | on_failure | never
QAGENTIC_VIDEOS=on_failure

# Console output
QAGENTIC_CONSOLE_OUTPUT=true
```

### Labels

```bash
# Team name
QAGENTIC_TEAM=platform

# Component name
QAGENTIC_COMPONENT=auth
```

### Debug Mode

```bash
# Enable debug logging
QAGENTIC_DEBUG=true
```

---

## Programmatic Configuration

### Python

```python
import qagentic

# Full configuration
qagentic.configure(
    project_name="my-project",
    environment="staging",
    
    # API settings
    api_url="https://api.qagentic.io",
    api_key="your-api-key",
    api_enabled=True,
    api_timeout=30000,
    
    # Local settings
    output_dir="./qagentic-results",
    local_enabled=True,
    output_formats=["json", "html", "junit"],
    clean_on_start=True,
    
    # Features
    ai_analysis=True,
    failure_clustering=True,
    flaky_detection=True,
    screenshots="on_failure",
    videos="on_failure",
    console_output=True,
    
    # Labels
    team="platform",
    component="auth",
    labels={
        "sprint": "2024-Q4",
        "priority": "high"
    }
)
```

### JavaScript/TypeScript

```typescript
import { configure } from '@qagentic/reporter';

configure({
  projectName: 'my-project',
  environment: 'staging',
  
  // API settings
  api: {
    enabled: true,
    url: 'https://api.qagentic.io',
    key: 'your-api-key',
    timeout: 30000,
    retryCount: 3,
    batchSize: 100,
  },
  
  // Local settings
  local: {
    enabled: true,
    outputDir: './qagentic-results',
    formats: ['json', 'html', 'junit'],
    cleanOnStart: true,
  },
  
  // Features
  features: {
    aiAnalysis: true,
    failureClustering: true,
    flakyDetection: true,
    screenshots: 'on_failure',
    videos: 'on_failure',
    consoleOutput: true,
  },
  
  // Labels
  labels: {
    team: 'platform',
    component: 'auth',
    custom: {
      sprint: '2024-Q4',
      priority: 'high',
    },
  },
});
```

---

## Environment-Specific Configuration

### Using Variable Substitution

```yaml
# qagentic.yaml
project:
  name: my-project
  environment: ${CI_ENVIRONMENT:-local}

reporting:
  api:
    enabled: ${CI:-false}
    url: ${QAGENTIC_API_URL:-http://localhost:8080}
    key: ${QAGENTIC_API_KEY}
```

### Multiple Configuration Files

Create environment-specific files:

```
config/
├── qagentic.yaml           # Base configuration
├── qagentic.local.yaml     # Local development
├── qagentic.ci.yaml        # CI/CD
└── qagentic.production.yaml # Production
```

Load specific configuration:

```bash
# Set config file via environment variable
QAGENTIC_CONFIG=config/qagentic.ci.yaml pytest --qagentic
```

---

## CI/CD Configuration

### GitHub Actions

```yaml
# .github/workflows/test.yml
env:
  QAGENTIC_PROJECT_NAME: ${{ github.repository }}
  QAGENTIC_ENVIRONMENT: ci
  QAGENTIC_API_URL: ${{ secrets.QAGENTIC_API_URL }}
  QAGENTIC_API_KEY: ${{ secrets.QAGENTIC_API_KEY }}
  QAGENTIC_OUTPUT_DIR: ./qagentic-results
```

### GitLab CI

```yaml
# .gitlab-ci.yml
variables:
  QAGENTIC_PROJECT_NAME: $CI_PROJECT_NAME
  QAGENTIC_ENVIRONMENT: ci
  QAGENTIC_API_URL: $QAGENTIC_API_URL
  QAGENTIC_API_KEY: $QAGENTIC_API_KEY
```

### Jenkins

```groovy
// Jenkinsfile
environment {
    QAGENTIC_PROJECT_NAME = "${env.JOB_NAME}"
    QAGENTIC_ENVIRONMENT = 'ci'
    QAGENTIC_API_URL = credentials('qagentic-api-url')
    QAGENTIC_API_KEY = credentials('qagentic-api-key')
}
```

---

## Configuration Reference

### Complete Option List

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `project_name` | string | `"default"` | Project identifier |
| `environment` | string | `"local"` | Environment name |
| `api_enabled` | boolean | `true` | Enable API reporting |
| `api_url` | string | `null` | API endpoint URL |
| `api_key` | string | `null` | API authentication key |
| `api_timeout` | number | `30000` | Request timeout (ms) |
| `api_retry_count` | number | `3` | Retry count |
| `api_batch_size` | number | `100` | Batch size |
| `local_enabled` | boolean | `true` | Enable local reporting |
| `output_dir` | string | `"./qagentic-results"` | Output directory |
| `output_formats` | array | `["json", "html"]` | Output formats |
| `clean_on_start` | boolean | `true` | Clean output on start |
| `ai_analysis` | boolean | `true` | Enable AI analysis |
| `failure_clustering` | boolean | `true` | Enable clustering |
| `flaky_detection` | boolean | `true` | Enable flaky detection |
| `screenshots` | string | `"on_failure"` | Screenshot mode |
| `videos` | string | `"on_failure"` | Video mode |
| `console_output` | boolean | `true` | Enable console output |
| `team` | string | `null` | Team label |
| `component` | string | `null` | Component label |

### Screenshot/Video Modes

| Mode | Description |
|------|-------------|
| `always` | Capture for every test |
| `on_failure` | Capture only when test fails |
| `never` | Never capture |

---

## Validation

QAagentic validates configuration on startup. Invalid configurations will log warnings:

```
⚠️ QAagentic Configuration Warning:
  - api_url is set but api_key is missing
  - output_dir './invalid/path' does not exist
```

### Debug Configuration

Enable debug mode to see resolved configuration:

```bash
QAGENTIC_DEBUG=true pytest --qagentic
```

Output:
```
🔧 QAagentic Configuration:
  project_name: my-project
  environment: ci
  api_enabled: true
  api_url: https://api.qagentic.io
  output_dir: ./qagentic-results
  ...
```
