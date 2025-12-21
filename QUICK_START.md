# QAagentic Quick Start - 3 Simple Steps

Get QAagentic running in your project in under 2 minutes. No complex configuration needed.

## Step 1: Install (30 seconds)

```bash
pip install qagentic-pytest
```

## Step 2: Initialize (30 seconds)

```bash
qagentic init --name "My Project" --framework pytest
```

That's it! This command automatically:
- ✅ Creates `.qagentic/config.json`
- ✅ Generates `pytest.ini` with correct settings
- ✅ Creates `conftest.py` with QAagentic hooks
- ✅ Sets up API and local reporting

## Step 3: Run Tests (as usual)

```bash
pytest tests/ -v
```

Results automatically appear in:
- 📊 **Portal**: http://localhost:3000
- 📁 **Local**: `./qagentic-results/`

---

## That's All!

No manual configuration files. No complex setup. Just run your tests and see results.

### Optional: Add Test Decorators (for richer reporting)

```python
from qagentic import feature, story, severity, Severity

@feature("Authentication")
@story("User Login")
@severity(Severity.CRITICAL)
def test_login():
    assert True
```

### Troubleshooting

```bash
# Check if QAagentic is properly configured
qagentic status

# Run health check
qagentic doctor
```

---

## Comparison: QAagentic vs Others

| Feature | QAagentic | Allure | ReportPortal |
|---------|-----------|--------|--------------|
| **Setup Time** | 2 minutes | 10+ minutes | 30+ minutes |
| **One-Command Init** | ✅ | ❌ | ❌ |
| **Zero Config** | ✅ | ❌ | ❌ |
| **AI Root Cause** | ✅ | ❌ | ❌ |
| **Failure Clustering** | ✅ | ❌ | ⚠️ |
| **Flaky Detection** | ✅ | ❌ | ✅ |

---

## Next Steps

- 📖 [Full Documentation](./docs)
- 🎯 [Best Practices](./docs#best-practices)
- 🔧 [Advanced Configuration](./docs#configuration)
- 💬 [Community Support](./docs#resources)
